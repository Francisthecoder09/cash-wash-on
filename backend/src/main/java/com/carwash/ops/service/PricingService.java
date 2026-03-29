package com.carwash.ops.service;

import com.carwash.ops.domain.entity.PricingEntity;
import com.carwash.ops.domain.entity.ServiceTypeEntity;
import com.carwash.ops.dto.admin.ServiceAdminDTO;

import java.util.List;

public interface PricingService {
    // ServiceType Operations
    ServiceTypeEntity createServiceType(ServiceAdminDTO.CreateServiceRequest request);
    ServiceTypeEntity updateServiceType(Long id, ServiceAdminDTO.UpdateServiceRequest request);
    void deleteServiceType(Long id);
    List<ServiceTypeEntity> getAllServiceTypes(boolean activeOnly);
    List<ServiceTypeEntity> getServiceTypesByCategory(String category, boolean activeOnly);
    List<ServiceTypeEntity> getServiceTypesByCategoryAndBranch(String category, Long branchId, boolean activeOnly);
    ServiceTypeEntity getServiceTypeById(Long id);

    // Pricing Operations
    PricingEntity createPricing(ServiceAdminDTO.CreatePricingRequest request);
    PricingEntity updatePricing(Long id, ServiceAdminDTO.UpdatePricingRequest request);
    void deletePricing(Long id);
    List<PricingEntity> getPricingByServiceType(Long serviceTypeId);
    List<PricingEntity> getAllPricing(boolean activeOnly);
}
