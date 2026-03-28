package com.carwash.ops;

// Import Spring Boot's auto-configuration capabilities
import org.springframework.boot.SpringApplication;
// This annotation combines: @Configuration, @EnableAutoConfiguration, @ComponentScan
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

/**
 * CarWashOperationsApplication - Main Entry Point
 * 
 * This is the starting point of the entire Spring Boot application.
 * When the application starts, Spring Boot's auto-configuration kicks in
 * and sets up everything needed for the web application.
 * 
 * KEY CONCEPTS:
 * - @SpringBootApplication is a convenience annotation that combines three
 * annotations:
 * 1. @Configuration - Marks this class as a source of bean definitions
 * 2. @EnableAutoConfiguration - Tells Spring Boot to auto-configure the
 * application
 * 3. @ComponentScan - Tells Spring to find components, configurations, and
 * services
 * 
 * EXAM TIP: Spring Boot eliminates the need for separate XML configuration
 * files.
 * Everything is configured through Java annotations and properties files.
 */
@SpringBootApplication // Marks this as a Spring Boot application entry point
@EnableJpaRepositories(basePackages = "com.carwash.ops.repository")
@EntityScan(basePackages = "com.carwash.ops.domain.entity")
public class CarWashOperationsApplication {

    /**
     * main() - Application Bootstrap Method
     * 
     * This is the standard Java main method that serves as the entry point.
     * SpringApplication.run() does the heavy lifting:
     * 1. Creates an ApplicationContext (the Spring container)
     * 2. Scans for @Component, @Service, @Repository, @Controller beans
     * 3. Configures embedded servlet container (Tomcat by default)
     * 4. Starts the embedded server on default port 8080
     * 
     * @param args Command line arguments passed to the application
     */
    public static void main(String[] args) {
        // SpringApplication.run() starts the entire application
        // It handles all the setup so we don't have to write complex boilerplate code
        SpringApplication.run(CarWashOperationsApplication.class, args);
    }
}
