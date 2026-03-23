package com.carwash.ops.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceType extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String serviceName;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "category")
    private String category; // BASIC, PREMIUM, DETAILING

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "image_url")
    private String imageUrl;
}
