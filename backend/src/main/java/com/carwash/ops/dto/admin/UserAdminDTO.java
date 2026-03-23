package com.carwash.ops.dto.admin;

import lombok.*;

import java.time.LocalDateTime;

public class UserAdminDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String username;
        private String role;
        private Long branchId;
        private Long staffId;
        private Boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String role;
        private Long branchId;
        private Long staffId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String role;
        private Long branchId;
        private Long staffId;
    }
}
