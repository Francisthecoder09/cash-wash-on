package com.carwash.ops.service.impl;

import com.carwash.ops.domain.entity.PricingEntity;
import com.carwash.ops.domain.entity.ServiceTypeEntity;
import com.carwash.ops.domain.entity.Branch;
import com.carwash.ops.dto.admin.ServiceAdminDTO;
import com.carwash.ops.common.ApiException;
import com.carwash.ops.repository.BranchRepository;
import com.carwash.ops.repository.PricingEntityRepository;
import com.carwash.ops.repository.ServiceTypeEntityRepository;
import com.carwash.ops.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private final ServiceTypeEntityRepository serviceTypeRepository;
    private final PricingEntityRepository pricingRepository;
    private final BranchRepository branchRepository;

    @Override
    @Transactional
    public ServiceTypeEntity createServiceType(ServiceAdminDTO.CreateServiceRequest request) {
        if (serviceTypeRepository.existsByServiceName(request.getServiceName())) {
            throw new IllegalArgumentException("Service Type name already exists");
        }

        ServiceTypeEntity serviceType = ServiceTypeEntity.builder()
                .serviceName(request.getServiceName())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .durationMinutes(request.getDurationMinutes())
                .category(request.getCategory())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .branch(resolveBranch(request.getBranchId()))
                .active(true)
                .build();

        return serviceTypeRepository.save(serviceType);
    }

    @Override
    @Transactional
    public ServiceTypeEntity updateServiceType(Long id, ServiceAdminDTO.UpdateServiceRequest request) {
        ServiceTypeEntity serviceType = getServiceTypeById(id);
        
        serviceType.setServiceName(request.getServiceName());
        serviceType.setDescription(request.getDescription());
        serviceType.setBasePrice(request.getBasePrice());
        serviceType.setDurationMinutes(request.getDurationMinutes());
        serviceType.setCategory(request.getCategory());
        serviceType.setBranch(resolveBranch(request.getBranchId()));

        return serviceTypeRepository.save(serviceType);
    }

    @Override
    @Transactional
    public void deleteServiceType(Long id) {
        ServiceTypeEntity serviceType = getServiceTypeById(id);
        serviceType.setActive(false);
        serviceTypeRepository.save(serviceType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceTypeEntity> getAllServiceTypes(boolean activeOnly) {
        if (activeOnly) {
            return serviceTypeRepository.findByActiveTrue();
        }
        return serviceTypeRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceTypeEntity> getServiceTypesByCategory(String category, boolean activeOnly) {
        return getAllServiceTypes(activeOnly).stream()
                .filter(service -> service.getCategory() != null)
                .filter(service -> service.getCategory().equalsIgnoreCase(category))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceTypeEntity> getServiceTypesByCategoryAndBranch(String category, Long branchId, boolean activeOnly) {
        return getServiceTypesByCategory(category, activeOnly).stream()
                .filter(service -> service.getBranch() == null || (branchId != null && service.getBranch().getId().equals(branchId)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceTypeEntity getServiceTypeById(Long id) {
        return serviceTypeRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("ServiceType not found with id: " + id));
    }

    @Override
    @Transactional
    public PricingEntity createPricing(ServiceAdminDTO.CreatePricingRequest request) {
        ServiceTypeEntity serviceType = getServiceTypeById(request.getServiceTypeId());

        PricingEntity pricing = PricingEntity.builder()
                .serviceType(serviceType)
                .vehicleCategory(request.getVehicleCategory())
                .price(request.getPrice())
                .discountPercentage(request.getDiscountPercentage())
                .effectiveFrom(request.getEffectiveFrom() != null ? request.getEffectiveFrom() : LocalDateTime.now())
                .effectiveUntil(request.getEffectiveUntil())
                .active(true)
                .build();

        return pricingRepository.save(pricing);
    }

    @Override
    @Transactional
    public PricingEntity updatePricing(Long id, ServiceAdminDTO.UpdatePricingRequest request) {
        PricingEntity pricing = pricingRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pricing not found with id: " + id));

        pricing.setPrice(request.getPrice());
        pricing.setDiscountPercentage(request.getDiscountPercentage());

        return pricingRepository.save(pricing);
    }

    @Override
    @Transactional
    public void deletePricing(Long id) {
        PricingEntity pricing = pricingRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pricing not found with id: " + id));
        pricing.setActive(false);
        pricingRepository.save(pricing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PricingEntity> getPricingByServiceType(Long serviceTypeId) {
        return pricingRepository.findByServiceTypeId(serviceTypeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PricingEntity> getAllPricing(boolean activeOnly) {
        if (activeOnly) {
            return pricingRepository.findByActiveTrue();
        }
        return pricingRepository.findAll();
    }

    private Branch resolveBranch(Long branchId) {
        if (branchId == null) {
            return null;
        }
        return branchRepository.findById(branchId)
                .orElseThrow(() -> ApiException.notFound("Branch not found with id: " + branchId));
    }
}
