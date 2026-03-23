package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, Long> {
}
