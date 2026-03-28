package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Staff;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByBranch_Id(Long branchId);

    @Query("SELECT s FROM Staff s JOIN FETCH s.branch WHERE s.branch.id = :branchId")
    List<Staff> findByBranch_IdWithBranch(@Param("branchId") Long branchId);
}
