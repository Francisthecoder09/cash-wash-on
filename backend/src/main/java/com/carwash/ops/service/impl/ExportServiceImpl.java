package com.carwash.ops.service.impl;

import com.carwash.ops.domain.enums.SessionStatus;
import com.carwash.ops.repository.VehicleSessionRepository;
import com.carwash.ops.service.ExportService;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExportServiceImpl implements ExportService {

    private final VehicleSessionRepository vehicleSessionRepository;

    public ExportServiceImpl(VehicleSessionRepository vehicleSessionRepository) {
        this.vehicleSessionRepository = vehicleSessionRepository;
    }

    @Override
    public byte[] exportCsv(Long branchId) {
        StringBuilder builder = new StringBuilder();
        builder.append("Session ID,Registration Number,Customer,Branch,Lane,Status,Registered At,Completed At\n");
        vehicleSessionRepository.findFiltered(branchId, SessionStatus.COMPLETED).forEach(session -> builder
                .append(session.getId()).append(',')
                .append(session.getRegistrationNumber()).append(',')
                .append(session.getCustomerName()).append(',')
                .append(session.getBranch().getName()).append(',')
                .append(session.getLane() == null ? "" : session.getLane().getLaneName()).append(',')
                .append(session.getStatus()).append(',')
                .append(session.getRegisteredAt()).append(',')
                .append(session.getCompletedAt()).append('\n'));
        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] exportExcel(Long branchId) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("Sessions");
            List<String> headers = List.of("Session ID", "Registration Number", "Customer", "Branch", "Lane", "Status", "Registered At", "Completed At");
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                headerRow.createCell(i).setCellValue(headers.get(i));
            }
            var sessions = vehicleSessionRepository.findFiltered(branchId, null);
            for (int i = 0; i < sessions.size(); i++) {
                var session = sessions.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(session.getId());
                row.createCell(1).setCellValue(session.getRegistrationNumber());
                row.createCell(2).setCellValue(session.getCustomerName());
                row.createCell(3).setCellValue(session.getBranch().getName());
                row.createCell(4).setCellValue(session.getLane() == null ? "" : session.getLane().getLaneName());
                row.createCell(5).setCellValue(session.getStatus().name());
                row.createCell(6).setCellValue(String.valueOf(session.getRegisteredAt()));
                row.createCell(7).setCellValue(String.valueOf(session.getCompletedAt()));
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to export excel", ex);
        }
    }
}
