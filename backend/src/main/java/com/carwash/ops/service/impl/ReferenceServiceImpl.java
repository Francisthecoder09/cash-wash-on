package com.carwash.ops.service.impl;

import com.carwash.ops.dto.common.SelectOptionDto;
import com.carwash.ops.repository.BranchRepository;
import com.carwash.ops.repository.LaneRepository;
import com.carwash.ops.repository.StaffRepository;
import com.carwash.ops.service.ReferenceService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReferenceServiceImpl implements ReferenceService {

    private final BranchRepository branchRepository;
    private final LaneRepository laneRepository;
    private final StaffRepository staffRepository;

    public ReferenceServiceImpl(
            BranchRepository branchRepository,
            LaneRepository laneRepository,
            StaffRepository staffRepository) {
        this.branchRepository = branchRepository;
        this.laneRepository = laneRepository;
        this.staffRepository = staffRepository;
    }

    @Override
    public List<SelectOptionDto> getBranches() {
        return branchRepository.findAll().stream().map(branch -> new SelectOptionDto(branch.getId(), branch.getName()))
                .toList();
    }

    @Override
    public List<SelectOptionDto> getLanes(Long branchId) {
        return laneRepository.findByBranch_IdOrderByDisplayOrderAsc(branchId).stream()
                .map(lane -> new SelectOptionDto(lane.getId(), lane.getLaneName()))
                .toList();
    }

    @Override
    public List<SelectOptionDto> getStaff(Long branchId) {
        return staffRepository.findAll().stream()
                .filter(staff -> staff.getBranch().getId().equals(branchId))
                .map(staff -> new SelectOptionDto(staff.getId(), staff.getFullName()))
                .toList();
    }
}
