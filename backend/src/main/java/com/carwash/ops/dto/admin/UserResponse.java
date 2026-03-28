package com.carwash.ops.dto.admin;

public class UserResponse {

    private Long id;
    private String username;
    private String role;
    private boolean active;
    private Long branchId;
    private String staffName;

    public UserResponse() {
    }

    public UserResponse(Long id, String username, String role, boolean active, Long branchId, String staffName) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.active = active;
        this.branchId = branchId;
        this.staffName = staffName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Long getBranchId() {
        return branchId;
    }

    public void setBranchId(Long branchId) {
        this.branchId = branchId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }
}
