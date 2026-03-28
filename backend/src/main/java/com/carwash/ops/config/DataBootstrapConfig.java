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
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner passwordHashBootstrap() {
        return args -> {
            System.out.println("=== PASSWORD HASH BOOTSTRAP STARTING ===");
            userRepository.findAll().forEach(user -> {
                String hash = user.getPasswordHash();
                System.out.println("User: " + user.getEmail() + " | Current hash: "
                        + hash.substring(0, Math.min(10, hash.length())));
                // Rehash if not a valid BCrypt hash (starts with $2a or $2b)
                if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
                    System.out.println("  -> Hashing plain text password");
                    user.setPasswordHash(passwordEncoder.encode(hash));
                    userRepository.save(user);
                }
                // Also handle pin_hash if present
                String pinHash = user.getPinHash();
                if (pinHash != null && !pinHash.startsWith("$2a$") && !pinHash.startsWith("$2b$")) {
                    System.out.println("  -> Hashing PIN");
                    user.setPinHash(passwordEncoder.encode(pinHash));
                    userRepository.save(user);
                }
            });
            System.out.println("=== PASSWORD HASH BOOTSTRAP COMPLETE ===");
        };
    }
}
