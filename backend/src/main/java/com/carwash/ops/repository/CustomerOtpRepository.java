package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.CustomerOtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface CustomerOtpRepository extends JpaRepository<CustomerOtpEntity, Long> {

    // Find the latest unused, unexpired OTP for a given phone number
    Optional<CustomerOtpEntity> findFirstByEmailAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String email, Instant now);
}
