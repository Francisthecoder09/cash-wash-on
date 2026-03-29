package com.carwash.ops.domain.entity;

import com.carwash.ops.domain.enums.SessionMessageSenderType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "session_messages")
public class SessionMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_session_id", nullable = false)
    private VehicleSession vehicleSession;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 20)
    private SessionMessageSenderType senderType;

    @Column(name = "sender_name", nullable = false, length = 120)
    private String senderName;

    @Column(name = "message_body", nullable = false, columnDefinition = "TEXT")
    private String messageBody;

    public VehicleSession getVehicleSession() {
        return vehicleSession;
    }

    public void setVehicleSession(VehicleSession vehicleSession) {
        this.vehicleSession = vehicleSession;
    }

    public SessionMessageSenderType getSenderType() {
        return senderType;
    }

    public void setSenderType(SessionMessageSenderType senderType) {
        this.senderType = senderType;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getMessageBody() {
        return messageBody;
    }

    public void setMessageBody(String messageBody) {
        this.messageBody = messageBody;
    }
}
