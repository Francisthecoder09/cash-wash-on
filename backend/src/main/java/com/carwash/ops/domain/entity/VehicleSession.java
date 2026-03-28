package com.carwash.ops.domain.entity;

// Import the session status enum
import com.carwash.ops.domain.enums.SessionStatus;

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

import java.time.Instant; // Java 8+ date/time API

/**
 * VehicleSession Entity - Represents a Vehicle Going Through Car Wash
 * 
 * This is the CORE business entity. It tracks a vehicle from registration
 * through the entire car wash process.
 * 
 * SESSION STATUS WORKFLOW:
 * REGISTERED → WASHING → INTERIOR → INSPECTION → COMPLETED
 * 
 * KEY CONCEPTS:
 * 1. State Machine - Session transitions follow strict workflow
 * 2. Multiple timestamps - Track progress through each phase
 * 3. Multiple relationships - Links to branch, lane, users, staff
 * 4. Temporal data - Each phase has its own timestamp
 * 
 * RELATIONSHIPS:
 * - VehicleSession -> Branch (Many-to-One): Where session happens
 * - VehicleSession -> Lane (Many-to-One): Which lane assigned
 * - VehicleSession -> User (Many-to-One): Cashier who registered
 * - VehicleSession -> Staff (Many-to-One): Operator doing the wash
 * 
 * EXAM TIPS:
 * - This entity demonstrates COMPLEX relationships
 * - Each status change is logged in AuditLog
 * - Timestamps track when each phase started/ended
 * - sourceRequestId allows integration with external systems
 */
@Entity // This class maps to a database table
@Table(name = "vehicle_sessions", indexes = {
        // Index on status for queries like "get all REGISTERED sessions"
        @Index(name = "idx_session_status", columnList = "status"),
        // Index on registration for vehicle history lookups
        @Index(name = "idx_session_registration", columnList = "registration_number")
})
public class VehicleSession extends BaseEntity { // Inherits id, createdAt, updatedAt

    // ==================== GETTER AND SETTER METHODS ====================
    // Demonstrating ENCAPSULATION

    /** @return The branch where this session is taking place */
    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    /** @return The lane assigned to this vehicle */
    public Lane getLane() {
        return lane;
    }

    public void setLane(Lane lane) {
        this.lane = lane;
    }

    /** @return The user (cashier) who registered this vehicle */
    public User getCashierUser() {
        return cashierUser;
    }

    public void setCashierUser(User cashierUser) {
        this.cashierUser = cashierUser;
    }

    /** @return The staff member operating the wash */
    public Staff getOperatorStaff() {
        return operatorStaff;
    }

    public void setOperatorStaff(Staff operatorStaff) {
        this.operatorStaff = operatorStaff;
    }

    /** @return The vehicle's license plate number */
    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    /** @return Customer's name */
    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    /** @return Customer's phone number */
    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    /** @return Type of vehicle (sedan, SUV, truck, etc.) */
    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    /** @return Unique token for customer portal access */
    public String getPortalToken() {
        return portalToken;
    }

    public void setPortalToken(String portalToken) {
        this.portalToken = portalToken;
    }

    /**
     * @return The service package selected (e.g., "Basic Wash", "Premium Detail")
     */
    public String getServicePackage() {
        return servicePackage;
    }

    public void setServicePackage(String servicePackage) {
        this.servicePackage = servicePackage;
    }

    /** @return The customer associated with this session */
    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    /** @return Current status in the workflow */
    public com.carwash.ops.domain.enums.SessionStatus getStatus() {
        return status;
    }

    public void setStatus(com.carwash.ops.domain.enums.SessionStatus status) {
        this.status = status;
    }

    /** @return External system request ID (for integration) */
    public String getSourceRequestId() {
        return sourceRequestId;
    }

    public void setSourceRequestId(String sourceRequestId) {
        this.sourceRequestId = sourceRequestId;
    }

    /** @return The amount charged for this session */
    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    /** @return Whether the session has been paid for */
    public Boolean getPaid() {
        return paid;
    }

    public void setPaid(Boolean paid) {
        this.paid = paid;
    }

    /** @return When the vehicle was first registered */
    public java.time.Instant getAppointmentAt() {
        return appointmentAt;
    }

    public void setAppointmentAt(java.time.Instant appointmentAt) {
        this.appointmentAt = appointmentAt;
    }

    /** @return When the vehicle was first registered */
    public java.time.Instant getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(java.time.Instant registeredAt) {
        this.registeredAt = registeredAt;
    }

    /** @return When the washing phase started */
    public java.time.Instant getWashingStartedAt() {
        return washingStartedAt;
    }

    public void setWashingStartedAt(java.time.Instant washingStartedAt) {
        this.washingStartedAt = washingStartedAt;
    }

    /** @return When the interior cleaning started */
    public java.time.Instant getInteriorStartedAt() {
        return interiorStartedAt;
    }

    public void setInteriorStartedAt(java.time.Instant interiorStartedAt) {
        this.interiorStartedAt = interiorStartedAt;
    }

    /** @return When the inspection started */
    public java.time.Instant getInspectionStartedAt() {
        return inspectionStartedAt;
    }

    public void setInspectionStartedAt(java.time.Instant inspectionStartedAt) {
        this.inspectionStartedAt = inspectionStartedAt;
    }

    /** @return When the session was completed */
    public java.time.Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(java.time.Instant completedAt) {
        this.completedAt = completedAt;
    }

    /** @return Reason for any delay (if applicable) */
    public String getDelayReason() {
        return delayReason;
    }

    public void setDelayReason(String delayReason) {
        this.delayReason = delayReason;
    }

    // ==================== DATABASE RELATIONSHIPS ====================

    /**
     * Many-to-One: Which branch is this session at?
     * Every session MUST have a branch
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false, foreignKey = @ForeignKey(name = "fk_session_branch"))
    private Branch branch;

    /**
     * Many-to-One: Which lane is the vehicle in?
     * Optional - might not be assigned immediately
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lane_id", foreignKey = @ForeignKey(name = "fk_session_lane"))
    private Lane lane;

    /**
     * Many-to-One: Who registered this session?
     * Every session has a cashier who registered it
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cashier_user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_session_cashier_user"))
    private User cashierUser;

    /**
     * Many-to-One: Who is operating?
     * Optional - assigned when wash starts
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_staff_id", foreignKey = @ForeignKey(name = "fk_session_operator_staff"))
    private Staff operatorStaff;

    /**
     * Link to Customer CRM record
     * Optional - a session might be for an anonymous customer initially
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", foreignKey = @ForeignKey(name = "fk_session_customer"))
    private Customer customer;

    // ==================== SIMPLE FIELDS ====================

    /** Vehicle license plate - used for identification and history lookup */
    @Column(name = "registration_number", nullable = false, length = 25)
    private String registrationNumber;

    /** Customer's name - for contact and records */
    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    /** Customer's phone - optional contact */
    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    /** Type of vehicle - affects pricing and process */
    @Column(name = "vehicle_type", nullable = false, length = 50)
    private String vehicleType;

    /** Unique token for customer portal access */
    @Column(name = "portal_token", unique = true, length = 100)
    private String portalToken;

    /** Service package selected - determines process and price */
    @Column(name = "service_package", nullable = false, length = 80)
    private String servicePackage;

    /**
     * Current status - THIS IS THE STATE MACHINE
     * 
     * EXAM TIP: The status field controls the workflow!
     * SessionServiceImpl enforces: REGISTERED → WASHING → INTERIOR → INSPECTION →
     * COMPLETED
     * You can't skip stages - each must happen in order
     */
    @Enumerated(EnumType.STRING) // Store as "REGISTERED", "WASHING", etc.
    @Column(nullable = false, length = 30)
    private SessionStatus status = SessionStatus.REGISTERED; // Default: starts as REGISTERED

    /** External system integration ID - allows matching with external requests */
    @Column(name = "source_request_id", length = 80, unique = true)
    private String sourceRequestId;

    /** Total price for the service */
    @Column(name = "price")
    private Double price = 0.0;

    /** Payment status */
    @Column(name = "is_paid")
    private Boolean paid = false;

    /** Optional future appointment time chosen during booking */
    @Column(name = "appointment_at")
    private Instant appointmentAt;

    /**
     * TIMESTAMPS - Each phase has its own timestamp!
     * This allows tracking exactly how long each step took
     */
    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt; // When customer arrived

    @Column(name = "washing_started_at")
    private Instant washingStartedAt; // When wash started

    @Column(name = "interior_started_at")
    private Instant interiorStartedAt; // When interior cleaning started

    @Column(name = "inspection_started_at")
    private Instant inspectionStartedAt; // When quality check started

    @Column(name = "completed_at")
    private Instant completedAt; // When session finished

    /** If there's any delay, this records why */
    @Column(name = "delay_reason", length = 255)
    private String delayReason;
}
