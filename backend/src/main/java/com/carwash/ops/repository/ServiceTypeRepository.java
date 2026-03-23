package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {

    Optional<ServiceType> findByServiceName(String serviceName);

    List<ServiceType> findByActiveTrue();

    List<ServiceType> findByCategory(String category);

    List<ServiceType> findByIsFeaturedTrue();

    boolean existsByServiceName(String serviceName);
}
