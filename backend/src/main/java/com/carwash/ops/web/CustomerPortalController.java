package com.carwash.ops.web;

import com.carwash.ops.dto.session.VehicleSessionResponse;
import com.carwash.ops.dto.session.SessionMessageRequest;
import com.carwash.ops.dto.session.SessionMessageResponse;
import com.carwash.ops.dto.session.PaymentRequest;
import com.carwash.ops.dto.session.SessionPaymentResponse;
import com.carwash.ops.dto.session.SignatureRequest;
import com.carwash.ops.dto.customer.CustomerRegistrationRequest;
import com.carwash.ops.dto.customer.CustomerRegistrationResponse;
import com.carwash.ops.dto.customer.CustomerAccountLoginRequest;
import com.carwash.ops.dto.customer.CustomerAccountLoginResponse;
import com.carwash.ops.dto.customer.CustomerDashboardResponse;
import com.carwash.ops.service.SessionService;
import com.carwash.ops.dto.common.SelectOptionDto;
import com.carwash.ops.dto.admin.ServiceAdminDTO;
import com.carwash.ops.service.CustomerService;
import com.carwash.ops.service.ReferenceService;
import com.carwash.ops.service.PricingService;
import com.carwash.ops.service.OtpService;
import com.carwash.ops.domain.entity.ServiceTypeEntity;
import com.carwash.ops.domain.entity.PricingEntity;
import jakarta.validation.Valid;
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
    private final CustomerService customerService;
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
                .filter(service -> service.getCategory() == null || !"ADDON".equalsIgnoreCase(service.getCategory()))
                .map(this::mapToServiceResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/add-ons")
    public List<ServiceAdminDTO.ServiceTypeResponse> getAddOns(@RequestParam(required = false) Long branchId) {
        return pricingService.getServiceTypesByCategoryAndBranch("ADDON", branchId, true).stream()
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
                .branchId(entity.getBranch() != null ? entity.getBranch().getId() : null)
                .branchName(entity.getBranch() != null ? entity.getBranch().getName() : null)
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

    @GetMapping("/auth/mock-latest")
    public Map<String, String> getLatestMockOtp(@RequestParam String email) {
        return otpService.getLatestMockOtp(email)
                .map(code -> Map.of("code", code))
                .orElse(Map.of());
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

    @PostMapping("/customers/register")
    public CustomerRegistrationResponse registerCustomer(@RequestBody CustomerRegistrationRequest request) {
        var customer = customerService.registerCustomer(request);
        return new CustomerRegistrationResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getUsername(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getTotalVisits(),
                customer.getLoyaltyPoints()
        );
    }

    @PostMapping("/customers/login")
    public CustomerAccountLoginResponse loginCustomer(@RequestBody CustomerAccountLoginRequest request) {
        return customerService.loginCustomer(request);
    }

    @GetMapping("/customers/dashboard")
    public CustomerDashboardResponse getCustomerDashboard(
            @RequestParam String username,
            @RequestParam String email) {
        return customerService.getCustomerDashboard(username, email);
    }

    @GetMapping("/{token}")
    public VehicleSessionResponse getSessionByToken(@PathVariable String token) {
        return sessionService.findByPortalToken(token);
    }

    @GetMapping("/{token}/messages")
    public List<SessionMessageResponse> getMessages(@PathVariable String token) {
        return sessionService.listMessagesByPortalToken(token);
    }

    @PostMapping("/{token}/messages")
    public SessionMessageResponse sendMessage(@PathVariable String token, @Valid @RequestBody SessionMessageRequest request) {
        return sessionService.sendCustomerMessage(token, request);
    }

    @GetMapping("/{token}/payments")
    public List<SessionPaymentResponse> getPayments(@PathVariable String token) {
        return sessionService.listPaymentsByPortalToken(token);
    }

    @PostMapping("/{token}/sign")
    public VehicleSessionResponse signSession(@PathVariable String token, @RequestBody SignatureRequest request) {
        VehicleSessionResponse session = sessionService.findByPortalToken(token);
        return sessionService.captureSignature(session.id(), request, "CUSTOMER_PORTAL");
    }

    @PostMapping("/{token}/pay")
    public VehicleSessionResponse paySession(@PathVariable String token, @Valid @RequestBody PaymentRequest request) {
        VehicleSessionResponse session = sessionService.findByPortalToken(token);
        return sessionService.processPayment(session.id(), request, "CUSTOMER_PORTAL");
    }

    @PostMapping("/book")
    public VehicleSessionResponse bookSession(@RequestBody com.carwash.ops.dto.session.CreateVehicleSessionRequest request) {
        return sessionService.book(request);
    }
}
