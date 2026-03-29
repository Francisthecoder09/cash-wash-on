package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Lane;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaneRepository extends JpaRepository<Lane, Long> {
    @EntityGraph(attributePaths = {"branch"})
    List<Lane> findByBranch_IdOrderByDisplayOrderAsc(Long branchId);

    @EntityGraph(attributePaths = {"branch"})
    List<Lane> findByBranch_Id(Long branchId);

    @EntityGraph(attributePaths = {"branch"})
    List<Lane> findByActiveTrueOrderByDisplayOrderAsc();
}
