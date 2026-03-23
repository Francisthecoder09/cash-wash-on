package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameAndActiveTrue(String username);

    Optional<User> findByUsername(String username);

    List<User> findByBranch_Id(Long branchId);
}
