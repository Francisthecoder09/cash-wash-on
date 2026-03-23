package com.carwash.ops.service;

import com.carwash.ops.dto.admin.AdminDashboardResponse;
import com.carwash.ops.dto.admin.CreateBranchRequest;
import com.carwash.ops.dto.admin.CreateLaneRequest;
import com.carwash.ops.dto.admin.CreateStaffRequest;
import com.carwash.ops.dto.admin.CreateUserRequest;
import com.carwash.ops.domain.entity.Branch;
import com.carwash.ops.domain.entity.Lane;
import com.carwash.ops.domain.entity.Staff;
import com.carwash.ops.domain.entity.User;
import java.util.List;

public interface AdminService {
    // Branch operations
    Branch createBranch(CreateBranchRequest request);

    List<Branch> getAllBranches();

    Branch getBranchById(Long id);

    Branch updateBranch(Long id, CreateBranchRequest request);

    void deleteBranch(Long id);

    // Lane operations
    Lane createLane(CreateLaneRequest request);

    List<Lane> getLanesByBranch(Long branchId);

    List<Lane> getAllLanes();

    Lane updateLane(Long id, CreateLaneRequest request);

    void deleteLane(Long id);

    // User operations
    User createUser(CreateUserRequest request);

    List<User> getAllUsers();

    List<User> getUsersByBranch(Long branchId);

    void deactivateUser(Long id);

    // Staff operations
    Staff createStaff(CreateStaffRequest request);

    List<Staff> getStaffByBranch(Long branchId);

    // Dashboard operations
    AdminDashboardResponse getDashboard();
}
