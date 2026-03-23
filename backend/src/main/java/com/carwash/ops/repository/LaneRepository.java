package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Lane;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaneRepository extends JpaRepository<Lane, Long> {
    List<Lane> findByBranch_IdOrderByDisplayOrderAsc(Long branchId);

    List<Lane> findByBranch_Id(Long branchId);

    List<Lane> findByActiveTrueOrderByDisplayOrderAsc();
}
