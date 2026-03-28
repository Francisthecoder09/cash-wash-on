package com.carwash.ops.domain.entity;

// Import the role enumeration for user authorization
import com.carwash.ops.domain.enums.RoleName;
// Jackson JSON annotation to prevent infinite recursion in serialization
import com.fasterxml.jackson.annotation.JsonIgnore;

// JPA imports for entity mapping
import jakarta.persistence.Column; // Maps field to database column
import jakarta.persistence.Entity; // Marks class as JPA entity (database table)
import jakarta.persistence.EnumType; // Enum storage type
import jakarta.persistence.Enumerated; // Marks enum field
import jakarta.persistence.FetchType; // Lazy vs Eager loading
import jakarta.persistence.ForeignKey; // Foreign key constraint definition
import jakarta.persistence.Index; // Database index creation
import jakarta.persistence.JoinColumn; // Foreign key column mapping
import jakarta.persistence.ManyToOne; // Many-to-one relationship
import jakarta.persistence.Table; // Table name and configuration

/**
 * User Entity - Represents System Users
 * 
 * This entity stores authentication and authorization data for the car wash
 * system.
 * Each user is associated with a Branch (where they work) and a Staff member
 * (their profile).
 * 
 * KEY CONCEPTS:
 * 1. @Entity - This class maps to a database table called "users"
 * 2. @Table - Customizes table settings, adds index on username for fast
 * lookups
 * 3. @ManyToOne - Each user belongs to ONE branch and ONE staff member
 * 4. @JsonIgnore - Prevents infinite recursion when serializing to JSON
 * 5. LAZY loading - Data is loaded on demand, not immediately
 * 
 * RELATIONSHIPS:
 * - User -> Branch (Many-to-One): Each user works at one branch
 * - User -> Staff (Many-to-One): Each user is linked to one staff record
 * 
 * EXAM TIPS:
 * - The username field is UNIQUE - no two users can have the same name
 * - Password is stored as HASH (BCrypt), never in plain text
 * - The role field controls authorization (what the user can do)
 * - active flag allows soft-delete (deactivating users without removing them)
 */
@Entity // This class maps to a database table
@Table(name = "users", indexes = {
        // Create index on username for fast login lookups
        @Index(name = "idx_user_username", columnList = "username")
})
public class User extends BaseEntity { // Inherits id, createdAt, updatedAt

    // ==================== GETTER METHODS ====================
    // These methods demonstrate ENCAPSULATION - controlling access to internal
    // state

    /** @return The branch where this user works */
    public Branch getBranch() {
        return branch;
    }

    /** @param branch Sets the branch where this user works */
    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    /** @return The branch ID (convenience method to avoid lazy loading issues) */
    public Long getBranchId() {
        return branch != null ? branch.getId() : null;
    }

    /** @return The branch name (convenience method) */
    public String getBranchName() {
        return branch != null ? branch.getName() : null;
    }

    /** @return The staff profile associated with this user */
    public Staff getStaff() {
        return staff;
    }

    /** @param staff Sets the staff profile */
    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    /** @return The username used for login */
    public String getUsername() {
        return username;
    }

    /** @param username Sets the username */
    public void setUsername(String username) {
        this.username = username;
    }

    /** @return The BCrypt hashed password */
    public String getPasswordHash() {
        return passwordHash;
    }

    /** @param passwordHash Sets the hashed password */
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    /** @return The user's role in the system */
    public com.carwash.ops.domain.enums.RoleName getRole() {
        return role;
    }

    /** @param role Sets the user's role */
    public void setRole(com.carwash.ops.domain.enums.RoleName role) {
        this.role = role;
    }

    /** @return Whether the user account is active */
    public boolean isActive() {
        return active;
    }

    /** @param active Sets the active status */
    public void setActive(boolean active) {
        this.active = active;
    }

    // ==================== DATABASE RELATIONSHIPS ====================

    /**
     * Many-to-One Relationship: User -> Branch
     * 
     * Each user works at ONE branch. This is a foreign key relationship.
     * 
     * @ManyToOne(fetch = FetchType.LAZY) - Data loaded on demand (not immediately)
     *                  This prevents unnecessary queries when we just need user
     *                  info
     * 
     * @JsonIgnore - Prevents infinite recursion:
     *             User -> Branch -> (list of users) -> User -> ...
     * 
     *             EXAM TIP: LAZY loading is the DEFAULT for @ManyToOne
     *             Use EAGER loading only when you always need the related data
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Every user MUST have a branch
    @JoinColumn(name = "branch_id", nullable = false, // Foreign key column name
            foreignKey = @ForeignKey(name = "fk_user_branch")) // Constraint name
    @JsonIgnore // Don't include branch in JSON (prevents infinite recursion)
    private Branch branch;

    /**
     * Many-to-One Relationship: User -> Staff
     * 
     * Each user is linked to ONE staff member record.
     * This allows us to get staff details (name, phone, etc.) from user.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Every user MUST have a staff record
    @JoinColumn(name = "staff_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_staff"))
    @JsonIgnore // Prevent circular JSON
    private Staff staff;

    // ==================== SIMPLE FIELDS ====================

    /**
     * Username field - used for login
     * 
     * unique = true - Database enforces uniqueness (no duplicate usernames)
     * nullable = false - Username is required
     * length = 80 - Maximum 80 characters
     */
    @Column(nullable = false, length = 80, unique = true)
    private String email;

    @Column(length = 80, unique = true)
    private String username;

    @Column(length = 255)
    private String passwordHash;

    @Column(name = "pin_hash", length = 255)
    private String pinHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RoleName role;

    @Column(nullable = false)
    private boolean active = true;

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPinHash() { return pinHash; }
    public void setPinHash(String pinHash) { this.pinHash = pinHash; }
}
