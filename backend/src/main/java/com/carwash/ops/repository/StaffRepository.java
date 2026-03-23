package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Staff;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByBranch_Id(Long branchId);
}
