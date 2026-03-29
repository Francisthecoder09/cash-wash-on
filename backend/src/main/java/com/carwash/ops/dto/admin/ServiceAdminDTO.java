package com.carwash.ops.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ServiceAdminDTO {

    public static class ServiceTypeResponse {
        private Long id;
        private String serviceName;
        private String description;
        private BigDecimal basePrice;
        private Integer durationMinutes;
        private String category;
        private Boolean isFeatured;
        private Boolean active;
        private String imageUrl;
        private Long branchId;
        private String branchName;

        public ServiceTypeResponse() {}

        public ServiceTypeResponse(Long id, String serviceName, String description, BigDecimal basePrice, 
                                 Integer durationMinutes, String category, Boolean isFeatured, Boolean active, String imageUrl, Long branchId, String branchName) {
            this.id = id;
            this.serviceName = serviceName;
            this.description = description;
            this.basePrice = basePrice;
            this.durationMinutes = durationMinutes;
            this.category = category;
            this.isFeatured = isFeatured;
            this.active = active;
            this.imageUrl = imageUrl;
            this.branchId = branchId;
            this.branchName = branchName;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Boolean getIsFeatured() { return isFeatured; }
        public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public Long getBranchId() { return branchId; }
        public void setBranchId(Long branchId) { this.branchId = branchId; }
        public String getBranchName() { return branchName; }
        public void setBranchName(String branchName) { this.branchName = branchName; }

        public static ServiceTypeResponseBuilder builder() { return new ServiceTypeResponseBuilder(); }
        public static class ServiceTypeResponseBuilder {
            private Long id;
            private String serviceName;
            private String description;
            private BigDecimal basePrice;
            private Integer durationMinutes;
            private String category;
            private Boolean isFeatured;
            private Boolean active;
            private String imageUrl;
            private Long branchId;
            private String branchName;
            public ServiceTypeResponseBuilder id(Long id) { this.id = id; return this; }
            public ServiceTypeResponseBuilder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
            public ServiceTypeResponseBuilder description(String description) { this.description = description; return this; }
            public ServiceTypeResponseBuilder basePrice(BigDecimal basePrice) { this.basePrice = basePrice; return this; }
            public ServiceTypeResponseBuilder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
            public ServiceTypeResponseBuilder category(String category) { this.category = category; return this; }
            public ServiceTypeResponseBuilder isFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; return this; }
            public ServiceTypeResponseBuilder active(Boolean active) { this.active = active; return this; }
            public ServiceTypeResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
            public ServiceTypeResponseBuilder branchId(Long branchId) { this.branchId = branchId; return this; }
            public ServiceTypeResponseBuilder branchName(String branchName) { this.branchName = branchName; return this; }
            public ServiceTypeResponse build() { return new ServiceTypeResponse(id, serviceName, description, basePrice, durationMinutes, category, isFeatured, active, imageUrl, branchId, branchName); }
        }
    }

    public static class CreateServiceRequest {
        private String serviceName;
        private String description;
        private BigDecimal basePrice;
        private Integer durationMinutes;
        private String category;
        private Boolean isFeatured;
        private Long branchId;

        public CreateServiceRequest() {}

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Boolean getIsFeatured() { return isFeatured; }
        public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
        public Long getBranchId() { return branchId; }
        public void setBranchId(Long branchId) { this.branchId = branchId; }
    }

    public static class UpdateServiceRequest {
        private String serviceName;
        private String description;
        private BigDecimal basePrice;
        private Integer durationMinutes;
        private String category;
        private Long branchId;

        public UpdateServiceRequest() {}

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public Long getBranchId() { return branchId; }
        public void setBranchId(Long branchId) { this.branchId = branchId; }
    }

    public static class PricingResponse {
        private Long id;
        private Long serviceTypeId;
        private String serviceName;
        private String vehicleCategory;
        private BigDecimal price;
        private BigDecimal discountPercentage;
        private Boolean active;
        private LocalDateTime effectiveFrom;
        private LocalDateTime effectiveUntil;

        public PricingResponse() {}

        public PricingResponse(Long id, Long serviceTypeId, String serviceName, String vehicleCategory, 
                             BigDecimal price, BigDecimal discountPercentage, Boolean active, LocalDateTime effectiveFrom, LocalDateTime effectiveUntil) {
            this.id = id;
            this.serviceTypeId = serviceTypeId;
            this.serviceName = serviceName;
            this.vehicleCategory = vehicleCategory;
            this.price = price;
            this.discountPercentage = discountPercentage;
            this.active = active;
            this.effectiveFrom = effectiveFrom;
            this.effectiveUntil = effectiveUntil;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getServiceTypeId() { return serviceTypeId; }
        public void setServiceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public String getVehicleCategory() { return vehicleCategory; }
        public void setVehicleCategory(String vehicleCategory) { this.vehicleCategory = vehicleCategory; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public BigDecimal getDiscountPercentage() { return discountPercentage; }
        public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
        public LocalDateTime getEffectiveFrom() { return effectiveFrom; }
        public void setEffectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; }

        public static PricingResponseBuilder builder() { return new PricingResponseBuilder(); }
        public static class PricingResponseBuilder {
            private Long id;
            private Long serviceTypeId;
            private String serviceName;
            private String vehicleCategory;
            private BigDecimal price;
            private BigDecimal discountPercentage;
            private Boolean active;
            private LocalDateTime effectiveFrom;
            private LocalDateTime effectiveUntil;
            public PricingResponseBuilder id(Long id) { this.id = id; return this; }
            public PricingResponseBuilder serviceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; return this; }
            public PricingResponseBuilder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
            public PricingResponseBuilder vehicleCategory(String vehicleCategory) { this.vehicleCategory = vehicleCategory; return this; }
            public PricingResponseBuilder price(BigDecimal price) { this.price = price; return this; }
            public PricingResponseBuilder discountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; return this; }
            public PricingResponseBuilder active(Boolean active) { this.active = active; return this; }
            public PricingResponseBuilder effectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; return this; }
            public PricingResponseBuilder effectiveUntil(LocalDateTime effectiveUntil) { this.effectiveUntil = effectiveUntil; return this; }
            public PricingResponse build() { return new PricingResponse(id, serviceTypeId, serviceName, vehicleCategory, price, discountPercentage, active, effectiveFrom, effectiveUntil); }
        }
    }

    public static class CreatePricingRequest {
        private Long serviceTypeId;
        private String vehicleCategory;
        private BigDecimal price;
        private BigDecimal discountPercentage;
        private LocalDateTime effectiveFrom;
        private LocalDateTime effectiveUntil;

        public CreatePricingRequest() {}

        public Long getServiceTypeId() { return serviceTypeId; }
        public void setServiceTypeId(Long serviceTypeId) { this.serviceTypeId = serviceTypeId; }
        public String getVehicleCategory() { return vehicleCategory; }
        public void setVehicleCategory(String vehicleCategory) { this.vehicleCategory = vehicleCategory; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public BigDecimal getDiscountPercentage() { return discountPercentage; }
        public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
        public LocalDateTime getEffectiveFrom() { return effectiveFrom; }
        public void setEffectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; }
        public LocalDateTime getEffectiveUntil() { return effectiveUntil; }
        public void setEffectiveUntil(LocalDateTime effectiveUntil) { this.effectiveUntil = effectiveUntil; }
    }

    public static class UpdatePricingRequest {
        private BigDecimal price;
        private BigDecimal discountPercentage;

        public UpdatePricingRequest() {}

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public BigDecimal getDiscountPercentage() { return discountPercentage; }
        public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
    }
}
