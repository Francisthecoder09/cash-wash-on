package com.carwash.ops.service.impl;

import com.carwash.ops.common.ApiException;
import com.carwash.ops.domain.entity.Branch;
import com.carwash.ops.domain.entity.Lane;
import com.carwash.ops.domain.entity.Staff;
import com.carwash.ops.domain.entity.User;
import com.carwash.ops.domain.enums.RoleName;
import com.carwash.ops.dto.admin.AdminDashboardResponse;
import com.carwash.ops.dto.admin.CreateBranchRequest;
import com.carwash.ops.dto.admin.CreateLaneRequest;
import com.carwash.ops.dto.admin.CreateStaffRequest;
import com.carwash.ops.dto.admin.CreateUserRequest;
import com.carwash.ops.repository.BranchRepository;
import com.carwash.ops.repository.LaneRepository;
import com.carwash.ops.repository.StaffRepository;
import com.carwash.ops.repository.UserRepository;
import com.carwash.ops.repository.VehicleSessionRepository;
import com.carwash.ops.service.AdminService;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final BranchRepository branchRepository;
    private final LaneRepository laneRepository;
    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final VehicleSessionRepository vehicleSessionRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(
            BranchRepository branchRepository,
            LaneRepository laneRepository,
            StaffRepository staffRepository,
            UserRepository userRepository,
            VehicleSessionRepository vehicleSessionRepository,
            PasswordEncoder passwordEncoder) {
        this.branchRepository = branchRepository;
        this.laneRepository = laneRepository;
        this.staffRepository = staffRepository;
        this.userRepository = userRepository;
        this.vehicleSessionRepository = vehicleSessionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ========== Branch Operations ==========

    @Override
    public Branch createBranch(CreateBranchRequest request) {
        Branch branch = new Branch();
        branch.setName(request.getName());
        branch.setLocation(request.getLocation());
        branch.setTimezone(request.getTimezone() != null ? request.getTimezone() : "Africa/Accra");
        branch.setActive(true);
        return branchRepository.save(branch);
    }

    @Override
    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    @Override
    public Branch getBranchById(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Branch not found: " + id));
    }

    @Override
    public Branch updateBranch(Long id, CreateBranchRequest request) {
        Branch branch = getBranchById(id);
        branch.setName(request.getName());
        branch.setLocation(request.getLocation());
        branch.setTimezone(request.getTimezone() != null ? request.getTimezone() : branch.getTimezone());
        return branchRepository.save(branch);
    }

    @Override
    public void deleteBranch(Long id) {
        Branch branch = getBranchById(id);
        branch.setActive(false);
        branchRepository.save(branch);
    }

    // ========== Lane Operations ==========

    @Override
    public Lane createLane(CreateLaneRequest request) {
        Branch branch = getBranchById(request.getBranchId());
        Lane lane = new Lane();
        lane.setBranch(branch);
        lane.setLaneName(request.getLaneName());
        lane.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 1);
        lane.setActive(true);
        return laneRepository.save(lane);
    }

    @Override
    public List<Lane> getLanesByBranch(Long branchId) {
        return laneRepository.findByBranch_Id(branchId);
    }

    @Override
    public List<Lane> getAllLanes() {
        return laneRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    @Override
    public Lane updateLane(Long id, CreateLaneRequest request) {
        Lane lane = laneRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Lane not found: " + id));

        if (request.getBranchId() != null) {
            Branch branch = getBranchById(request.getBranchId());
            lane.setBranch(branch);
        }
        lane.setLaneName(request.getLaneName());
        if (request.getDisplayOrder() != null) {
            lane.setDisplayOrder(request.getDisplayOrder());
        }
        return laneRepository.save(lane);
    }

    @Override
    public void deleteLane(Long id) {
        Lane lane = laneRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Lane not found: " + id));
        lane.setActive(false);
        laneRepository.save(lane);
    }

    // ========== User Operations ==========

    @Override
    public User createUser(CreateUserRequest request) {
        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw ApiException.badRequest("Username already exists: " + request.getUsername());
        }

        Branch branch = getBranchById(request.getBranchId());
        Staff staff = null;
        if (request.getStaffId() != null) {
            staff = staffRepository.findById(request.getStaffId())
                    .orElseThrow(() -> ApiException.notFound("Staff not found: " + request.getStaffId()));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(RoleName.valueOf(request.getRole()));
        user.setBranch(branch);
        user.setStaff(staff);
        user.setActive(true);

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByBranch(Long branchId) {
        return userRepository.findByBranch_Id(branchId);
    }

    @Override
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    // ========== Staff Operations ==========

    @Override
    public Staff createStaff(CreateStaffRequest request) {
        Branch branch = getBranchById(request.getBranchId());

        Staff staff = new Staff();
        staff.setBranch(branch);
        staff.setFullName(request.getFullName());
        staff.setEmployeeCode(request.getEmployeeCode());
        staff.setPhone(request.getPhone());
        staff.setActive(true);

        return staffRepository.save(staff);
    }

    @Override
    public List<Staff> getStaffByBranch(Long branchId) {
        return staffRepository.findByBranch_Id(branchId);
    }

    // ========== Dashboard Operations ==========

    @Override
    public AdminDashboardResponse getDashboard() {
        List<Branch> branches = branchRepository.findAll();
        long totalBranches = branches.size();
        long activeBranches = branches.stream().filter(Branch::isActive).count();

        List<Lane> allLanes = laneRepository.findAll();
        long totalLanes = allLanes.size();
        long activeLanes = allLanes.stream().filter(Lane::isActive).count();

        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();

        List<Staff> allStaff = staffRepository.findAll();
        long totalStaff = allStaff.size();

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        var todayStart = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        var todayEnd = today.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        var weekStart = today.minusDays(7).atStartOfDay().toInstant(ZoneOffset.UTC);
        var monthStart = today.minusDays(30).atStartOfDay().toInstant(ZoneOffset.UTC);

        long vehiclesToday = vehicleSessionRepository.countByCompletedAtBetween(todayStart, todayEnd);
        long vehiclesThisWeek = vehicleSessionRepository.countByCompletedAtBetween(weekStart, todayEnd);
        long vehiclesThisMonth = vehicleSessionRepository.countByCompletedAtBetween(monthStart, todayEnd);

        // Branch stats
        List<AdminDashboardResponse.BranchStats> branchStats = new ArrayList<>();
        for (Branch branch : branches) {
            long branchLanes = allLanes.stream()
                    .filter(l -> l.getBranch().getId().equals(branch.getId()))
                    .filter(Lane::isActive)
                    .count();

            long branchVehiclesToday = vehicleSessionRepository.countByBranch_IdAndCompletedAtBetween(
                    branch.getId(), todayStart, todayEnd);
            long branchVehiclesWeek = vehicleSessionRepository.countByBranch_IdAndCompletedAtBetween(
                    branch.getId(), weekStart, todayEnd);

            double completionRate = vehiclesThisMonth > 0
                    ? (double) branchVehiclesWeek / vehiclesThisWeek * 100
                    : 0;

            branchStats.add(new AdminDashboardResponse.BranchStats(
                    branch.getId(),
                    branch.getName(),
                    branch.getLocation(),
                    branchLanes,
                    branchVehiclesToday,
                    branchVehiclesWeek,
                    completionRate));
        }

        // Daily trend (last 7 days)
        List<AdminDashboardResponse.DailyVehicleCount> dailyTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            var dayStart = day.atStartOfDay().toInstant(ZoneOffset.UTC);
            var dayEnd = day.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            long count = vehicleSessionRepository.countByCompletedAtBetween(dayStart, dayEnd);
            dailyTrend.add(new AdminDashboardResponse.DailyVehicleCount(
                    day.toString(),
                    count));
        }

        return new AdminDashboardResponse(
                totalBranches,
                activeBranches,
                totalLanes,
                activeLanes,
                totalUsers,
                totalStaff,
                vehiclesToday,
                vehiclesThisWeek,
                vehiclesThisMonth,
                branchStats,
                dailyTrend);
    }
}
