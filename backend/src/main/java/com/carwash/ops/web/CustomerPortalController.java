package com.carwash.ops.web;

import com.carwash.ops.dto.session.VehicleSessionResponse;
import com.carwash.ops.dto.session.SignatureRequest;
import com.carwash.ops.service.SessionService;
import com.carwash.ops.dto.common.SelectOptionDto;
import com.carwash.ops.dto.admin.ServiceAdminDTO;
import com.carwash.ops.service.ReferenceService;
import com.carwash.ops.service.PricingService;
import com.carwash.ops.service.OtpService;
import com.carwash.ops.domain.entity.ServiceTypeEntity;
import com.carwash.ops.domain.entity.PricingEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portal/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow access from anywhere for the portal
public class CustomerPortalController {

    private final SessionService sessionService;
    private final ReferenceService referenceService;
    private final PricingService pricingService;
    private final OtpService otpService;

    @GetMapping("/branches")
    public List<SelectOptionDto> getBranches() {
        return referenceService.getBranches();
    }

    @GetMapping("/services")
    public List<ServiceAdminDTO.ServiceTypeResponse> getServices() {
        return pricingService.getAllServiceTypes(true).stream()
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/services/{serviceId}/pricing")
    public List<ServiceAdminDTO.PricingResponse> getPricing(@PathVariable Long serviceId) {
        return pricingService.getPricingByServiceType(serviceId).stream()
                .map(this::mapToPricingResponse)
                .collect(Collectors.toList());
    }

    private ServiceAdminDTO.ServiceTypeResponse mapToServiceResponse(ServiceTypeEntity entity) {
        return ServiceAdminDTO.ServiceTypeResponse.builder()
                .id(entity.getId())
                .serviceName(entity.getServiceName())
                .description(entity.getDescription())
                .basePrice(entity.getBasePrice())
                .durationMinutes(entity.getDurationMinutes())
                .category(entity.getCategory())
                .isFeatured(entity.getIsFeatured())
                .active(entity.isActive())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    private ServiceAdminDTO.PricingResponse mapToPricingResponse(PricingEntity entity) {
        return ServiceAdminDTO.PricingResponse.builder()
                .id(entity.getId())
                .serviceTypeId(entity.getServiceType() != null ? entity.getServiceType().getId() : null)
                .serviceName(entity.getServiceType() != null ? entity.getServiceType().getServiceName() : null)
                .vehicleCategory(entity.getVehicleCategory())
                .price(entity.getPrice())
                .active(entity.isActive())
                .build();
    }

    @GetMapping("/find")
    public VehicleSessionResponse findActiveSession(
            @RequestParam String reg,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email) {
        if (email != null && !email.isBlank()) {
            return sessionService.findActiveByRegistrationAndEmail(reg, email);
        }
        return sessionService.findActiveByRegistrationAndPhone(reg, phone);
    }

    @PostMapping("/auth/send-otp")
    public void sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email != null && !email.isBlank()) {
            otpService.generateAndSendOtp(email);
        }
    }

    @PostMapping("/auth/verify-otp")
    public VehicleSessionResponse verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String reg = body.get("reg");

        boolean isValid = otpService.verifyOtp(email, code);
        if (!isValid) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid or expired OTP");
        }

        return sessionService.findActiveByRegistrationAndEmail(reg, email);
    }

    @GetMapping("/{token}")
    public VehicleSessionResponse getSessionByToken(@PathVariable String token) {
        return sessionService.findByPortalToken(token);
    }

    @PostMapping("/{token}/sign")
    public VehicleSessionResponse signSession(@PathVariable String token, @RequestBody SignatureRequest request) {
        VehicleSessionResponse session = sessionService.findByPortalToken(token);
        return sessionService.captureSignature(session.id(), request, "CUSTOMER_PORTAL");
    }

    @PostMapping("/{token}/pay")
    public VehicleSessionResponse paySession(@PathVariable String token) {
        VehicleSessionResponse session = sessionService.findByPortalToken(token);
        return sessionService.processPayment(session.id(), "CUSTOMER_PORTAL");
    }

    @PostMapping("/book")
    public VehicleSessionResponse bookSession(@RequestBody com.carwash.ops.dto.session.CreateVehicleSessionRequest request) {
        return sessionService.book(request);
    }
}
