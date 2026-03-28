package com.carwash.ops.service.impl;

import com.carwash.ops.common.ApiException;
import com.carwash.ops.domain.entity.User;
import com.carwash.ops.domain.enums.AuditAction;
import com.carwash.ops.dto.auth.AuthResponse;
import com.carwash.ops.dto.auth.LoginRequest;
import com.carwash.ops.repository.UserRepository;
import com.carwash.ops.security.AuthenticatedUser;
import com.carwash.ops.security.JwtService;
import com.carwash.ops.service.AuditService;
import com.carwash.ops.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.pin()));
        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();
        User user = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (request.role() != null && !user.getRole().equals(request.role())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Access denied: Required role " + request.role() + " not found.");
        }

        auditService.log(user, null, AuditAction.LOGIN, "User logged in with role: " + user.getRole(), null);
        return new AuthResponse(
                jwtService.generateToken(authenticatedUser),
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getBranch().getId(),
                user.getStaff().getId());
    }
}
