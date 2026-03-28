package com.carwash.ops.dto.admin;

/**
 * Staff DTO for API responses
 * This is a simple DTO to match the frontend Staff interface
 */
public class StaffResponse {

    private Long id;
    private Long branchId;
    private String fullName;
    private String employeeCode;
    private String phone;
    private boolean active;

    public StaffResponse() {
    }

    public StaffResponse(Long id, Long branchId, String fullName, String employeeCode,
            String phone, boolean active) {
        this.id = id;
        this.branchId = branchId;
        this.fullName = fullName;
        this.employeeCode = employeeCode;
        this.phone = phone;
        this.active = active;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBranchId() {
        return branchId;
    }

    public void setBranchId(Long branchId) {
        this.branchId = branchId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}