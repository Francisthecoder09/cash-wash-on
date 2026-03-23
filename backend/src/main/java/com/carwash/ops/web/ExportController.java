package com.carwash.ops.web;

import com.carwash.ops.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {
    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    // READ — AUDITOR can export reports (read-only)
    @GetMapping("/csv")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','AUDITOR')")
    public ResponseEntity<byte[]> exportCsv(@RequestParam Long branchId) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sessions.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(exportService.exportCsv(branchId));
    }

    @GetMapping("/excel")
    @PreAuthorize("hasAnyRole('ADMIN','BRANCH_MANAGER','AUDITOR')")
    public ResponseEntity<byte[]> exportExcel(@RequestParam Long branchId) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sessions.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(exportService.exportExcel(branchId));
    }
}
