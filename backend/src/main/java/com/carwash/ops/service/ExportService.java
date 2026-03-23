package com.carwash.ops.service;

public interface ExportService {
    byte[] exportCsv(Long branchId);
    byte[] exportExcel(Long branchId);
}
