package com.carwash.ops.repository;

import com.carwash.ops.domain.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

    Optional<SystemSetting> findBySettingKey(String settingKey);

    List<SystemSetting> findBySettingType(String settingType);

    boolean existsBySettingKey(String settingKey);

    void deleteBySettingKey(String settingKey);
}
