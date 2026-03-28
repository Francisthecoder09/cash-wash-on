package com.carwash.ops.web;

import com.carwash.ops.domain.entity.Branch;
import com.carwash.ops.domain.entity.Lane;
import com.carwash.ops.domain.entity.Staff;
import com.carwash.ops.domain.entity.User;
import com.carwash.ops.dto.admin.AdminDashboardResponse;
import com.carwash.ops.dto.admin.CreateBranchRequest;
import com.carwash.ops.dto.admin.CreateLaneRequest;
import com.carwash.ops.dto.admin.CreateStaffRequest;
import com.carwash.ops.dto.admin.CreateUserRequest;
import com.carwash.ops.dto.admin.StaffResponse;
import com.carwash.ops.dto.admin.UserResponse;
import com.carwash.ops.dto.admin.ServiceAdminDTO;
import com.carwash.ops.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ========== Branch Endpoints ==========

    @PostMapping("/branches")
    public ResponseEntity<Branch> createBranch(@Valid @RequestBody CreateBranchRequest request) {
        Branch branch = adminService.createBranch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(branch);
    }

    @GetMapping("/branches")
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(adminService.getAllBranches());
    }

    @GetMapping("/branches/{id}")
    public ResponseEntity<Branch> getBranchById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getBranchById(id));
    }

    @PutMapping("/branches/{id}")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long id, @Valid @RequestBody CreateBranchRequest request) {
        return ResponseEntity.ok(adminService.updateBranch(id, request));
    }

    @DeleteMapping("/branches/{id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        adminService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Lane Endpoints ==========

    @PostMapping("/lanes")
    public ResponseEntity<Lane> createLane(@Valid @RequestBody CreateLaneRequest request) {
        Lane lane = adminService.createLane(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(lane);
    }

    @GetMapping("/lanes")
    public ResponseEntity<List<Lane>> getLanes(@RequestParam(required = false) Long branchId) {
        if (branchId != null) {
            return ResponseEntity.ok(adminService.getLanesByBranch(branchId));
        }
        return ResponseEntity.ok(adminService.getAllLanes());
    }

    @GetMapping("/branches/{branchId}/lanes")
    public ResponseEntity<List<Lane>> getLanesByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(adminService.getLanesByBranch(branchId));
    }

    @PutMapping("/lanes/{id}")
    public ResponseEntity<Lane> updateLane(@PathVariable Long id, @Valid @RequestBody CreateLaneRequest request) {
        return ResponseEntity.ok(adminService.updateLane(id, request));
    }

    @DeleteMapping("/lanes/{id}")
    public ResponseEntity<Void> deleteLane(@PathVariable Long id) {
        adminService.deleteLane(id);
        return ResponseEntity.noContent().build();
    }

    // ========== User Endpoints ==========

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = adminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToUserResponse(user));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false) Long branchId) {
        List<User> users;
        if (branchId != null) {
            users = adminService.getUsersByBranch(branchId);
        } else {
            users = adminService.getAllUsers();
        }
        List<UserResponse> response = users.stream().map(this::mapToUserResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        adminService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Staff Endpoints ==========

    @PostMapping("/staff")
    public ResponseEntity<Staff> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        Staff staff = adminService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(staff);
    }

    @Transactional(readOnly = true)
    @GetMapping("/branches/{branchId}/staff")
    public ResponseEntity<List<StaffResponse>> getStaffByBranch(@PathVariable Long branchId) {
        List<StaffResponse> staffList = adminService.getStaffByBranch(branchId).stream()
                .map(staff -> new StaffResponse(
                        staff.getId(),
                        staff.getBranch() != null ? staff.getBranch().getId() : null,
                        staff.getFullName(),
                        staff.getEmployeeCode(),
                        staff.getPhone(),
                        staff.isActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(staffList);
    }


    // Service and Pricing endpoints are now handled by ServiceAdminController

    // ========== Dashboard Endpoint ==========

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setBranchId(user.getBranch() != null ? user.getBranch().getId() : null);
        if (user.getStaff() != null) {
            dto.setStaffName(user.getStaff().getFullName());
        }
        return dto;
    }
}
