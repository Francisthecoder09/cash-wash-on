package com.carwash.ops.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pricing")
public class PricingEntity extends BaseEntity {

    public Long getId() { return super.getId(); }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceTypeEntity serviceType;

    @Column(name = "vehicle_category", nullable = false)
    private String vehicleCategory; // SEDAN, SUV, TRUCK, VAN

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_until")
    private LocalDateTime effectiveUntil;

    @Column(nullable = false)
    private Boolean active = true;

    public PricingEntity() {}

    public ServiceTypeEntity getServiceType() { return serviceType; }
    public void setServiceType(ServiceTypeEntity serviceType) { this.serviceType = serviceType; }
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
    public Boolean isActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
 
    @Column(name = "service_type_id", insertable = false, updatable = false)
    private Long serviceTypeId;
    public Long getServiceTypeId() { return serviceTypeId; }

    public static PricingEntityBuilder builder() { return new PricingEntityBuilder(); }
    public static class PricingEntityBuilder {
        private ServiceTypeEntity serviceType;
        private String vehicleCategory;
        private BigDecimal price;
        private BigDecimal discountPercentage;
        private LocalDateTime effectiveFrom;
        private LocalDateTime effectiveUntil;
        private Boolean active;
        public PricingEntityBuilder serviceType(ServiceTypeEntity serviceType) { this.serviceType = serviceType; return this; }
        public PricingEntityBuilder vehicleCategory(String vehicleCategory) { this.vehicleCategory = vehicleCategory; return this; }
        public PricingEntityBuilder price(BigDecimal price) { this.price = price; return this; }
        public PricingEntityBuilder discountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; return this; }
        public PricingEntityBuilder effectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; return this; }
        public PricingEntityBuilder effectiveUntil(LocalDateTime effectiveUntil) { this.effectiveUntil = effectiveUntil; return this; }
        public PricingEntityBuilder active(Boolean active) { this.active = active; return this; }
        public PricingEntity build() {
            PricingEntity p = new PricingEntity();
            p.setServiceType(serviceType);
            p.setVehicleCategory(vehicleCategory);
            p.setPrice(price);
            p.setDiscountPercentage(discountPercentage);
            p.setEffectiveFrom(effectiveFrom);
            p.setEffectiveUntil(effectiveUntil);
            p.setActive(active != null ? active : true);
            return p;
        }
    }
}
