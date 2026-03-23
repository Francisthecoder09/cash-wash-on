package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PricingRepository extends JpaRepository<Pricing, Long> {

    @Query("SELECT p FROM Pricing p WHERE p.serviceType.id = :serviceTypeId AND p.vehicleCategory = :vehicleCategory AND p.active = true")
    Optional<Pricing> findActiveByServiceTypeAndCategory(@Param("serviceTypeId") Long serviceTypeId,
            @Param("vehicleCategory") String vehicleCategory);

    List<Pricing> findByActiveTrue();

    List<Pricing> findByServiceTypeId(Long serviceTypeId);

    List<Pricing> findByVehicleCategory(String vehicleCategory);
}
