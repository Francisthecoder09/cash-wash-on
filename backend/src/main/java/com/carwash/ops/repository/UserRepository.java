package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndActiveTrue(String email);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameAndActiveTrue(String username);
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"branch", "staff"})
    List<User> findByBranch_Id(Long branchId);

    @EntityGraph(attributePaths = {"branch", "staff"})
    List<User> findAll();
}
