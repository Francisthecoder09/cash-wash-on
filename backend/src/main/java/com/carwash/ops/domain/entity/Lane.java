package com.carwash.ops.domain.entity;

// Jackson JSON annotation to prevent infinite recursion
import com.fasterxml.jackson.annotation.JsonIgnore;

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
 * Lane Entity - Represents a Car Wash Lane/Bay
 * 
 * Each branch has multiple lanes (washing bays). This entity tracks
 * which lane a vehicle is assigned to and the order in which lanes are
 * displayed.
 * 
 * KEY CONCEPTS:
 * 1. @Entity - Maps to a database table
 * 2. @ManyToOne - Each lane belongs to ONE branch
 * 3. displayOrder - Controls UI ordering of lanes
 * 4. @JsonIgnore - Prevents circular JSON serialization
 * 
 * RELATIONSHIPS:
 * - Lane -> Branch (Many-to-One): Each lane belongs to one branch
 * - VehicleSession -> Lane (Many-to-One): Vehicles assigned to lanes
 * 
 * EXAM TIPS:
 * - displayOrder allows sorting lanes in the UI (1, 2, 3...)
 * - Lazy loading prevents unnecessary branch queries
 * - The foreign key constraint ensures data integrity
 */
@Entity // This class maps to a database table
@Table(name = "lanes", indexes = {
        // Index on branch_id for fast queries like "get all lanes at branch X"
        @Index(name = "idx_lane_branch", columnList = "branch_id")
})
public class Lane extends BaseEntity { // Inherits id, createdAt, updatedAt

    // ==================== GETTER AND SETTER METHODS ====================
    // Demonstrating ENCAPSULATION

    /** @return The branch this lane belongs to */
    public Branch getBranch() {
        return branch;
    }

    /** @param branch Sets the branch */
    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    /** @return The branch ID (convenience to avoid lazy loading) */
    public Long getBranchId() {
        return branch != null ? branch.getId() : null;
    }

    /** @return The branch name (convenience method) */
    public String getBranchName() {
        return branch != null ? branch.getName() : null;
    }

    /** @return The lane name (e.g., "Lane 1", "Express Bay") */
    public String getLaneName() {
        return laneName;
    }

    /** @param laneName Sets the lane name */
    public void setLaneName(String laneName) {
        this.laneName = laneName;
    }

    /** @return The display order for UI sorting */
    public Integer getDisplayOrder() {
        return displayOrder;
    }

    /** @param displayOrder Sets the display order */
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    /** @return Whether this lane is operational */
    public boolean isActive() {
        return active;
    }

    /** @param active Sets the active status */
    public void setActive(boolean active) {
        this.active = active;
    }

    // ==================== DATABASE RELATIONSHIPS ====================

    /**
     * Many-to-One Relationship: Lane -> Branch
     * 
     * Each lane belongs to ONE branch. This is a foreign key relationship.
     * 
     * @ManyToOne(fetch = FetchType.LAZY) - Load branch only when needed
     *                  This is important for performance - we often just need lane
     *                  info
     * 
     * @JsonIgnore - Prevents circular serialization:
     *             Lane -> Branch -> (list of lanes) -> Lane -> ...
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Every lane MUST have a branch
    @JoinColumn(name = "branch_id", nullable = false, // Foreign key column
            foreignKey = @ForeignKey(name = "fk_lane_branch")) // Constraint name
    @JsonIgnore // Don't serialize branch to JSON
    private Branch branch;

    // ==================== SIMPLE FIELDS ====================

    /**
     * Lane name - what the lane is called
     * Examples: "Lane 1", "Lane 2", "Express Bay", "Premium Wash"
     */
    @Column(name = "lane_name", nullable = false, length = 60)
    private String laneName;

    /**
     * Display order - for sorting lanes in the UI
     * 
     * EXAM TIP: This is useful for both UI and operational purposes
     * Lower numbers appear first and might be assigned first
     */
    @Column(nullable = false)
    private Integer displayOrder;

    /**
     * Active flag - Soft delete for lanes
     * When a lane is under maintenance, set active = false
     */
    @Column(nullable = false)
    private boolean active = true;
}
