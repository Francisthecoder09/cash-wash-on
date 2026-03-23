package com.carwash.ops.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBranchRequest {
    @NotBlank(message = "Branch name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    private String timezone;
}
