package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Signature;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignatureRepository extends JpaRepository<Signature, Long> {
    Optional<Signature> findByVehicleSessionId(Long vehicleSessionId);
}
