package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.SessionMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionMessageRepository extends JpaRepository<SessionMessage, Long> {
    @Query("""
            select m
            from SessionMessage m
            where m.vehicleSession.id = :vehicleSessionId
            order by m.createdAt asc
            """)
    List<SessionMessage> findAllForSession(@Param("vehicleSessionId") Long vehicleSessionId);
}
