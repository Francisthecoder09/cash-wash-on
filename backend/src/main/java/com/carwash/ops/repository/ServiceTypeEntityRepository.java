package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.ServiceTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTypeEntityRepository extends JpaRepository<ServiceTypeEntity, Long> {

    Optional<ServiceTypeEntity> findByServiceName(String serviceName);

    List<ServiceTypeEntity> findByActiveTrue();

    List<ServiceTypeEntity> findByCategory(String category);

    List<ServiceTypeEntity> findByIsFeaturedTrue();

    boolean existsByServiceName(String serviceName);
}
