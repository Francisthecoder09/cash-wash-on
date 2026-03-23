package com.carwash.ops.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLaneRequest {
    @NotBlank(message = "Lane name is required")
    private String laneName;

    @NotNull(message = "Branch ID is required")
    private Long branchId;

    private Integer displayOrder;
}
