package com.carwash.ops.service;

import com.carwash.ops.domain.enums.SessionStatus;
import com.carwash.ops.dto.session.CreateVehicleSessionRequest;
import com.carwash.ops.dto.session.InspectionRequest;
import com.carwash.ops.dto.session.MatsTrackingRequest;
import com.carwash.ops.dto.session.PaymentRequest;
import com.carwash.ops.dto.session.SessionActionRequest;
import com.carwash.ops.dto.session.SessionMessageRequest;
import com.carwash.ops.dto.session.SessionMessageResponse;
import com.carwash.ops.dto.session.SessionPaymentResponse;
import com.carwash.ops.dto.session.SignatureRequest;
import com.carwash.ops.dto.session.VehicleHistoryResponse;
import com.carwash.ops.dto.session.VehicleSessionResponse;
import java.util.List;

public interface SessionService {
    VehicleSessionResponse create(CreateVehicleSessionRequest request, String username);
    List<VehicleSessionResponse> list(Long branchId, SessionStatus status);
    VehicleSessionResponse startWash(Long sessionId, SessionActionRequest request, String username);
    VehicleSessionResponse recordMats(Long sessionId, MatsTrackingRequest request, String username);
    VehicleSessionResponse captureSignature(Long sessionId, SignatureRequest request, String username);
    VehicleSessionResponse inspect(Long sessionId, InspectionRequest request, String username);
    VehicleSessionResponse complete(Long sessionId, String username);
    VehicleHistoryResponse searchByRegistration(String registrationNumber);
    VehicleSessionResponse processPayment(Long sessionId, PaymentRequest request, String username);
    VehicleSessionResponse findByPortalToken(String token);

    VehicleSessionResponse findActiveByRegistrationAndPhone(String reg, String phone);
    VehicleSessionResponse findActiveByRegistrationAndEmail(String reg, String email);

    VehicleSessionResponse book(CreateVehicleSessionRequest request);
    List<SessionMessageResponse> listMessages(Long sessionId);
    List<SessionMessageResponse> listMessagesByPortalToken(String token);
    SessionMessageResponse sendStaffMessage(Long sessionId, SessionMessageRequest request, String username);
    SessionMessageResponse sendCustomerMessage(String token, SessionMessageRequest request);
    List<SessionPaymentResponse> listPayments(Long sessionId);
    List<SessionPaymentResponse> listPaymentsByPortalToken(String token);
}
