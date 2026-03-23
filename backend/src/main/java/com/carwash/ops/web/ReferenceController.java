package com.carwash.ops.web;

import com.carwash.ops.dto.common.SelectOptionDto;
import com.carwash.ops.service.ReferenceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/reference")
public class ReferenceController {
    private final ReferenceService referenceService;

    public ReferenceController(ReferenceService referenceService) {
        this.referenceService = referenceService;
    }

    // READ — all roles including AUDITOR need branch/lane/staff lookups
    @GetMapping("/branches")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public List<SelectOptionDto> branches() {
        return referenceService.getBranches();
    }

    @GetMapping("/branches/{branchId}/lanes")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','CASHIER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public List<SelectOptionDto> lanes(@PathVariable Long branchId) {
        return referenceService.getLanes(branchId);
    }

    @GetMapping("/branches/{branchId}/staff")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','LANE_OPERATOR','INSPECTOR','AUDITOR')")
    public List<SelectOptionDto> staff(@PathVariable Long branchId) {
        return referenceService.getStaff(branchId);
    }
}
