package com.carwash.ops.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String settingKey;

    @Column(length = 1000)
    private String settingValue;

    @Column(name = "setting_type")
    private String settingType; // TAX, DISCOUNT, SYSTEM, FEATURE

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Boolean editable = true;

    @Column(name = "display_order")
    private Integer displayOrder;
}
