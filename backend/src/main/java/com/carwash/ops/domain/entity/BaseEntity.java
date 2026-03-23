package com.carwash.ops.domain.entity;

// JPA (Java Persistence API) imports for ORM mapping
import jakarta.persistence.Column; // Maps field to database column
import jakarta.persistence.GeneratedValue; // Configures primary key generation
import jakarta.persistence.GenerationType; // Defines ID generation strategy
import jakarta.persistence.Id; // Marks field as primary key
import jakarta.persistence.MappedSuperclass; // Base class for entities (no table created)
import jakarta.persistence.PrePersist; // Callback before INSERT operation
import jakarta.persistence.PreUpdate; // Callback before UPDATE operation

import java.time.Instant; // Java 8+ date/time API (UTC timestamps)

/**
 * BaseEntity - Abstract Base Class for All Database Entities
 * 
 * This class demonstrates the OOP concept of INHERITANCE and ENCAPSULATION.
 * All entity classes (User, Branch, Lane, Staff, VehicleSession, etc.) extend
 * this class.
 * 
 * KEY CONCEPTS:
 * 1. @MappedSuperclass - Fields are inherited by child entities, but NO table
 * is created for this class
 * 2. Encapsulation - All fields are private, accessed only through
 * getter/setter methods
 * 3. Timestamps - Automatic tracking of when records are created and updated
 * 4. Auto-increment ID - Each entity gets a unique primary key
 * 
 * EXAM TIPS:
 * - This is an example of ABSTRACTION - common functionality is centralized
 * - The @PrePersist and @PreUpdate are LIFECYCLE CALLBACKS
 * - GenerationType.IDENTITY uses auto-increment in MySQL/MariaDB
 */
@MappedSuperclass // This is a parent class - no table will be created for it
public abstract class BaseEntity {

    // ==================== GETTER AND SETTER METHODS ====================
    // These demonstrate ENCAPSULATION - controlling access to internal state

    /** @return The unique identifier for this entity */
    public Long getId() {
        return id;
    }

    /** @param id Sets the unique identifier */
    public void setId(Long id) {
        this.id = id;
    }

    /** @return Timestamp when this record was first created */
    public java.time.Instant getCreatedAt() {
        return createdAt;
    }

    /** @param createdAt Sets the creation timestamp */
    public void setCreatedAt(java.time.Instant createdAt) {
        this.createdAt = createdAt;
    }

    /** @return Timestamp when this record was last updated */
    public java.time.Instant getUpdatedAt() {
        return updatedAt;
    }

    /** @param updatedAt Sets the last update timestamp */
    public void setUpdatedAt(java.time.Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // ==================== DATABASE MAPPED FIELDS ====================

    /**
     * @Id - Marks this field as the PRIMARY KEY
     * @GeneratedValue - Configures automatic ID generation
     *                 GenerationType.IDENTITY = auto-increment (database handles ID
     *                 generation)
     * 
     *                 EXAM TIP: Other strategies:
     *                 - SEQUENCE: Uses database sequence (Oracle, PostgreSQL)
     *                 - TABLE: Uses a separate table for ID generation
     *                 - AUTO: Let JPA choose the best strategy
     */
    @Id // Primary key - unique identifier for each record
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment strategy
    private Long id; // Long is preferred over int (more range, nullable)

    /**
     * @Column - Maps this field to a database column
     *         name = "created_at" maps to the created_at column
     *         nullable = false means this field cannot be null in DB
     *         updatable = false means this field cannot be modified after creation
     * 
     *         EXAM TIP: The updatable=false is important for AUDIT TRAILS
     *         We never want to change when something was created!
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt; // Instant = UTC timestamp (timezone-neutral)

    /**
     * This timestamp gets updated every time the record is modified
     * Important for tracking data changes and debugging
     */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // ==================== JPA LIFECYCLE CALLBACKS ====================
    // These methods are automatically called by JPA/Hibernate

    /**
     * @PrePersist - This method runs BEFORE the entity is first saved to DB
     *             We use it to automatically set creation and update timestamps
     *             This is an example of ASPECT-ORIENTED PROGRAMMING (AOP)
     */
    @PrePersist
    void onCreate() {
        Instant now = Instant.now(); // Get current UTC time
        createdAt = now; // Set creation time
        updatedAt = now; // Also set update time on creation
    }

    /**
     * @PreUpdate - This method runs BEFORE the entity is updated in DB
     *            We use it to automatically update the modified timestamp
     * 
     *            EXAM TIP: There's also @PostPersist and @PostUpdate for after
     *            operations
     */
    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now(); // Update the modified time
    }
}
