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

        List<VehicleSession> findByRegistrationNumberOrderByCreatedAtDesc(String registrationNumber);

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
