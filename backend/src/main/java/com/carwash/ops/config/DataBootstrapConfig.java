package com.carwash.ops.config;

import com.carwash.ops.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataBootstrapConfig {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataBootstrapConfig(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner passwordHashBootstrap() {
        return args -> userRepository.findAll().forEach(user -> {
            if (!user.getPasswordHash().startsWith("$2")) {
                user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
                userRepository.save(user);
            }
        });
    }
}
