package com.carwash.ops.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
@Entity
@Table(name = "inspections")
public class Inspection extends BaseEntity {
    public VehicleSession getVehicleSession() { return vehicleSession; }
    public void setVehicleSession(VehicleSession vehicleSession) { this.vehicleSession = vehicleSession; }
    public Staff getInspectorStaff() { return inspectorStaff; }
    public void setInspectorStaff(Staff inspectorStaff) { this.inspectorStaff = inspectorStaff; }
    public boolean isBodyCheckPassed() { return bodyCheckPassed; }
    public void setBodyCheckPassed(boolean bodyCheckPassed) { this.bodyCheckPassed = bodyCheckPassed; }
    public boolean isInteriorCheckPassed() { return interiorCheckPassed; }
    public void setInteriorCheckPassed(boolean interiorCheckPassed) { this.interiorCheckPassed = interiorCheckPassed; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_session_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_inspection_session"))
    private VehicleSession vehicleSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inspector_staff_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inspection_staff"))
    private Staff inspectorStaff;

    @Column(name = "body_check_passed", nullable = false)
    private boolean bodyCheckPassed;

    @Column(name = "interior_check_passed", nullable = false)
    private boolean interiorCheckPassed;

    @Column(name = "notes", length = 255)
    private String notes;
}
