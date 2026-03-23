package com.carwash.ops.domain.entity;

// JPA imports for entity mapping
import jakarta.persistence.Column; // Maps field to database column
import jakarta.persistence.Entity; // Marks class as JPA entity
import jakarta.persistence.Index; // Database index
import jakarta.persistence.Table; // Table configuration

/**
 * Branch Entity - Represents a Car Wash Branch/Location
 * 
 * This entity represents a physical car wash location in the system.
 * Each branch can have multiple lanes, staff members, and vehicle sessions.
 * 
 * KEY CONCEPTS:
 * 1. @Entity - Maps to a database table
 * 2. Extends BaseEntity - Inherits id, createdAt, updatedAt
 * 3. Simple entity - No complex relationships defined here (relationships are
 * from other entities)
 * 
 * RELATIONSHIPS (from OTHER entities):
 * - User -> Branch (Many-to-One): Users work at a branch
 * - Lane -> Branch (Many-to-One): Lanes belong to a branch
 * - Staff -> Branch (Many-to-One): Staff work at a branch
 * - VehicleSession -> Branch (Many-to-One): Sessions at a branch
 * 
 * EXAM TIPS:
 * - The name is UNIQUE - can't have two branches with same name
 * - timezone defaults to "Africa/Accra" (project's time zone)
 * - active flag enables soft-delete for branches
 */
@Entity // This class maps to a database table
@Table(name = "branches", indexes = {
        // Index on name for fast lookups when searching branches
        @Index(name = "idx_branch_name", columnList = "name")
})
public class Branch extends BaseEntity { // Inherits id, createdAt, updatedAt

    // ==================== GETTER AND SETTER METHODS ====================
    // Demonstrating ENCAPSULATION - controlling access to internal state

    /** @return The branch name (e.g., "RinseFlow Accra") */
    public String getName() {
        return name;
    }

    /** @param name Sets the branch name */
    public void setName(String name) {
        this.name = name;
    }

    /** @return The physical location address */
    public String getLocation() {
        return location;
    }

    /** @param location Sets the location address */
    public void setLocation(String location) {
        this.location = location;
    }

    /** @return The timezone for this branch (affects local time calculations) */
    public String getTimezone() {
        return timezone;
    }

    /** @param timezone Sets the timezone */
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    /** @return Whether this branch is currently operational */
    public boolean isActive() {
        return active;
    }

    /** @param active Sets the active status */
    public void setActive(boolean active) {
        this.active = active;
    }

    // ==================== DATABASE MAPPED FIELDS ====================

    /**
     * Branch name - unique identifier for the branch
     * 
     * unique = true - Each branch must have a unique name
     * nullable = false - Branch name is required
     * length = 120 - Maximum 120 characters
     */
    @Column(nullable = false, length = 120, unique = true)
    private String name;

    /**
     * Physical location/address of the branch
     * This is where the car wash is located
     */
    @Column(nullable = false, length = 200)
    private String location;

    /**
     * Timezone for this branch
     * 
     * EXAM TIP: Different branches might be in different timezones
     * This affects session time calculations and reports
     * Default is Africa/Accra for this project
     */
    @Column(nullable = false, length = 30)
    private String timezone;

    /**
     * Active flag - Soft delete
     * 
     * When a branch closes, we set active = false instead of deleting
     * This preserves historical data for reports and audits
     */
    @Column(nullable = false)
    private boolean active = true;
}
