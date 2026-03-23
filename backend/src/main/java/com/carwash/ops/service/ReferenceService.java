package com.carwash.ops.service;

import com.carwash.ops.dto.common.SelectOptionDto;
import java.util.List;

public interface ReferenceService {
    List<SelectOptionDto> getBranches();
    List<SelectOptionDto> getLanes(Long branchId);
    List<SelectOptionDto> getStaff(Long branchId);
}
