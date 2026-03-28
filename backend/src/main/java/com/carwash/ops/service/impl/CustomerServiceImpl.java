package com.carwash.ops.service.impl;

import com.carwash.ops.domain.entity.Customer;
import com.carwash.ops.repository.CustomerRepository;
import com.carwash.ops.service.CustomerService;
import com.carwash.ops.common.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public Customer getOrCreateCustomer(String phone, String fullName, String email) {
        String normalizedEmail = email == null || email.isBlank() ? null : email.trim().toLowerCase(Locale.ROOT);
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
}
