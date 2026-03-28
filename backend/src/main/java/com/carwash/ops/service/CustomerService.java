package com.carwash.ops.service;

import com.carwash.ops.domain.entity.Customer;
import java.util.List;
import java.util.Optional;

public interface CustomerService {
    Customer getOrCreateCustomer(String phone, String fullName, String email);
    Optional<Customer> findByPhone(String phone);
    List<Customer> getAllCustomers();
    Customer updateCustomerVisit(Long customerId, String registrationNumber);
}
