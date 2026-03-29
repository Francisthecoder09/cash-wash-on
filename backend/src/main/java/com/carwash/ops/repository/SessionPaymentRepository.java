package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.SessionPayment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionPaymentRepository extends JpaRepository<SessionPayment, Long> {
    @Query("""
            select p
            from SessionPayment p
            where p.vehicleSession.id = :sessionId
            order by p.createdAt desc
            """)
    List<SessionPayment> findAllForSession(@Param("sessionId") Long sessionId);

    Optional<SessionPayment> findFirstByVehicleSessionIdOrderByCreatedAtDesc(Long sessionId);
}
