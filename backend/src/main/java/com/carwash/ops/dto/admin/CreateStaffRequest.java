package com.carwash.ops.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateStaffRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Employee code is required")
    private String employeeCode;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotNull(message = "Branch ID is required")
    private Long branchId;
}
