package com.carwash.ops.service.impl;

import com.carwash.ops.domain.entity.Customer;
import com.carwash.ops.domain.entity.VehicleSession;
import com.carwash.ops.dto.customer.CustomerAccountLoginRequest;
import com.carwash.ops.dto.customer.CustomerAccountLoginResponse;
import com.carwash.ops.dto.customer.CustomerDashboardResponse;
import com.carwash.ops.dto.customer.CustomerRegistrationRequest;
import com.carwash.ops.repository.CustomerRepository;
import com.carwash.ops.repository.VehicleSessionRepository;
import com.carwash.ops.service.CustomerService;
import com.carwash.ops.common.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final VehicleSessionRepository vehicleSessionRepository;
    private final PasswordEncoder passwordEncoder;

    private String normalizePhone(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim().replaceAll("[^\\d+]", "");
        String digits = trimmed.replaceAll("\\D", "");
        if (digits.length() > 13) {
            digits = digits.substring(0, 13);
        }
        return trimmed.startsWith("+") ? "+" + digits : digits;
    }

    private String normalizeEmail(String value) {
        return value == null || value.isBlank() ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeUsername(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]", "");
    }

    @Override
    @Transactional
    public Customer getOrCreateCustomer(String phone, String fullName, String email) {
        String normalizedEmail = normalizeEmail(email);
        return customerRepository.findByPhone(phone)
                .map(customer -> {
                    boolean changed = false;
                    if (fullName != null && !fullName.isEmpty() && !fullName.equals(customer.getFullName())) {
                        customer.setFullName(fullName);
                        changed = true;
                    }
                    if (normalizedEmail != null && !normalizedEmail.equals(customer.getEmail())) {
                        customer.setEmail(normalizedEmail);
                        changed = true;
                    }
                    return changed ? customerRepository.save(customer) : customer;
                })
                .orElseGet(() -> {
                    Customer newCustomer = new Customer();
                    newCustomer.setFullName(fullName);
                    newCustomer.setPhone(phone);
                    newCustomer.setEmail(normalizedEmail);
                    newCustomer.setTotalVisits(0);
                    newCustomer.setLoyaltyPoints(0);
                    return customerRepository.save(newCustomer);
                });
    }

    @Override
    @Transactional
    public Customer registerCustomer(CustomerRegistrationRequest request) {
        String fullName = request.fullName() == null ? "" : request.fullName().trim();
        String normalizedUsername = normalizeUsername(request.username());
        String normalizedPhone = normalizePhone(request.phone());
        String normalizedEmail = normalizeEmail(request.email());
        String pin = request.pin() == null ? "" : request.pin().trim();

        if (fullName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Full name is required");
        }
        if (normalizedUsername == null || normalizedUsername.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (normalizedPhone.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Phone number is required");
        }
        if (normalizedEmail == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email address is required");
        }
        if (pin.length() < 4) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PIN must be at least 4 digits");
        }

        customerRepository.findByPhone(normalizedPhone).ifPresent(existing -> {
            throw new ApiException(HttpStatus.CONFLICT, "A customer with this phone number already exists");
        });

        customerRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(existing -> {
            throw new ApiException(HttpStatus.CONFLICT, "A customer with this email address already exists");
        });

        customerRepository.findByUsernameIgnoreCase(normalizedUsername).ifPresent(existing -> {
            throw new ApiException(HttpStatus.CONFLICT, "That username is already in use");
        });

        Customer customer = new Customer();
        customer.setFullName(fullName);
        customer.setUsername(normalizedUsername);
        customer.setPhone(normalizedPhone);
        customer.setEmail(normalizedEmail);
        customer.setPinHash(passwordEncoder.encode(pin));
        customer.setTotalVisits(0);
        customer.setLoyaltyPoints(0);
        return customerRepository.save(customer);
    }

    @Override
    public CustomerAccountLoginResponse loginCustomer(CustomerAccountLoginRequest request) {
        String normalizedUsername = normalizeUsername(request.username());
        String normalizedEmail = normalizeEmail(request.email());
        String pin = request.pin() == null ? "" : request.pin().trim();

        Customer customer = customerRepository
                .findByUsernameIgnoreCaseAndEmailIgnoreCase(normalizedUsername, normalizedEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username, email, or PIN"));

        if (customer.getPinHash() == null || !passwordEncoder.matches(pin, customer.getPinHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username, email, or PIN");
        }

        String activePortalToken = vehicleSessionRepository.findActiveByCustomerId(customer.getId()).stream()
                .findFirst()
                .map(session -> session.getPortalToken())
                .orElse(null);

        return new CustomerAccountLoginResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getUsername(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getTotalVisits(),
                customer.getLoyaltyPoints(),
                activePortalToken
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDashboardResponse getCustomerDashboard(String username, String email) {
        String normalizedUsername = normalizeUsername(username);
        String normalizedEmail = normalizeEmail(email);

        Customer customer = customerRepository
                .findByUsernameIgnoreCaseAndEmailIgnoreCase(normalizedUsername, normalizedEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer account not found"));

        List<VehicleSession> customerSessions = vehicleSessionRepository
                .findTop6ByCustomerIdOrderByCreatedAtDesc(customer.getId());
        List<VehicleSession> activeSessions = vehicleSessionRepository.findActiveByCustomerId(customer.getId());

        CustomerDashboardResponse.DashboardSessionCard activeSession = activeSessions.stream()
                .findFirst()
                .map(this::mapSessionCard)
                .orElse(null);

        CustomerDashboardResponse.DashboardSessionCard upcomingSession = customerSessions.stream()
                .filter(session -> session.getAppointmentAt() != null)
                .filter(session -> session.getStatus() == com.carwash.ops.domain.enums.SessionStatus.REGISTERED)
                .filter(session -> session.getAppointmentAt().isAfter(java.time.Instant.now()))
                .findFirst()
                .map(this::mapSessionCard)
                .orElse(null);

        return new CustomerDashboardResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getUsername(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getTotalVisits(),
                customer.getLoyaltyPoints(),
                resolveLoyaltyTier(customer),
                activeSession,
                upcomingSession,
                buildSavedVehicles(customerSessions),
                customerSessions.stream().limit(5).map(this::mapRecentSessionCard).toList(),
                buildNotifications(customer, activeSession, upcomingSession)
        );
    }

    @Override
    public Optional<Customer> findByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    @Transactional
    public Customer updateCustomerVisit(Long customerId, String registrationNumber) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        
        customer.setTotalVisits(customer.getTotalVisits() + 1);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + 10); // 10 points per visit
        customer.setLastVehicleRegistration(registrationNumber);
        
        return customerRepository.save(customer);
    }

    private CustomerDashboardResponse.DashboardSessionCard mapSessionCard(VehicleSession session) {
        return new CustomerDashboardResponse.DashboardSessionCard(
                session.getId(),
                session.getPortalToken(),
                session.getRegistrationNumber(),
                session.getVehicleType(),
                session.getServicePackage(),
                splitAddOns(session.getAddOnServices()),
                session.getBranch() == null ? null : session.getBranch().getName(),
                session.getStatus(),
                session.getPrice(),
                session.getPaid(),
                session.getAppointmentAt(),
                session.getRegisteredAt(),
                session.getUpdatedAt()
        );
    }

    private CustomerDashboardResponse.RecentSessionCard mapRecentSessionCard(VehicleSession session) {
        return new CustomerDashboardResponse.RecentSessionCard(
                session.getId(),
                session.getPortalToken(),
                session.getRegistrationNumber(),
                session.getVehicleType(),
                session.getServicePackage(),
                splitAddOns(session.getAddOnServices()),
                session.getBranch() == null ? null : session.getBranch().getName(),
                session.getStatus(),
                session.getPrice(),
                session.getPaid(),
                session.getAppointmentAt(),
                session.getCompletedAt(),
                session.getCreatedAt()
        );
    }

    private List<CustomerDashboardResponse.SavedVehicleCard> buildSavedVehicles(List<VehicleSession> customerSessions) {
        Map<String, VehicleSession> mostRecentByRegistration = new LinkedHashMap<>();
        Map<String, Integer> countsByRegistration = new LinkedHashMap<>();

        for (VehicleSession session : customerSessions) {
            String registration = session.getRegistrationNumber();
            if (registration == null || registration.isBlank()) {
                continue;
            }
            mostRecentByRegistration.putIfAbsent(registration, session);
            countsByRegistration.merge(registration, 1, Integer::sum);
        }

        return mostRecentByRegistration.entrySet().stream()
                .limit(4)
                .map(entry -> {
                    VehicleSession session = entry.getValue();
                    return new CustomerDashboardResponse.SavedVehicleCard(
                            entry.getKey(),
                            session.getVehicleType(),
                            session.getServicePackage(),
                            splitAddOns(session.getAddOnServices()),
                            session.getBranch() == null ? null : session.getBranch().getName(),
                            session.getCompletedAt() != null ? session.getCompletedAt() : session.getCreatedAt(),
                            countsByRegistration.getOrDefault(entry.getKey(), 1)
                    );
                })
                .toList();
    }

    private List<CustomerDashboardResponse.DashboardNotification> buildNotifications(
            Customer customer,
            CustomerDashboardResponse.DashboardSessionCard activeSession,
            CustomerDashboardResponse.DashboardSessionCard upcomingSession
    ) {
        List<CustomerDashboardResponse.DashboardNotification> notifications = new java.util.ArrayList<>();

        if (activeSession != null) {
            notifications.add(new CustomerDashboardResponse.DashboardNotification(
                    "Active wash session",
                    "You currently have a live wash session that you can open and track in real time.",
                    "info",
                    activeSession.updatedAt()
            ));
        }

        if (upcomingSession != null) {
            notifications.add(new CustomerDashboardResponse.DashboardNotification(
                    "Upcoming booking",
                    "You have a scheduled booking coming up. Arrive around the selected time for the smoothest handoff.",
                    "success",
                    upcomingSession.appointmentAt()
            ));
        }

        notifications.add(new CustomerDashboardResponse.DashboardNotification(
                "Loyalty progress",
                "You have " + (customer.getLoyaltyPoints() == null ? 0 : customer.getLoyaltyPoints()) + " loyalty points in your account.",
                "warning",
                customer.getUpdatedAt()
        ));

        return notifications;
    }

    private List<String> splitAddOns(String addOns) {
        if (addOns == null || addOns.isBlank()) {
            return List.of();
        }
        return addOns.lines()
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }

    private String resolveLoyaltyTier(Customer customer) {
        int visits = customer.getTotalVisits() == null ? 0 : customer.getTotalVisits();
        int points = customer.getLoyaltyPoints() == null ? 0 : customer.getLoyaltyPoints();

        if (visits >= 12 || points >= 120) {
            return "Platinum";
        }
        if (visits >= 6 || points >= 60) {
            return "Gold";
        }
        if (visits >= 3 || points >= 30) {
            return "Silver";
        }
        return "Starter";
    }
}
