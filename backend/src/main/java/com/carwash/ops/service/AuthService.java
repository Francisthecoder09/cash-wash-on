package com.carwash.ops.service;

import com.carwash.ops.dto.auth.AuthResponse;
import com.carwash.ops.dto.auth.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}
