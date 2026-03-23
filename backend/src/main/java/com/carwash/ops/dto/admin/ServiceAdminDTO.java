package com.carwash.ops.dto.admin;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ServiceAdminDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceTypeResponse {
        private Long id;
        private String serviceName;
        private String description;
        private BigDecimal basePrice;
        private Integer durationMinutes;
        private String category;
        private Boolean isFeatured;
        private Boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateServiceRequest {
        private String serviceName;
        private String description;
        private BigDecimal basePrice;
        private Integer durationMinutes;
        private String category;
        private Boolean isFeatured;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateServiceRequest {
        private String serviceName;
        private String description;
        private BigDecimal basePrice;
        private Integer durationMinutes;
        private String category;
    }

    // Pricing DTOs
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingResponse {
        private Long id;
        private Long serviceTypeId;
        private String serviceName;
        private String vehicleCategory;
        private BigDecimal price;
        private BigDecimal discountPercentage;
        private Boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePricingRequest {
        private Long serviceTypeId;
        private String vehicleCategory;
        private BigDecimal price;
        private BigDecimal discountPercentage;
        private LocalDateTime effectiveFrom;
        private LocalDateTime effectiveUntil;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePricingRequest {
        private BigDecimal price;
        private BigDecimal discountPercentage;
    }
}
