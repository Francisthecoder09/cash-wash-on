package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.domain.enums.SessionStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleSessionRepository
                extends JpaRepository<VehicleSession, Long>, JpaSpecificationExecutor<VehicleSession> {
        Optional<VehicleSession> findBySourceRequestId(String sourceRequestId);
        Optional<VehicleSession> findByPortalToken(String portalToken);

        List<VehicleSession> findByRegistrationNumberOrderByCreatedAtDesc(String registrationNumber);

        @Query("""
                        select v from VehicleSession v
                        where v.registrationNumber = :reg
                        and v.customerPhone = :phone
                        and v.status not in ('COMPLETED', 'EXPIRED')
                        order by v.createdAt desc
                        """)
        List<VehicleSession> findActiveByRegistrationAndPhone(@Param("reg") String reg, @Param("phone") String phone);

        @Query("""
                        select v from VehicleSession v
                        where v.registrationNumber = :reg
                        and lower(v.customer.email) = lower(:email)
                        and v.status not in ('COMPLETED', 'EXPIRED')
                        order by v.createdAt desc
                        """)
        List<VehicleSession> findActiveByRegistrationAndEmail(@Param("reg") String reg, @Param("email") String email);

        @Query("""
                        select v from VehicleSession v
                        where v.branch.id = :branchId
                        and v.registrationNumber = :reg
                        and v.customerPhone = :phone
                        and v.status not in ('COMPLETED', 'EXPIRED')
                        order by v.createdAt desc
                        """)
        List<VehicleSession> findActiveDuplicateForBranch(
                        @Param("branchId") Long branchId,
                        @Param("reg") String reg,
                        @Param("phone") String phone);

        @Query("""
                        select count(v)
                        from VehicleSession v
                        where v.branch.id = :branchId and v.completedAt >= :start and v.completedAt < :end
                        """)
        long countDailyCompleted(@Param("branchId") Long branchId, @Param("start") Instant start,
                        @Param("end") Instant end);

        @Query("""
                        select v
                        from VehicleSession v
                        where (:branchId is null or v.branch.id = :branchId)
                        and (:status is null or v.status = :status)
                        order by v.createdAt desc
                        """)
        List<VehicleSession> findFiltered(@Param("branchId") Long branchId, @Param("status") SessionStatus status);

        @Query("""
                        select v
                        from VehicleSession v
                        where v.customer.id = :customerId
                        order by v.createdAt desc
                        """)
        List<VehicleSession> findTop6ByCustomerIdOrderByCreatedAtDesc(@Param("customerId") Long customerId);

        @Query("""
                        select v
                        from VehicleSession v
                        where v.customer.id = :customerId
                        and v.status not in ('COMPLETED', 'EXPIRED')
                        order by v.createdAt desc
                        """)
        List<VehicleSession> findActiveByCustomerId(@Param("customerId") Long customerId);

        @Query("""
                        select v
                        from VehicleSession v
                        where v.status = 'REGISTERED'
                        and v.appointmentAt is not null
                        and v.appointmentAt <= :cutoff
                        """)
        List<VehicleSession> findExpiredRegisteredSessions(@Param("cutoff") Instant cutoff);

        @Query("""
                        select count(v)
                        from VehicleSession v
                        where v.completedAt >= :start and v.completedAt < :end
                        """)
        long countByCompletedAtBetween(@Param("start") Instant start, @Param("end") Instant end);

        @Query("""
                        select count(v)
                        from VehicleSession v
                        where v.branch.id = :branchId and v.completedAt >= :start and v.completedAt < :end
                        """)
        long countByBranch_IdAndCompletedAtBetween(@Param("branchId") Long branchId, @Param("start") Instant start,
                        @Param("end") Instant end);
}
