package com.carwash.ops.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_types")
public class ServiceTypeEntity extends BaseEntity {

    public Long getId() { return super.getId(); }

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    public ServiceTypeEntity() {}

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Boolean isActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public static ServiceTypeEntityBuilder builder() { return new ServiceTypeEntityBuilder(); }
    public static class ServiceTypeEntityBuilder {
        private String serviceName;
        private String description;
        private BigDecimal basePrice;
        private Integer durationMinutes;
        private String category;
        private Boolean isFeatured;
        private Boolean active;
        private String imageUrl;
        private Branch branch;
        public ServiceTypeEntityBuilder serviceName(String serviceName) { this.serviceName = serviceName; return this; }
        public ServiceTypeEntityBuilder description(String description) { this.description = description; return this; }
        public ServiceTypeEntityBuilder basePrice(BigDecimal basePrice) { this.basePrice = basePrice; return this; }
        public ServiceTypeEntityBuilder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public ServiceTypeEntityBuilder category(String category) { this.category = category; return this; }
        public ServiceTypeEntityBuilder isFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; return this; }
        public ServiceTypeEntityBuilder active(Boolean active) { this.active = active; return this; }
        public ServiceTypeEntityBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ServiceTypeEntityBuilder branch(Branch branch) { this.branch = branch; return this; }
        public ServiceTypeEntity build() {
            ServiceTypeEntity s = new ServiceTypeEntity();
            s.setServiceName(serviceName);
            s.setDescription(description);
            s.setBasePrice(basePrice);
            s.setDurationMinutes(durationMinutes);
            s.setCategory(category);
            s.setIsFeatured(isFeatured != null ? isFeatured : false);
            s.setActive(active != null ? active : true);
            s.setImageUrl(imageUrl);
            s.setBranch(branch);
            return s;
        }
    }
}
