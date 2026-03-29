package com.carwash.ops.web;

import com.carwash.ops.domain.enums.SessionStatus;
import com.carwash.ops.dto.session.CreateVehicleSessionRequest;
import com.carwash.ops.dto.session.InspectionRequest;
import com.carwash.ops.dto.session.MatsTrackingRequest;
import com.carwash.ops.dto.session.PaymentRequest;
import com.carwash.ops.dto.session.SessionActionRequest;
import com.carwash.ops.dto.session.SessionMessageRequest;
import com.carwash.ops.dto.session.SessionMessageResponse;
import com.carwash.ops.dto.session.SessionPaymentResponse;
import com.carwash.ops.dto.session.SignatureRequest;
import com.carwash.ops.dto.session.VehicleHistoryResponse;
import com.carwash.ops.dto.session.VehicleSessionResponse;
import com.carwash.ops.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    // READ — available to all roles including AUDITOR
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public List<VehicleSessionResponse> list(@RequestParam(required = false) Long branchId,
                                             @RequestParam(required = false) SessionStatus status) {
        return sessionService.list(branchId, status);
    }

    // WRITE — CASHIER creates sessions
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER')")
    public VehicleSessionResponse create(@Valid @RequestBody CreateVehicleSessionRequest request, Principal principal) {
        return sessionService.create(request, principal.getName());
    }

    // WRITE — LANE_OPERATOR manages wash operations
    @PostMapping("/{sessionId}/start-wash")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','LANE_OPERATOR')")
    public VehicleSessionResponse startWash(@PathVariable Long sessionId,
                                            @Valid @RequestBody SessionActionRequest request,
                                            Principal principal) {
        return sessionService.startWash(sessionId, request, principal.getName());
    }

    @PostMapping("/{sessionId}/record-mats")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','LANE_OPERATOR')")
    public VehicleSessionResponse recordMats(@PathVariable Long sessionId,
                                             @Valid @RequestBody MatsTrackingRequest request,
                                             Principal principal) {
        return sessionService.recordMats(sessionId, request, principal.getName());
    }

    @PostMapping("/{sessionId}/capture-signature")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','LANE_OPERATOR')")
    public VehicleSessionResponse captureSignature(@PathVariable Long sessionId,
                                                   @Valid @RequestBody SignatureRequest request,
                                                   Principal principal) {
        return sessionService.captureSignature(sessionId, request, principal.getName());
    }

    // WRITE — INSPECTOR only
    @PostMapping("/{sessionId}/inspect")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','INSPECTOR')")
    public VehicleSessionResponse inspect(@PathVariable Long sessionId,
                                          @Valid @RequestBody InspectionRequest request,
                                          Principal principal) {
        return sessionService.inspect(sessionId, request, principal.getName());
    }

    @PostMapping("/{sessionId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','INSPECTOR')")
    public VehicleSessionResponse complete(@PathVariable Long sessionId, Principal principal) {
        return sessionService.complete(sessionId, principal.getName());
    }

    @PostMapping("/{sessionId}/pay")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER')")
    public VehicleSessionResponse pay(@PathVariable Long sessionId,
                                      @Valid @RequestBody PaymentRequest request,
                                      Principal principal) {
        return sessionService.processPayment(sessionId, request, principal.getName());
    }

    // READ — available to all roles including AUDITOR
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public VehicleHistoryResponse search(@RequestParam String registrationNumber) {
        return sessionService.searchByRegistration(registrationNumber);
    }

    @GetMapping("/{sessionId}/messages")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public List<SessionMessageResponse> listMessages(@PathVariable Long sessionId) {
        return sessionService.listMessages(sessionId);
    }

    @PostMapping("/{sessionId}/messages")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR')")
    public SessionMessageResponse sendMessage(@PathVariable Long sessionId,
                                              @Valid @RequestBody SessionMessageRequest request,
                                              Principal principal) {
        return sessionService.sendStaffMessage(sessionId, request, principal.getName());
    }

    @GetMapping("/{sessionId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public List<SessionPaymentResponse> listPayments(@PathVariable Long sessionId) {
        return sessionService.listPayments(sessionId);
    }
}
