package com.carwash.ops.domain.entity;

import com.carwash.ops.domain.enums.PaymentMethod;
import com.carwash.ops.domain.enums.PaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "session_payments")
public class SessionPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_session_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payment_vehicle_session"))
    private VehicleSession vehicleSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_user_id", foreignKey = @ForeignKey(name = "fk_payment_processed_by_user"))
    private User processedByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "reference_number", length = 120)
    private String referenceNumber;

    @Column(name = "payment_notes", length = 500)
    private String paymentNotes;

    @Column(name = "paid_at", nullable = false)
    private Instant paidAt;

    public VehicleSession getVehicleSession() {
        return vehicleSession;
    }

    public void setVehicleSession(VehicleSession vehicleSession) {
        this.vehicleSession = vehicleSession;
    }

    public User getProcessedByUser() {
        return processedByUser;
    }

    public void setProcessedByUser(User processedByUser) {
        this.processedByUser = processedByUser;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getPaymentNotes() {
        return paymentNotes;
    }

    public void setPaymentNotes(String paymentNotes) {
        this.paymentNotes = paymentNotes;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Instant paidAt) {
        this.paidAt = paidAt;
    }
}
