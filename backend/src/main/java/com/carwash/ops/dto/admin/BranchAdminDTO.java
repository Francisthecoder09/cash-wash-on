package com.carwash.ops.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

public class BranchAdminDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchResponse {
        private Long id;
        private String name;
        private String location;
        private String timezone;
        private Boolean active;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBranchRequest {
        private String name;
        private String location;
        private String timezone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBranchRequest {
        private String name;
        private String location;
        private String timezone;
    }
}
