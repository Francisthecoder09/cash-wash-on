package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.PricingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PricingEntityRepository extends JpaRepository<PricingEntity, Long> {

    @Query("SELECT p FROM PricingEntity p WHERE p.serviceType.id = :serviceTypeId AND p.vehicleCategory = :vehicleCategory AND p.active = true")
    Optional<PricingEntity> findActiveByServiceTypeAndCategory(@Param("serviceTypeId") Long serviceTypeId,
            @Param("vehicleCategory") String vehicleCategory);

    List<PricingEntity> findByActiveTrue();

    List<PricingEntity> findByServiceTypeId(Long serviceTypeId);

    List<PricingEntity> findByVehicleCategory(String vehicleCategory);
}
