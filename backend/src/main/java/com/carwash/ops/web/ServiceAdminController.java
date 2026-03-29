package com.carwash.ops.web;

import com.carwash.ops.domain.entity.PricingEntity;
import com.carwash.ops.domain.entity.ServiceTypeEntity;
import com.carwash.ops.dto.admin.ServiceAdminDTO;
import com.carwash.ops.service.PricingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER')") // Restrict all service pricing management to Admins/Managers
public class ServiceAdminController {

    private final PricingService pricingService;

    public ServiceAdminController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    // ==================== SERVICE TYPES ====================

    @PostMapping("/services")
    public ResponseEntity<ServiceAdminDTO.ServiceTypeResponse> createServiceType(
            @RequestBody ServiceAdminDTO.CreateServiceRequest request) {
        ServiceTypeEntity saved = pricingService.createServiceType(request);
        return new ResponseEntity<>(mapToServiceResponse(saved), HttpStatus.CREATED);
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceAdminDTO.ServiceTypeResponse> updateServiceType(
            @PathVariable Long id, @RequestBody ServiceAdminDTO.UpdateServiceRequest request) {
        ServiceTypeEntity updated = pricingService.updateServiceType(id, request);
        return ResponseEntity.ok(mapToServiceResponse(updated));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteServiceType(@PathVariable Long id) {
        pricingService.deleteServiceType(id);
        return ResponseEntity.noContent().build();
    }

    // Publicly accessible for creating sessions (Cashiers)
    @GetMapping("/services")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR')")
    public ResponseEntity<List<ServiceAdminDTO.ServiceTypeResponse>> getAllServiceTypes(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<ServiceTypeEntity> services = pricingService.getAllServiceTypes(activeOnly);
        return ResponseEntity.ok(services.stream().map(this::mapToServiceResponse).collect(Collectors.toList()));
    }

    // ==================== PRICING ====================

    @PostMapping("/pricing")
    public ResponseEntity<ServiceAdminDTO.PricingResponse> createPricing(
            @RequestBody ServiceAdminDTO.CreatePricingRequest request) {
        PricingEntity saved = pricingService.createPricing(request);
        return new ResponseEntity<>(mapToPricingResponse(saved), HttpStatus.CREATED);
    }

    @PutMapping("/pricing/{id}")
    public ResponseEntity<ServiceAdminDTO.PricingResponse> updatePricing(
            @PathVariable Long id, @RequestBody ServiceAdminDTO.UpdatePricingRequest request) {
        PricingEntity updated = pricingService.updatePricing(id, request);
        return ResponseEntity.ok(mapToPricingResponse(updated));
    }

    @DeleteMapping("/pricing/{id}")
    public ResponseEntity<Void> deletePricing(@PathVariable Long id) {
        pricingService.deletePricing(id);
        return ResponseEntity.noContent().build();
    }

    // Publicly accessible for creating sessions (Cashiers)
    @GetMapping("/services/{serviceId}/pricing")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR')")
    public ResponseEntity<List<ServiceAdminDTO.PricingResponse>> getPricingByService(
            @PathVariable Long serviceId) {
        List<PricingEntity> pricingList = pricingService.getPricingByServiceType(serviceId);
        return ResponseEntity.ok(pricingList.stream().map(this::mapToPricingResponse).collect(Collectors.toList()));
    }

    @GetMapping("/pricing")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER')")
    public ResponseEntity<List<ServiceAdminDTO.PricingResponse>> getAllPricing(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        List<PricingEntity> pricingList = pricingService.getAllPricing(activeOnly);
        return ResponseEntity.ok(pricingList.stream().map(this::mapToPricingResponse).collect(Collectors.toList()));
    }

    // ==================== MAPPERS ====================

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
                .discountPercentage(entity.getDiscountPercentage())
                .active(entity.isActive())
                .effectiveFrom(entity.getEffectiveFrom())
                .effectiveUntil(entity.getEffectiveUntil())
                .build();
    }
}
