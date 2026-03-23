package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.MatsTracking;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatsTrackingRepository extends JpaRepository<MatsTracking, Long> {
    Optional<MatsTracking> findByVehicleSessionId(Long vehicleSessionId);
}
