package com.carwash.ops.service;

import com.carwash.ops.domain.entity.Customer;
import com.carwash.ops.dto.customer.CustomerAccountLoginRequest;
import com.carwash.ops.dto.customer.CustomerAccountLoginResponse;
import com.carwash.ops.dto.customer.CustomerDashboardResponse;
import com.carwash.ops.dto.customer.CustomerRegistrationRequest;
import java.util.List;
import java.util.Optional;

public interface CustomerService {
    Customer getOrCreateCustomer(String phone, String fullName, String email);
    Customer registerCustomer(CustomerRegistrationRequest request);
    CustomerAccountLoginResponse loginCustomer(CustomerAccountLoginRequest request);
    CustomerDashboardResponse getCustomerDashboard(String username, String email);
    Optional<Customer> findByPhone(String phone);
    List<Customer> getAllCustomers();
    Customer updateCustomerVisit(Long customerId, String registrationNumber);
}
