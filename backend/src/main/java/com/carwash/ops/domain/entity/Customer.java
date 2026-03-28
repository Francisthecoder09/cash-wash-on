package com.carwash.ops.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Customer Entity - Represents a Recurring Client
 * 
 * This entity tracks customer history, contact information, and loyalty.
 * It is linked to VehicleSessions to build a CRM profile over time.
 */
@Entity
@Table(name = "customers", indexes = {
    @Index(name = "idx_customer_phone", columnList = "phone")
})
public class Customer extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 30)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "total_visits")
    private Integer totalVisits = 0;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Column(name = "last_vehicle_registration", length = 25)
    private String lastVehicleRegistration;

    // Getters and Setters

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(Integer totalVisits) {
        this.totalVisits = totalVisits;
    }

    public Integer getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(Integer loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public String getLastVehicleRegistration() {
        return lastVehicleRegistration;
    }

    public void setLastVehicleRegistration(String lastVehicleRegistration) {
        this.lastVehicleRegistration = lastVehicleRegistration;
    }
}
