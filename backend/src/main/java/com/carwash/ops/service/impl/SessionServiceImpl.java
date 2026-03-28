package com.carwash.ops.service.impl;

import com.carwash.ops.common.ApiException;
import com.carwash.ops.domain.entity.Branch;
import com.carwash.ops.domain.entity.Inspection;
import com.carwash.ops.domain.entity.Lane;
import com.carwash.ops.domain.entity.MatsTracking;
import com.carwash.ops.domain.entity.Signature;
import com.carwash.ops.domain.entity.Staff;
import com.carwash.ops.domain.entity.User;
import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.domain.enums.AuditAction;
import com.carwash.ops.domain.enums.SessionStatus;
import com.carwash.ops.dto.session.CreateVehicleSessionRequest;
import com.carwash.ops.dto.session.InspectionRequest;
import com.carwash.ops.dto.session.MatsTrackingRequest;
import com.carwash.ops.dto.session.RealtimeSessionEvent;
import com.carwash.ops.dto.session.SessionActionRequest;
import com.carwash.ops.dto.session.SignatureRequest;
import com.carwash.ops.dto.session.VehicleHistoryResponse;
import com.carwash.ops.dto.session.VehicleSessionDetailResponse;
import com.carwash.ops.dto.session.VehicleSessionResponse;
import com.carwash.ops.repository.BranchRepository;
import com.carwash.ops.repository.InspectionRepository;
import com.carwash.ops.repository.LaneRepository;
import com.carwash.ops.repository.MatsTrackingRepository;
import com.carwash.ops.repository.SignatureRepository;
import com.carwash.ops.repository.StaffRepository;
import com.carwash.ops.repository.UserRepository;
import com.carwash.ops.repository.VehicleSessionRepository;
import com.carwash.ops.service.AuditService;
import com.carwash.ops.service.CustomerService;
import com.carwash.ops.service.SessionService;
import com.carwash.ops.service.NotificationService;
import com.carwash.ops.domain.entity.Customer;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SessionServiceImpl implements SessionService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SessionServiceImpl.class);

    private final VehicleSessionRepository vehicleSessionRepository;
    private final BranchRepository branchRepository;
    private final LaneRepository laneRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final MatsTrackingRepository matsTrackingRepository;
    private final SignatureRepository signatureRepository;
    private final InspectionRepository inspectionRepository;
    private final AuditService auditService;
    private final CustomerService customerService;
    private final SimpMessagingTemplate messagingTemplate;
    private final List<NotificationService> notificationServices;

    public SessionServiceImpl(
            VehicleSessionRepository vehicleSessionRepository,
            BranchRepository branchRepository,
            LaneRepository laneRepository,
            UserRepository userRepository,
            StaffRepository staffRepository,
            MatsTrackingRepository matsTrackingRepository,
            SignatureRepository signatureRepository,
            InspectionRepository inspectionRepository,
            AuditService auditService,
            CustomerService customerService,
            SimpMessagingTemplate messagingTemplate,
            List<NotificationService> notificationServices
    ) {
        this.vehicleSessionRepository = vehicleSessionRepository;
        this.branchRepository = branchRepository;
        this.laneRepository = laneRepository;
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.matsTrackingRepository = matsTrackingRepository;
        this.signatureRepository = signatureRepository;
        this.inspectionRepository = inspectionRepository;
        this.auditService = auditService;
        this.customerService = customerService;
        this.messagingTemplate = messagingTemplate;
        this.notificationServices = notificationServices;
    }

    @Override
    @Transactional
    public VehicleSessionResponse create(CreateVehicleSessionRequest request, String username) {
        if (request.sourceRequestId() != null && !request.sourceRequestId().isBlank()) {
            var existing = vehicleSessionRepository.findBySourceRequestId(request.sourceRequestId());
            if (existing.isPresent()) {
                return map(existing.get());
            }
        }
        String normalizedRegistration = request.registrationNumber().trim().toUpperCase();
        String normalizedPhone = blankToNull(request.customerPhone() == null ? null : request.customerPhone().trim());
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Branch not found"));
        validateNoDuplicateActiveSession(request.branchId(), normalizedRegistration, normalizedPhone);
        User cashier = getUserByUsername(username);
        VehicleSession session = new VehicleSession();
        session.setBranch(branch);
        session.setCashierUser(cashier);
        session.setRegistrationNumber(normalizedRegistration);
        session.setCustomerName(request.customerName());
        session.setCustomerPhone(normalizedPhone);
        session.setVehicleType(request.vehicleType());
        session.setServicePackage(request.servicePackage());
        session.setStatus(SessionStatus.REGISTERED);
        session.setSourceRequestId(blankToNull(request.sourceRequestId()));
        session.setPrice(request.estimatedPrice() != null ? request.estimatedPrice() : 0.0);
        session.setPaid(false);
        session.setAppointmentAt(request.appointmentAt());
        session.setRegisteredAt(Instant.now());
        session.setPortalToken(UUID.randomUUID().toString());

        // Customer CRM Logic
        if (request.customerPhone() != null && !request.customerPhone().isBlank()) {
            Customer customer = customerService.getOrCreateCustomer(
                    request.customerPhone(),
                    request.customerName(),
                    request.customerEmail());
            session.setCustomer(customer);
        }
        if (request.laneId() != null) {
            session.setLane(getLane(request.laneId()));
        }
        VehicleSession saved = vehicleSessionRepository.save(session);
        auditService.log(cashier, saved, AuditAction.CREATE, "Vehicle session registered", "{\"status\":\"REGISTERED\"}");
        publish("SESSION_CREATED", saved);
        
        notificationServices.forEach(service -> service.sendBookingConfirmation(saved));
        
        return map(saved);
    }

    @Override
    public List<VehicleSessionResponse> list(Long branchId, SessionStatus status) {
        return vehicleSessionRepository.findFiltered(branchId, status).stream().map(this::map).toList();
    }

    @Override
    @Transactional
    public VehicleSessionResponse startWash(Long sessionId, SessionActionRequest request, String username) {
        VehicleSession session = getSession(sessionId);
        requireStatus(session, SessionStatus.REGISTERED);
        session.setStatus(SessionStatus.WASHING);
        session.setWashingStartedAt(Instant.now());
        session.setDelayReason(blankToNull(request.delayReason()));
        if (request.laneId() != null) {
            session.setLane(getLane(request.laneId()));
        }
        if (request.operatorStaffId() != null) {
            session.setOperatorStaff(getStaff(request.operatorStaffId()));
        }
        VehicleSession saved = vehicleSessionRepository.save(session);
        User actor = getUserByUsername(username);
        auditService.log(actor, saved, AuditAction.SESSION_TRANSITION, "Session moved to WASHING", null);
        publish("SESSION_UPDATED", saved);
        return map(saved);
    }

    @Override
    @Transactional
    public VehicleSessionResponse recordMats(Long sessionId, MatsTrackingRequest request, String username) {
        VehicleSession session = getSession(sessionId);
        if (session.getStatus() == SessionStatus.REGISTERED) {
            throw new ApiException(HttpStatus.CONFLICT, "Start wash before recording mats");
        }
        MatsTracking matsTracking = matsTrackingRepository.findByVehicleSessionId(sessionId).orElseGet(MatsTracking::new);
        matsTracking.setVehicleSession(session);
        matsTracking.setMatsRemoved(request.matsRemoved());
        matsTracking.setMatsReinstalled(request.matsReinstalled());
        matsTracking.setConditionNotes(request.conditionNotes());
        matsTrackingRepository.save(matsTracking);
        if (session.getStatus() == SessionStatus.WASHING) {
            session.setStatus(SessionStatus.INTERIOR);
            session.setInteriorStartedAt(Instant.now());
        }
        VehicleSession saved = vehicleSessionRepository.save(session);
        User actor = getUserByUsername(username);
        auditService.log(actor, saved, AuditAction.UPDATE, "Mats recorded", null);
        publish("SESSION_UPDATED", saved);
        return map(saved);
    }

    @Override
    @Transactional
    public VehicleSessionResponse captureSignature(Long sessionId, SignatureRequest request, String username) {
        VehicleSession session = getSession(sessionId);
        if (session.getStatus().ordinal() < SessionStatus.INTERIOR.ordinal()) {
            throw new ApiException(HttpStatus.CONFLICT, "Signature can only be captured during interior or later");
        }
        Signature signature = signatureRepository.findByVehicleSessionId(sessionId).orElseGet(Signature::new);
        signature.setVehicleSession(session);
        signature.setSignedBy(request.signedBy());
        signature.setSignatureDataUrl(request.signatureDataUrl());
        signature.setSignatureDataUrl(request.signatureDataUrl());
        signatureRepository.save(signature);
        
        User actor = !"CUSTOMER_PORTAL".equals(username) ? getUserByUsername(username) : null;
        auditService.log(actor, session, AuditAction.UPDATE, "Signature captured via " + username, null);
        publish("SESSION_UPDATED", session);
        return map(session);
    }

    @Override
    @Transactional
    public VehicleSessionResponse inspect(Long sessionId, InspectionRequest request, String username) {
        VehicleSession session = getSession(sessionId);
        if (session.getStatus().ordinal() < SessionStatus.INTERIOR.ordinal()) {
            throw new ApiException(HttpStatus.CONFLICT, "Inspection can only happen after interior");
        }
        session.setStatus(SessionStatus.INSPECTION);
        if (session.getInspectionStartedAt() == null) {
            session.setInspectionStartedAt(Instant.now());
        }
        Inspection inspection = inspectionRepository.findByVehicleSessionId(sessionId).orElseGet(Inspection::new);
        inspection.setVehicleSession(session);
        inspection.setInspectorStaff(getStaff(request.inspectorStaffId()));
        inspection.setBodyCheckPassed(request.bodyCheckPassed());
        inspection.setInteriorCheckPassed(request.interiorCheckPassed());
        inspection.setNotes(request.notes());
        inspectionRepository.save(inspection);
        VehicleSession saved = vehicleSessionRepository.save(session);
        User actor = getUserByUsername(username);
        auditService.log(actor, saved, AuditAction.UPDATE, "Inspection recorded", null);
        publish("SESSION_UPDATED", saved);
        return map(saved);
    }

    @Override
    @Transactional
    public VehicleSessionResponse complete(Long sessionId, String username) {
        VehicleSession session = getSession(sessionId);
        requireStatus(session, SessionStatus.INSPECTION);
        inspectionRepository.findByVehicleSessionId(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "Inspection must be captured before completion"));
        session.setStatus(SessionStatus.COMPLETED);
        session.setCompletedAt(Instant.now());
        VehicleSession saved = vehicleSessionRepository.save(session);

        // Update customer loyalty on completion
        if (saved.getCustomer() != null) {
            customerService.updateCustomerVisit(saved.getCustomer().getId(), saved.getRegistrationNumber());
        }

        User actor = getUserByUsername(username);
        auditService.log(actor, saved, AuditAction.SESSION_TRANSITION, "Session completed", null);
        publish("SESSION_UPDATED", saved);

        notificationServices.forEach(service -> service.sendSessionComplete(saved));

        return map(saved);
    }

    @Override
    @Transactional
    public VehicleSessionResponse processPayment(Long sessionId, String username) {
        log.info("Processing payment for session ID: {}", sessionId);
        VehicleSession session = getSession(sessionId);
        session.setPaid(true);
        VehicleSession saved = vehicleSessionRepository.save(session);
        
        User actor = !"CUSTOMER_PORTAL".equals(username) ? getUserByUsername(username) : null;
        auditService.log(actor, saved, AuditAction.UPDATE, "Payment processed via " + username, null);
        publish("SESSION_UPDATED", saved);

        notificationServices.forEach(service -> service.sendSessionPaymentReceipt(saved));

        return map(saved);
    }

    @Override
    public VehicleHistoryResponse searchByRegistration(String registrationNumber) {
        String normalized = registrationNumber.trim().toUpperCase();
        List<VehicleSessionDetailResponse> history = vehicleSessionRepository.findByRegistrationNumberOrderByCreatedAtDesc(normalized)
                .stream()
                .map(session -> {
                    var mats = matsTrackingRepository.findByVehicleSessionId(session.getId()).orElse(null);
                    var sig = signatureRepository.findByVehicleSessionId(session.getId()).orElse(null);
                    var inspection = inspectionRepository.findByVehicleSessionId(session.getId()).orElse(null);
                    return new VehicleSessionDetailResponse(
                            session.getId(),
                            session.getBranch().getName(),
                            session.getLane() == null ? null : session.getLane().getLaneName(),
                            session.getOperatorStaff() == null ? null : session.getOperatorStaff().getFullName(),
                            session.getServicePackage(),
                            session.getStatus().name(),
                            session.getPrice(),
                            session.getPaid(),
                            session.getRegisteredAt(),
                            session.getCompletedAt(),
                            mats == null ? null : new VehicleSessionDetailResponse.MatsTrackingView(mats.getMatsRemoved(), mats.getMatsReinstalled(), mats.getConditionNotes()),
                            sig == null ? null : new VehicleSessionDetailResponse.SignatureView(sig.getSignedBy(), sig.getCreatedAt()),
                            inspection == null ? null : new VehicleSessionDetailResponse.InspectionView(inspection.isBodyCheckPassed(), inspection.isInteriorCheckPassed(), inspection.getNotes(), inspection.getCreatedAt())
                    );
                })
                .collect(Collectors.toList());
        return new VehicleHistoryResponse(normalized, history);
    }

    private VehicleSession getSession(Long id) {
        return vehicleSessionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Vehicle session not found"));
    }

    private Lane getLane(Long id) {
        return laneRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Lane not found"));
    }

    private Staff getStaff(Long id) {
        return staffRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff not found"));
    }

    private User getUserByUsername(String username) {
        return userRepository.findByEmailAndActiveTrue(username)
                .or(() -> userRepository.findByUsernameAndActiveTrue(username))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void requireStatus(VehicleSession session, SessionStatus expected) {
        if (session.getStatus() != expected) {
            throw new ApiException(HttpStatus.CONFLICT, "Session must be in state " + expected);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private void validateNoDuplicateActiveSession(Long branchId, String registrationNumber, String customerPhone) {
        if (customerPhone == null) {
            return;
        }

        boolean duplicateExists = !vehicleSessionRepository
                .findActiveDuplicateForBranch(branchId, registrationNumber, customerPhone)
                .isEmpty();

        if (duplicateExists) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "An active session already exists for this registration number and phone number in the selected branch");
        }
    }

    private VehicleSessionResponse map(VehicleSession session) {
        VehicleSessionResponse.CustomerProfileView customerProfile = null;
        List<VehicleSessionResponse.CustomerHistoryItem> recentSessions = List.of();

        if (session.getCustomer() != null) {
            customerProfile = new VehicleSessionResponse.CustomerProfileView(
                    session.getCustomer().getTotalVisits(),
                    session.getCustomer().getLoyaltyPoints(),
                    resolveLoyaltyTier(session.getCustomer()),
                    session.getCustomer().getLastVehicleRegistration());

            recentSessions = vehicleSessionRepository.findTop6ByCustomerIdOrderByCreatedAtDesc(session.getCustomer().getId())
                    .stream()
                    .filter(item -> !item.getId().equals(session.getId()))
                    .limit(5)
                    .map(item -> new VehicleSessionResponse.CustomerHistoryItem(
                            item.getId(),
                            item.getRegistrationNumber(),
                            item.getServicePackage(),
                            item.getStatus(),
                            item.getPrice(),
                            item.getPaid(),
                            item.getAppointmentAt(),
                            item.getCompletedAt(),
                            item.getCreatedAt()))
                    .toList();
        }

        return new VehicleSessionResponse(
                session.getId(),
                session.getRegistrationNumber(),
                session.getCustomerName(),
                session.getCustomerPhone(),
                session.getCustomer() == null ? null : session.getCustomer().getEmail(),
                session.getVehicleType(),
                session.getServicePackage(),
                session.getStatus(),
                session.getDelayReason(),
                session.getPrice(),
                session.getPaid(),
                session.getPortalToken(),
                session.getBranch().getId(),
                session.getBranch().getName(),
                session.getLane() == null ? null : session.getLane().getId(),
                session.getLane() == null ? null : session.getLane().getLaneName(),
                session.getCashierUser().getId(),
                session.getOperatorStaff() == null ? null : session.getOperatorStaff().getId(),
                session.getOperatorStaff() == null ? null : session.getOperatorStaff().getFullName(),
                session.getAppointmentAt(),
                session.getRegisteredAt(),
                session.getWashingStartedAt(),
                session.getInteriorStartedAt(),
                session.getInspectionStartedAt(),
                session.getCompletedAt(),
                session.getCreatedAt(),
                session.getUpdatedAt(),
                customerProfile,
                recentSessions
        );
    }

    @Override
    public VehicleSessionResponse findByPortalToken(String token) {
        VehicleSession session = vehicleSessionRepository.findByPortalToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invalid portal token"));
        return map(session);
    }

    @Override
    public VehicleSessionResponse findActiveByRegistrationAndPhone(String reg, String phone) {
        List<VehicleSession> sessions = vehicleSessionRepository.findActiveByRegistrationAndPhone(reg.trim().toUpperCase(), phone.trim());
        if (sessions.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No active session found for this vehicle and phone number");
        }
        return map(sessions.get(0));
    }

    @Override
    public VehicleSessionResponse findActiveByRegistrationAndEmail(String reg, String email) {
        List<VehicleSession> sessions = vehicleSessionRepository.findActiveByRegistrationAndEmail(
                reg.trim().toUpperCase(),
                email.trim());
        if (sessions.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No active session found for this vehicle and email address");
        }
        return map(sessions.get(0));
    }

    @Override
    @Transactional
    public VehicleSessionResponse book(CreateVehicleSessionRequest request) {
        // Portal bookings use the 'portal' system user as the registrant
        return create(request, "portal");
    }

    private void publish(String type, VehicleSession session) {

        log.info("Publishing realtime event {} for session {}", type, session.getId());
        messagingTemplate.convertAndSend("/topic/sessions", new RealtimeSessionEvent(type, map(session)));
    }

    private String resolveLoyaltyTier(Customer customer) {
        int visits = customer.getTotalVisits() == null ? 0 : customer.getTotalVisits();
        int points = customer.getLoyaltyPoints() == null ? 0 : customer.getLoyaltyPoints();

        if (visits >= 12 || points >= 120) {
            return "Platinum";
        }
        if (visits >= 6 || points >= 60) {
            return "Gold";
        }
        if (visits >= 3 || points >= 30) {
            return "Silver";
        }
        return "Starter";
    }
}
