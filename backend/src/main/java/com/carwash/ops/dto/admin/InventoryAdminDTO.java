package com.carwash.ops.dto.admin;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryAdminDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryResponse {
        private Long id;
        private String itemName;
        private String description;
        private String category;
        private Integer quantity;
        private Integer currentStock;
        private Integer minStockLevel;
        private String unitOfMeasure;
        private BigDecimal unitCost;
        private Long branchId;
        private String branchName;
        private LocalDateTime lastRestockDate;
        private Boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateInventoryRequest {
        private String itemName;
        private String description;
        private String category;
        private Integer quantity;
        private String unitOfMeasure;
        private Integer minStockLevel;
        private BigDecimal unitCost;
        private Long branchId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateInventoryRequest {
        private String itemName;
        private String description;
        private String category;
        private Integer minStockLevel;
        private BigDecimal unitCost;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RestockRequest {
        private Integer quantity;
    }

    // System Settings DTOs
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemSettingResponse {
        private Long id;
        private String settingKey;
        private String settingValue;
        private String settingType;
        private String description;
        private Boolean editable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateSettingRequest {
        private String value;
    }

    // Analytics & Reports DTOs
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminDashboardResponse {
        private int totalUsers;
        private int activeUsers;
        private int totalBranches;
        private int totalStaff;
        private int vehiclesToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueReportResponse {
        private String period;
        private BigDecimal totalRevenue;
        private int totalTransactions;
        private BigDecimal averageTransaction;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceUsageResponse {
        private String serviceName;
        private int usageCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeakHoursResponse {
        private int hour;
        private int sessionCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchComparisonResponse {
        private java.util.List<String> branchNames;
        private java.util.List<Integer> vehicleCounts;
        private java.util.List<BigDecimal> revenues;
    }
}
