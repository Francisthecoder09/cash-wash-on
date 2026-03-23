package com.carwash.ops.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
@Entity
@Table(name = "signatures")
public class Signature extends BaseEntity {
    public VehicleSession getVehicleSession() { return vehicleSession; }
    public void setVehicleSession(VehicleSession vehicleSession) { this.vehicleSession = vehicleSession; }
    public String getSignedBy() { return signedBy; }
    public void setSignedBy(String signedBy) { this.signedBy = signedBy; }
    public String getSignatureDataUrl() { return signatureDataUrl; }
    public void setSignatureDataUrl(String signatureDataUrl) { this.signatureDataUrl = signatureDataUrl; }

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_session_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_signature_session"))
    private VehicleSession vehicleSession;

    @Column(name = "signed_by", nullable = false, length = 120)
    private String signedBy;

    @Column(name = "signature_data_url", nullable = false, columnDefinition = "LONGTEXT")
    private String signatureDataUrl;
}
