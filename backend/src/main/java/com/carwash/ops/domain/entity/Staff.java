package com.carwash.ops.domain.entity;

// JPA imports for entity mapping
import jakarta.persistence.Column; // Maps field to database column
import jakarta.persistence.Entity; // Marks class as JPA entity
import jakarta.persistence.FetchType; // Lazy vs Eager loading
import jakarta.persistence.ForeignKey; // Foreign key constraint
import jakarta.persistence.Index; // Database index
import jakarta.persistence.JoinColumn; // Foreign key column
import jakarta.persistence.ManyToOne; // Many-to-one relationship
import jakarta.persistence.Table; // Table configuration

/**
 * Staff Entity - Represents Employees at a Branch
 * 
 * This entity stores employee information. Each staff member works at one
 * branch.
 * Staff members can be assigned to roles like Lane Operator, Cashier,
 * Inspector, etc.
 * 
 * KEY CONCEPTS:
 * 1. @Entity - Maps to a database table
 * 2. @ManyToOne - Each staff member belongs to ONE branch
 * 3. employeeCode - Unique identifier for each employee
 * 4. Soft delete via active flag
 * 
 * RELATIONSHIPS:
 * - Staff -> Branch (Many-to-One): Each staff works at one branch
 * - User -> Staff (One-to-One): Each user is linked to one staff member
 * - VehicleSession -> Staff (Many-to-One): Operator staff assigned to sessions
 * 
 * EXAM TIPS:
 * - employeeCode is UNIQUE - each employee has a unique code
 * - This entity is separate from User for flexibility
 * - A staff member might not have system access (no User account)
 */
@Entity // This class maps to a database table
@Table(name = "staff", indexes = {
        // Index on employeeCode for fast lookups
        @Index(name = "idx_staff_code", columnList = "employeeCode")
})
public class Staff extends BaseEntity { // Inherits id, createdAt, updatedAt

    // ==================== GETTER AND SETTER METHODS ====================
    // Demonstrating ENCAPSULATION

    /** @return The branch where this staff member works */
    public Branch getBranch() {
        return branch;
    }

    /** @param branch Sets the branch */
    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    /** @return The employee's full name */
    public String getFullName() {
        return fullName;
    }

    /** @param fullName Sets the full name */
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    /** @return The unique employee code (e.g., "EMP001") */
    public String getEmployeeCode() {
        return employeeCode;
    }

    /** @param employeeCode Sets the employee code */
    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    /** @return The employee's phone number */
    public String getPhone() {
        return phone;
    }

    /** @param phone Sets the phone number */
    public void setPhone(String phone) {
        this.phone = phone;
    }

    /** @return Whether the staff member is currently employed */
    public boolean isActive() {
        return active;
    }

    /** @param active Sets the active status */
    public void setActive(boolean active) {
        this.active = active;
    }

    // ==================== DATABASE RELATIONSHIPS ====================

    /**
     * Many-to-One Relationship: Staff -> Branch
     * 
     * Each staff member works at ONE branch.
     * 
     * EXAM TIP: Staff don't need @JsonIgnore here because Branch doesn't
     * have a direct reference back to Staff (no circular relationship)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Every staff MUST have a branch
    @JoinColumn(name = "branch_id", nullable = false, foreignKey = @ForeignKey(name = "fk_staff_branch"))
    private Branch branch;

    // ==================== SIMPLE FIELDS ====================

    /**
     * Full name of the employee
     * This is their legal name for records
     */
    @Column(nullable = false, length = 120)
    private String fullName;

    /**
     * Unique employee code - internal identifier
     * 
     * EXAM TIP: This is unique like username - no two employees can share a code
     * Used for internal tracking and attendance systems
     */
    @Column(nullable = false, length = 30, unique = true)
    private String employeeCode;

    /**
     * Contact phone number
     * Used for communication and emergency contact
     */
    @Column(nullable = false, length = 30)
    private String phone;

    /**
     * Active flag - Employment status
     * When an employee leaves, set active = false (soft delete)
     */
    @Column(nullable = false)
    private boolean active = true;
}
