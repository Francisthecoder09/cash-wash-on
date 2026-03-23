package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Inspection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    Optional<Inspection> findByVehicleSessionId(Long vehicleSessionId);
}
