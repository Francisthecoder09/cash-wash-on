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
@Table(name = "mats_tracking")
public class MatsTracking extends BaseEntity {
    public VehicleSession getVehicleSession() { return vehicleSession; }
    public void setVehicleSession(VehicleSession vehicleSession) { this.vehicleSession = vehicleSession; }
    public int getMatsRemoved() { return matsRemoved; }
    public void setMatsRemoved(int matsRemoved) { this.matsRemoved = matsRemoved; }
    public int getMatsReinstalled() { return matsReinstalled; }
    public void setMatsReinstalled(int matsReinstalled) { this.matsReinstalled = matsReinstalled; }
    public String getConditionNotes() { return conditionNotes; }
    public void setConditionNotes(String conditionNotes) { this.conditionNotes = conditionNotes; }

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_session_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_mats_session"))
    private VehicleSession vehicleSession;

    @Column(name = "mats_removed", nullable = false)
    private int matsRemoved;

    @Column(name = "mats_reinstalled", nullable = false)
    private int matsReinstalled;

    @Column(name = "condition_notes", length = 255)
    private String conditionNotes;
}
