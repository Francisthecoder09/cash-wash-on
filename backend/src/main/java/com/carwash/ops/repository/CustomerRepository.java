package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByEmailIgnoreCase(String email);
    Optional<Customer> findByUsernameIgnoreCase(String username);
    Optional<Customer> findByUsernameIgnoreCaseAndEmailIgnoreCase(String username, String email);
}
