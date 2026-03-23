package com.carwash.ops.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

public class StaffAdminDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffResponse {
        private Long id;
        private String fullName;
        private String employeeCode;
        private String phone;
        private Long branchId;
        private String branchName;
        private Boolean active;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateStaffRequest {
        private String fullName;
        private String employeeCode;
        private String phone;
        private Long branchId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStaffRequest {
        private String fullName;
        private String phone;
        private Long branchId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffPerformanceResponse {
        private Long staffId;
        private int totalSessions;
        private int completedSessions;
    }
}
