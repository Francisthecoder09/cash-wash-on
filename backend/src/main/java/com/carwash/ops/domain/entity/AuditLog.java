package com.carwash.ops.domain.entity;

// Import the audit action enum
import com.carwash.ops.domain.enums.AuditAction;

// JPA imports for entity mapping
import jakarta.persistence.Column; // Maps field to database column
import jakarta.persistence.Entity; // Marks class as JPA entity
import jakarta.persistence.EnumType; // Enum storage type
import jakarta.persistence.Enumerated; // Marks enum field
import jakarta.persistence.FetchType; // Lazy vs Eager loading
import jakarta.persistence.ForeignKey; // Foreign key constraint
import jakarta.persistence.Index; // Database index
import jakarta.persistence.JoinColumn; // Foreign key column
import jakarta.persistence.ManyToOne; // Many-to-one relationship
import jakarta.persistence.Table; // Table configuration

/**
 * AuditLog Entity - Tracks All System Actions for Compliance
 * 
 * This entity provides a COMPLETE AUDIT TRAIL of all system actions.
 * Every important action (login, create, update, status change) is logged.
 * 
 * KEY CONCEPTS:
 * 1. Audit Trail - Who did what and when
 * 2. Compliance - Required for regulated businesses
 * 3. Debugging - Can trace any issue back to its source
 * 
 * EXAM TIPS:
 * - This entity demonstrates the IMPORTANCE of logging
 * - Every service calls auditService.log() for major actions
 * - metadataJson stores additional action-specific data as JSON
 * - Can query by user, session, action type, or date range
 */
@Entity // This class maps to a database table
@Table(name = "audit_logs", indexes = {
        // Index on vehicle_session_id for queries like "get all logs for session X"
        @Index(name = "idx_audit_session", columnList = "vehicle_session_id")
})
public class AuditLog extends BaseEntity { // Inherits id, createdAt, updatedAt

    // ==================== GETTER AND SETTER METHODS ====================

    /** @return The user who performed this action */
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    /** @return The vehicle session this action relates to (if applicable) */
    public VehicleSession getVehicleSession() {
        return vehicleSession;
    }

    public void setVehicleSession(VehicleSession vehicleSession) {
        this.vehicleSession = vehicleSession;
    }

    /** @return What type of action was performed */
    public com.carwash.ops.domain.enums.AuditAction getAction() {
        return action;
    }

    public void setAction(com.carwash.ops.domain.enums.AuditAction action) {
        this.action = action;
    }

    /** @return Human-readable description of what happened */
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    /** @return Additional data as JSON (e.g., old/new values) */
    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }

    // ==================== DATABASE RELATIONSHIPS ====================

    /**
     * Many-to-One: Who performed this action?
     * Optional - some actions might not have a user (system actions)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_audit_user"))
    private User user;

    /**
     * Many-to-One: Which session does this relate to?
     * Optional - not all actions relate to a session
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_session_id", foreignKey = @ForeignKey(name = "fk_audit_session"))
    private VehicleSession vehicleSession;

    // ==================== SIMPLE FIELDS ====================

    /**
     * What type of action was performed?
     * Examples: LOGIN, CREATE, UPDATE, SESSION_TRANSITION
     */
    @Enumerated(EnumType.STRING) // Store as string for readability
    @Column(nullable = false, length = 30)
    private AuditAction action;

    /**
     * Human-readable description
     * Example: "User logged in with role: CASHIER"
     */
    @Column(nullable = false, length = 255)
    private String description;

    /**
     * Additional structured data as JSON
     * 
     * EXAM TIP: Using JSON allows flexibility - different actions
     * can store different metadata without changing the schema
     * 
     * Example: {"status": "REGISTERED", "previousStatus": null}
     */
    @Column(name = "metadata_json", columnDefinition = "LONGTEXT")
    private String metadataJson;
}
