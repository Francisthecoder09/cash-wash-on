package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.ServiceTypeEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTypeEntityRepository extends JpaRepository<ServiceTypeEntity, Long> {

    @Override
    @EntityGraph(attributePaths = "branch")
    List<ServiceTypeEntity> findAll();

    @Override
    @EntityGraph(attributePaths = "branch")
    Optional<ServiceTypeEntity> findById(Long id);

    Optional<ServiceTypeEntity> findByServiceName(String serviceName);

    @EntityGraph(attributePaths = "branch")
    List<ServiceTypeEntity> findByActiveTrue();

    List<ServiceTypeEntity> findByCategory(String category);

    List<ServiceTypeEntity> findByCategoryIgnoreCase(String category);

    List<ServiceTypeEntity> findByIsFeaturedTrue();

    List<ServiceTypeEntity> findByCategoryIgnoreCaseAndActiveTrue(String category);

    boolean existsByServiceName(String serviceName);
}
