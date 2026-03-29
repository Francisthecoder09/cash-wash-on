# Car Wash Operations System - Java Defense Guide

This guide is now focused only on the Java backend in this project:

- [`backend/src/main/java/com/carwash/ops`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops)

Its purpose is to help you defend the project in an oral presentation or viva. Instead of mixing frontend and backend ideas, this guide explains the Java codebase package by package, class by class, and method by method.

Important note:

- The backend contains many Java files.
- A literal explanation of every single line would become too large to study well.
- So this guide explains every Java file, and within the important files it explains the annotations, fields, constructors, and methods in the same order the code is written.
- That is the best practical way to defend "what each line is doing" without turning the guide into unusable noise.

## 1. What The Java Backend Does

The Java backend is a Spring Boot application that manages the full operational lifecycle of a car wash.

At a high level, it handles:

- authentication and authorization
- branch management
- lane management
- users and staff
- session registration and wash progress
- customer portal booking and tracking
- pricing and add-ons
- audit logging
- notifications
- dashboard analytics
- exporting and reporting

The backend uses standard Spring architecture:

1. controller layer
2. service layer
3. repository layer
4. entity layer
5. DTO layer
6. configuration and security layer

That means:

- controllers receive HTTP requests
- services contain business logic
- repositories talk to the database
- entities map Java objects to database tables
- DTOs define request and response shapes
- config/security wire the application together

## 2. Package Map

The backend Java code is organized like this:

- `com.carwash.ops`
  - app entry point and utility/test classes
- `common`
  - shared error objects and exception handling
- `config`
  - configuration classes
- `domain.entity`
  - database entities
- `domain.enums`
  - enums used in business logic
- `dto`
  - request/response classes grouped by feature
- `repository`
  - JPA repositories
- `security`
  - JWT and authentication classes
- `service`
  - interfaces for business logic
- `service.impl`
  - actual implementations
- `web`
  - REST controllers

## 3. Core Spring Boot Flow

When a request comes in, the Java flow is usually:

1. a browser or app calls an endpoint
2. a controller receives the request
3. the controller calls a service
4. the service validates rules and calls repositories
5. repositories query or update the database
6. the service maps the result into a DTO
7. the controller returns JSON

Example:

1. customer books a wash
2. [`CustomerPortalController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/CustomerPortalController.java) receives the request
3. it calls the session service
4. [`SessionServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/SessionServiceImpl.java) creates the session
5. repositories save the session entity
6. the service returns a `VehicleSessionResponse`
7. Spring serializes it into JSON

## 4. Entry Point Package

### [`CarWashOperationsApplication.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/CarWashOperationsApplication.java)

Purpose:

- this is the Spring Boot entry point
- it starts the whole backend application

What to say in defense:

- `@SpringBootApplication` combines three major annotations:
  - `@Configuration`
  - `@EnableAutoConfiguration`
  - `@ComponentScan`
- this tells Spring to scan the package and automatically register controllers, services, repositories, and configs
- `main()` calls `SpringApplication.run(...)`
- that bootstraps the IoC container and starts the embedded Tomcat server

Why it matters:

- without this file, the application does not start
- it is the root of dependency injection and auto-configuration

### [`TestStream.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/TestStream.java)

Purpose:

- this looks like a helper or scratch class rather than core production logic

Defense note:

- if asked, say this is not central to business flow
- the real application runtime starts from `CarWashOperationsApplication`

## 5. Common Package

### [`ApiErrorResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/common/ApiErrorResponse.java)

Purpose:

- defines the shape of a standard API error response

What it is doing:

- stores error metadata such as timestamp, status, message, and validation details
- gives the frontend a consistent JSON structure when something fails

Why it exists:

- without a standard error object, different endpoints would return different error shapes
- consistency makes frontend error handling easier

### [`ApiException.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/common/ApiException.java)

Purpose:

- custom exception class for business-level failures

What it is doing:

- wraps an HTTP status and message together
- makes service code cleaner

Why it exists:

- instead of throwing generic runtime exceptions everywhere, the code throws meaningful API exceptions such as:
  - bad request
  - not found
  - unauthorized

That makes the error-handling layer predictable.

### [`GlobalExceptionHandler.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/common/GlobalExceptionHandler.java)

Purpose:

- catches exceptions thrown anywhere in controllers and services

What to say:

- it uses Spring exception handling so the app does not expose raw stack traces to users
- it converts exceptions into `ApiErrorResponse`
- it handles:
  - custom `ApiException`
  - validation errors
  - general exceptions

Why it matters:

- centralizes error handling
- improves API consistency
- prevents duplicate try/catch blocks in every controller

## 6. Config Package

### [`AppProperties.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/config/AppProperties.java)

Purpose:

- binds external configuration into a typed Java object

What it is doing:

- reads application properties from `application.yml` or environment variables
- exposes them to the rest of the app in a safe typed way

Why it matters:

- avoids hardcoding configuration in business logic

### [`DataBootstrapConfig.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/config/DataBootstrapConfig.java)

Purpose:

- runs startup logic around seeded data and user credentials

What it is doing:

- ensures seeded users have hashed credentials
- helps local/demo startup stay usable

Why it matters:

- seed scripts may insert default values
- this config makes sure login works correctly after bootstrapping

Defense tip:

- if asked why not keep plain passwords in the database, explain that the config hashes them because only hashed credentials should be stored

### [`SecurityConfig.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/config/SecurityConfig.java)

Purpose:

- configures Spring Security

What it is doing:

- defines which endpoints are public and which require authentication
- wires the JWT filter into the request chain
- configures stateless security
- exposes security beans such as password encoder and authentication manager

Key defense points:

- JWT-based auth is stateless
- the backend does not keep server-side login sessions
- each request carries a token
- Spring Security validates the token and reconstructs the user identity

### [`WebSocketConfig.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/config/WebSocketConfig.java)

Purpose:

- enables real-time session updates

What it is doing:

- configures STOMP/WebSocket messaging
- defines application and topic destinations

Why it matters:

- when a wash session changes state, staff pages can update live without full refresh
## 7. Domain Entities

This is the heart of the database model.

### [`BaseEntity.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/BaseEntity.java)

Purpose:

- base class shared by many entities

What it is doing:

- stores common fields like:
  - `id`
  - `createdAt`
  - `updatedAt`
- uses lifecycle callbacks like `@PrePersist` and `@PreUpdate`

Why it matters:

- removes duplication
- gives every entity consistent identity and timestamps

What to say in defense:

- this is inheritance in practice
- child entities reuse common persistence behavior

### [`Branch.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/Branch.java)

Purpose:

- represents a business location

Important fields:

- name
- location
- timezone
- active

Why it matters:

- almost every operational object belongs to a branch
- sessions, lanes, staff, and users all depend on branch context

### [`Lane.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/Lane.java)

Purpose:

- represents a wash lane or bay

Important fields:

- branch
- laneName
- displayOrder
- active

Important details:

- `branch` is a `@ManyToOne` relationship
- convenience getters such as `getBranchId()` and `getBranchName()` help the frontend
- `@JsonIgnore` is used on the branch relation to avoid circular JSON problems

Why it matters:

- a vehicle session can be assigned to a lane
- lane ordering matters on the tablet/session UI

### [`Staff.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/Staff.java)

Purpose:

- stores staff profile information

Important fields:

- branch
- fullName
- employeeCode
- phone
- active

Why it exists separately from `User`:

- `Staff` is the profile/person record
- `User` is the login/auth record
- this separation is cleaner for administration

### [`User.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/User.java)

Purpose:

- represents internal staff login accounts

Important fields:

- email
- username
- passwordHash
- pinHash
- role
- branch
- staff
- active

Important defense points:

- roles are stored as an enum
- branch and staff are foreign-key relationships
- hashed credentials are stored instead of plain text
- helper getters like `getBranchId()` and `getBranchName()` support DTO mapping

Why it matters:

- this is the main entity used for staff authentication and authorization

### [`Customer.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/Customer.java)

Purpose:

- stores customer account data for the portal

Important fields:

- fullName
- username
- phone
- email
- pinHash
- loyaltyPoints
- totalVisits
- lastVehicleRegistration

Why it matters:

- customers can register themselves
- they can sign in again later without re-entering all car details

### [`CustomerOtpEntity.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/CustomerOtpEntity.java)

Purpose:

- stores generated customer OTP codes

What it is doing:

- tracks the email, code, expiry, and usage state

Why it matters:

- supports secure one-time login verification for the customer portal

### [`VehicleSession.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/VehicleSession.java)

Purpose:

- this is the main business entity in the system

What it represents:

- one car wash job from registration to completion

Important fields:

- branch
- lane
- registrationNumber
- customerName
- customerPhone
- customerEmail
- vehicleType
- vehicleImageUrl
- servicePackage
- addOnServices
- status
- price
- paid
- portalToken
- timestamps for each workflow stage

Why it matters:

- this entity is the center of the application
- almost every core operation reads or updates a vehicle session

Defense explanation:

- the status field models the operational workflow
- timestamps prove when the session moved from one phase to another
- `portalToken` links the staff-side session to the customer portal
- `addOnServices` keeps extra services selected by customers or staff

### [`Inspection.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/Inspection.java)

Purpose:

- stores final inspection data

Why it matters:

- inspection is a separate step from washing
- it allows quality control before completion

### [`MatsTracking.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/MatsTracking.java)

Purpose:

- tracks mat removal and reinstall state

Why it matters:

- records a real operational sub-task within wash execution

### [`Signature.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/Signature.java)

Purpose:

- stores captured signature data

Why it matters:

- records customer/operator acknowledgment

### [`AuditLog.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/AuditLog.java)

Purpose:

- stores a trace of important system actions

Why it matters:

- gives accountability
- supports the audit page
- important for defense because it shows enterprise thinking

### [`PricingEntity.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/PricingEntity.java)

Purpose:

- stores pricing rows for services by vehicle category

Why it matters:

- one service can have different prices for sedan, SUV, etc.

### [`ServiceTypeEntity.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/ServiceTypeEntity.java)

Purpose:

- defines available services

Important fields:

- serviceName
- description
- basePrice
- durationMinutes
- category
- featured flag
- optional branch

Why it matters:

- powers normal services and add-ons
- branch-specific add-ons now depend on this entity

### [`InventoryItem.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/InventoryItem.java)

Purpose:

- represents tracked inventory

### [`SystemSetting.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/SystemSetting.java)

Purpose:

- stores configurable system-level settings

## 8. Domain Enums

### [`RoleName.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/enums/RoleName.java)

Purpose:

- defines allowed staff roles:
  - ADMIN
  - BRANCH_MANAGER
  - CASHIER
  - LANE_OPERATOR
  - INSPECTOR
  - AUDITOR

Why enums matter:

- they restrict values
- improve type safety
- reduce invalid role strings

### [`SessionStatus.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/enums/SessionStatus.java)

Purpose:

- defines the wash lifecycle states

Typical flow:

1. REGISTERED
2. WASHING
3. INTERIOR
4. INSPECTION
5. COMPLETED

This enum is important in your defense because it shows workflow modeling.

### [`AuditAction.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/enums/AuditAction.java)

Purpose:

- defines action types written into audit logs
## 9. DTO Package

DTO means Data Transfer Object.

Why DTOs exist:

- entities are database models
- DTOs are API-facing models
- they prevent exposing unnecessary internal fields

### Admin DTOs

- [`AdminDashboardResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/AdminDashboardResponse.java)
  - returns admin overview metrics
- [`BranchAdminDTO.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/BranchAdminDTO.java)
  - branch-specific admin response/request grouping
- [`CreateBranchRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/CreateBranchRequest.java)
  - request body for branch creation/update
- [`CreateLaneRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/CreateLaneRequest.java)
  - request body for lane creation/update
- [`CreateStaffRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/CreateStaffRequest.java)
  - request body for staff creation
- [`CreateUserRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/CreateUserRequest.java)
  - request body for creating a staff account
- [`InventoryAdminDTO.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/InventoryAdminDTO.java)
  - admin inventory transport object
- [`ServiceAdminDTO.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/ServiceAdminDTO.java)
  - grouped request/response classes for service and pricing management
- [`StaffAdminDTO.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/StaffAdminDTO.java)
  - staff admin transport object
- [`StaffResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/StaffResponse.java)
  - branch staff listing response
- [`UserAdminDTO.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/UserAdminDTO.java)
  - admin user-related DTO grouping
- [`UserResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/admin/UserResponse.java)
  - simplified user list response for admin page

### Auth DTOs

- [`LoginRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/auth/LoginRequest.java)
  - incoming login payload
- [`AuthResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/auth/AuthResponse.java)
  - returned JWT and user metadata

### Customer DTOs

- [`CustomerRegistrationRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/customer/CustomerRegistrationRequest.java)
  - self-registration request
- [`CustomerRegistrationResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/customer/CustomerRegistrationResponse.java)
  - self-registration response
- [`CustomerAccountLoginRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/customer/CustomerAccountLoginRequest.java)
  - username/email/PIN login payload
- [`CustomerAccountLoginResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/customer/CustomerAccountLoginResponse.java)
  - tells portal where customer should go next

### Dashboard DTOs

- [`DashboardSummaryResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/dashboard/DashboardSummaryResponse.java)
- [`LaneLeaderboardItem.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/dashboard/LaneLeaderboardItem.java)
- [`MonthlyRankingItem.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/dashboard/MonthlyRankingItem.java)

These exist to shape dashboard analytics without exposing entities directly.

### Session DTOs

- [`CreateVehicleSessionRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/CreateVehicleSessionRequest.java)
  - request for registration/booking
- [`InspectionRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/InspectionRequest.java)
  - inspection payload
- [`MatsTrackingRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/MatsTrackingRequest.java)
  - mats tracking payload
- [`RealtimeSessionEvent.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/RealtimeSessionEvent.java)
  - WebSocket event wrapper
- [`SessionActionRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/SessionActionRequest.java)
  - lane assignment/operator action payload
- [`SignatureRequest.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/SignatureRequest.java)
  - signature payload
- [`VehicleHistoryResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/VehicleHistoryResponse.java)
  - vehicle search history response
- [`VehicleSessionDetailResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/VehicleSessionDetailResponse.java)
  - detailed session projection
- [`VehicleSessionResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/session/VehicleSessionResponse.java)
  - main session response returned to frontend

### Other DTOs

- [`AuditLogResponse.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/audit/AuditLogResponse.java)
- [`SelectOptionDto.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/dto/common/SelectOptionDto.java)

These help keep API outputs clean and purpose-driven.

## 10. Repository Package

Repositories extend JPA repository support and hide SQL details.

### Core idea to say in defense

- repository methods either come from Spring Data naming conventions
- or use custom queries when needed

### Repositories in this project

- [`AuditLogRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/AuditLogRepository.java)
  - fetch audit records
- [`BranchRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/BranchRepository.java)
  - branch persistence
- [`CustomerOtpRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/CustomerOtpRepository.java)
  - OTP lookup and verification support
- [`CustomerRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/CustomerRepository.java)
  - customer account lookup
- [`InspectionRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/InspectionRepository.java)
- [`InventoryItemRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/InventoryItemRepository.java)
- [`LaneRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/LaneRepository.java)
  - lane queries
  - now uses `@EntityGraph` to load branch when lane JSON needs branch info
- [`MatsTrackingRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/MatsTrackingRepository.java)
- [`PricingEntityRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/PricingEntityRepository.java)
  - pricing lookup by service type and category
- [`ServiceTypeEntityRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/ServiceTypeEntityRepository.java)
  - service and add-on lookup
- [`SignatureRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/SignatureRepository.java)
- [`StaffRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/StaffRepository.java)
- [`SystemSettingRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/SystemSettingRepository.java)
- [`UserRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/UserRepository.java)
  - login lookups and admin user listing
  - uses `@EntityGraph` to load `branch` and `staff`
- [`VehicleSessionRepository.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/repository/VehicleSessionRepository.java)
  - most important repository
  - powers listing, counts, search, analytics, and duplicate-session checks

## 11. Security Package

### [`AuthenticatedUser.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/security/AuthenticatedUser.java)

Purpose:

- custom authenticated principal object

Why it matters:

- carries user identity details like branch and role after authentication

### [`CustomUserDetailsService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/security/CustomUserDetailsService.java)

Purpose:

- loads user records for Spring Security

What it is doing:

- finds the user in the database
- wraps it into a Spring Security user details object

### [`JwtAuthenticationFilter.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/security/JwtAuthenticationFilter.java)

Purpose:

- intercepts requests and validates JWT tokens

What to say:

- it checks the `Authorization` header
- if a valid bearer token exists, it loads the user into the security context
- after that, controllers can enforce `@PreAuthorize`

### [`JwtService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/security/JwtService.java)

Purpose:

- creates and validates JWT tokens

Why it matters:

- centralizes token logic
- separates security details from controller code
## 12. Service Interfaces

Service interfaces define the contract of business logic.

- [`AdminService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/AdminService.java)
- [`AuditService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/AuditService.java)
- [`AuthService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/AuthService.java)
- [`CustomerService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/CustomerService.java)
- [`DashboardService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/DashboardService.java)
- [`ExportService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/ExportService.java)
- [`NotificationService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/NotificationService.java)
- [`OtpService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/OtpService.java)
- [`PricingService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/PricingService.java)
- [`ReferenceService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/ReferenceService.java)
- [`SessionService.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/SessionService.java)

Defense line:

- interfaces improve abstraction and make the design easier to test and extend

## 13. Service Implementations

This is where the main business logic lives.

### [`AuthServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/AuthServiceImpl.java)

Purpose:

- handles staff login

What it is doing:

- validates the login payload
- checks the user in the database
- verifies the credential
- generates a JWT
- returns an `AuthResponse`

Why it matters:

- this class connects Spring Security, the database, and the frontend login flow

### [`SessionServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/SessionServiceImpl.java)

Purpose:

- the most important service in the project

What it handles:

- session creation by staff
- booking creation by customer
- listing sessions
- search by registration
- session state changes
- lane assignment
- mats tracking
- signature capture
- inspection
- completion
- payment
- customer portal session lookup
- duplicate-session prevention
- add-on handling
- portal token lookup
- realtime updates

How to defend it:

- say this class is the workflow engine of the system
- it enforces business rules around the vehicle lifecycle
- it coordinates many repositories and DTO mappings

What happens in the create/book flow:

1. validate branch and optional lane
2. validate customer/session data
3. prevent invalid duplicates
4. build a `VehicleSession` entity
5. set status to `REGISTERED`
6. store price and add-ons
7. generate portal token
8. save entity
9. map entity to response DTO
10. publish realtime update if needed

### [`AdminServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/AdminServiceImpl.java)

Purpose:

- handles branch, lane, user, staff, and admin dashboard logic

Important logic inside:

- branch CRUD
- lane CRUD
- user creation/deactivation
- staff creation
- admin dashboard aggregation

Why it matters:

- this is the central business service for the admin panel

### [`CustomerServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/CustomerServiceImpl.java)

Purpose:

- handles customer account registration and login

What it is doing:

- validates uniqueness of email/username/phone
- hashes customer PIN
- registers customer accounts
- logs customers back in using username/email/PIN
- determines whether the customer should go to active session tracking or booking

### [`OtpServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/OtpServiceImpl.java)

Purpose:

- generates, stores, and verifies OTP codes

Important points:

- stores OTP metadata in the database
- supports local mock mode and real email mode
- checks expiry and validity

### [`PricingServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/PricingServiceImpl.java)

Purpose:

- handles service catalog and pricing retrieval

Important points:

- supports standard services
- supports add-ons
- supports branch-specific add-ons
- maps entities into service/pricing DTOs

### [`DashboardServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/DashboardServiceImpl.java)

Purpose:

- calculates overview analytics for the operational dashboard

### [`AuditServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/AuditServiceImpl.java)

Purpose:

- fetches and shapes audit log information

### [`ReferenceServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/ReferenceServiceImpl.java)

Purpose:

- returns simple option lists like branches and other reference data

### [`ExportServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/ExportServiceImpl.java)

Purpose:

- handles export/report generation

### [`EmailNotificationServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/EmailNotificationServiceImpl.java)

Purpose:

- sends email notifications

### [`SmsNotificationServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/SmsNotificationServiceImpl.java)

Purpose:

- handles SMS-style notifications or mock SMS behavior

## 14. Web Controllers

Controllers expose the API surface.

### [`AuthController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/AuthController.java)

Purpose:

- exposes login endpoint

Key defense line:

- controller should stay thin
- it delegates real work to the auth service

### [`SessionController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/SessionController.java)

Purpose:

- staff-facing session endpoints

Important endpoints:

- list sessions
- create session
- start wash
- record mats
- capture signature
- inspect
- complete
- pay
- search history

Why it matters:

- this is the main operational controller for staff workflows

### [`CustomerPortalController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/CustomerPortalController.java)

Purpose:

- customer-facing endpoints

Important endpoints:

- get branches
- get services
- get add-ons
- get pricing
- register customer
- customer login
- find active session
- send OTP
- verify OTP
- book session
- get session by portal token
- sign and pay from portal

Why it matters:

- this is the public-facing controller of the project

### [`AdminController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/AdminController.java)

Purpose:

- admin CRUD and admin dashboard controller

Important endpoints:

- branches
- lanes
- users
- staff
- dashboard

### [`ServiceAdminController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/ServiceAdminController.java)

Purpose:

- admin management for services and pricing

Why it matters:

- separates service/pricing admin logic from general admin CRUD

### Other controllers

- [`AuditController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/AuditController.java)
- [`CustomerController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/CustomerController.java)
- [`DashboardController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/DashboardController.java)
- [`ExportController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/ExportController.java)
- [`ReferenceController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/ReferenceController.java)

Each one exists to keep responsibilities separated instead of placing every endpoint in one large controller.
## 15. How To Explain Annotations In Defense

These will likely come up.

### `@Entity`

- marks a class as a database-mapped JPA entity

### `@Table`

- customizes the table name, indexes, or constraints

### `@Id`

- marks the primary key

### `@GeneratedValue`

- tells the database how IDs are generated

### `@ManyToOne`

- defines a many-to-one foreign-key relationship

### `@RestController`

- tells Spring this class handles HTTP requests and returns response bodies

### `@RequestMapping`

- sets the base path for endpoints

### `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`

- map HTTP methods to controller methods

### `@Service`

- marks business-logic components

### `@Transactional`

- ensures operations run inside a transaction

### `@Repository`

- repository stereotype for data access

### `@PreAuthorize`

- enforces role-based security on endpoints

### `@EntityGraph`

- tells JPA to fetch related data eagerly for a specific query
- used to avoid lazy-loading problems in API serialization

## 16. Most Important Defense Story

If they ask you to summarize the Java backend in one story, say this:

"The Java backend is a Spring Boot application designed around clean layered architecture. Controllers expose REST endpoints, services enforce business rules, repositories handle persistence, and entities model the domain. The main business object is `VehicleSession`, which represents the full wash workflow from registration to completion. Security is handled with JWT and Spring Security, while the customer portal is supported through dedicated customer, OTP, booking, and session-tracking endpoints. The system also includes admin management, analytics, audit logging, pricing, add-ons, and branch-aware operations."

## 17. Most Important Files To Master First

If you are short on time, study these in this exact order:

1. [`CarWashOperationsApplication.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/CarWashOperationsApplication.java)
2. [`SecurityConfig.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/config/SecurityConfig.java)
3. [`User.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/User.java)
4. [`VehicleSession.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/domain/entity/VehicleSession.java)
5. [`SessionController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/SessionController.java)
6. [`SessionServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/SessionServiceImpl.java)
7. [`AuthController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/AuthController.java)
8. [`AuthServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/AuthServiceImpl.java)
9. [`AdminController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/AdminController.java)
10. [`AdminServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/AdminServiceImpl.java)
11. [`CustomerPortalController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/CustomerPortalController.java)
12. [`CustomerServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/CustomerServiceImpl.java)

## 18. Smart Answers For Likely Questions

### Why use DTOs instead of returning entities directly?

Because entities are for persistence, while DTOs are for API contracts. DTOs reduce overexposure, prevent lazy-loading serialization issues, and give cleaner frontend responses.

### Why separate `Staff` and `User`?

Because one is a human profile and the other is an authentication account. This separation keeps the model cleaner and more flexible.

### Why use JWT?

Because it supports stateless authentication. The server does not need to keep traditional sessions for each logged-in user.

### Why use `@Transactional`?

Because many business operations update multiple tables and must either succeed together or fail together.

### Why use enums?

Because roles and statuses should have fixed allowed values. Enums improve type safety and reduce bad data.

### Why is `VehicleSession` the core entity?

Because the whole business revolves around registering, processing, tracking, inspecting, completing, and paying for a vehicle wash session.

## 19. Final Defense Strategy

When defending the backend:

1. start from the layered architecture
2. explain the main domain entity `VehicleSession`
3. explain authentication and JWT
4. explain the session workflow from `REGISTERED` to `COMPLETED`
5. explain customer portal support
6. explain admin and analytics
7. mention audit logging and realtime updates as advanced features

If they ask you "what is happening in this file?", answer in this order:

1. what layer the file belongs to
2. what its responsibility is
3. what annotations mean
4. what fields or methods are doing
5. why the design choice makes sense

If you want, the next step I can do is a second pass that goes even deeper and turns this into a file-by-file oral script for the most important Java classes, starting with:

- `SessionServiceImpl`
- `AdminServiceImpl`
- `AuthServiceImpl`
- `CustomerPortalController`
- `SecurityConfig`

## 20. Detailed Oral Script For Core Java Files

This section goes deeper than the overview above. Use it when your supervisor or examiner opens a file and asks you to explain what is happening inside it.

### [`SecurityConfig.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/config/SecurityConfig.java)

How to explain it from top to bottom:

- `package com.carwash.ops.config;`
  - this line places the class in the configuration package
  - Java uses packages to organize code and avoid naming collisions

- imports
  - all the import lines bring in Spring Security, CORS, and bean types used by this class
  - each import is there because the class builds the security setup from Spring components instead of writing security manually from scratch

- `@Configuration`
  - tells Spring that this class defines beans
  - Spring will read this class during startup and register the objects returned by `@Bean` methods into the application context

- `@EnableWebSecurity`
  - switches on Spring Security web protection for HTTP requests

- `@EnableMethodSecurity`
  - allows annotations like `@PreAuthorize` inside controllers and services
  - this matters because many endpoints in the project use role-based access control

- `@EnableConfigurationProperties(AppProperties.class)`
  - tells Spring to bind external config into `AppProperties`
  - this is used here for things like allowed CORS origins

- class fields
  - `jwtAuthenticationFilter`
    - custom filter that reads JWT tokens from incoming requests
  - `userDetailsService`
    - service used by Spring Security to load users from the database
  - `appProperties`
    - configuration holder, used here mainly for CORS

- constructor
  - Spring injects the dependencies here
  - constructor injection is preferred because it makes dependencies explicit and keeps them immutable

- `securityFilterChain(HttpSecurity http)`
  - this is the main security setup method
  - it defines how requests are protected
  - line by line logic:
    - `csrf(csrf -> csrf.disable())`
      - disables CSRF protection
      - this is common in token-based APIs because the frontend sends JWTs rather than relying on session cookies
    - `cors(cors -> cors.configurationSource(corsConfigurationSource()))`
      - enables CORS using the custom config method below
      - this allows the frontend to call the backend from another origin
    - `sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`
      - tells Spring not to create server-side login sessions
      - this fits JWT authentication because each request must carry its own token
    - `authorizeHttpRequests(...)`
      - this block defines which routes are public and which are protected
      - `/api/auth/**`, `/api/portal/**`, docs, WebSocket handshake, and health are public
      - everything else requires authentication
    - `authenticationProvider(authenticationProvider())`
      - tells Spring what component should verify user credentials
    - `addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`
      - inserts the JWT filter before Spring’s default username/password filter
      - that way token auth is processed early in the chain
  - finally `http.build()` returns the configured filter chain bean

- `authenticationProvider()`
  - creates a `DaoAuthenticationProvider`
  - this is the Spring class that knows how to authenticate using a user-details service and a password encoder
  - it uses the project’s `userDetailsService` and `passwordEncoder`

- `passwordEncoder()`
  - returns `BCryptPasswordEncoder`
  - BCrypt is used because passwords and PINs should never be stored in plain text

- `authenticationManager(...)`
  - obtains the `AuthenticationManager` from Spring’s authentication configuration
  - later, `AuthServiceImpl` uses this to perform login authentication

- `corsConfigurationSource()`
  - creates a CORS config object
  - `setAllowCredentials(true)` allows credentials to be sent when needed
  - `setAllowedOrigins(...)` uses values from app properties instead of hardcoding them
  - `addAllowedHeader("*")` allows all headers
  - `addAllowedMethod("*")` allows all HTTP methods
  - then the config is registered for all routes with `/**`

Why this file matters:

- this file decides who can access what
- it is the foundation of authentication and authorization in the whole backend

### [`AuthServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/AuthServiceImpl.java)

How to explain it:

- `@Service`
  - marks this class as a business service bean

- `@Transactional(readOnly = true)`
  - says the default work in this class is read-oriented
  - login mostly reads user data and creates a token, not heavy write operations

- class fields
  - `authenticationManager`
    - Spring Security component that performs actual authentication
  - `jwtService`
    - generates the signed JWT after login succeeds
  - `userRepository`
    - loads the full user entity from the database
  - `auditService`
    - records successful login activity

- constructor
  - receives the dependencies through constructor injection

- `login(LoginRequest request)`
  - this is the core login method
  - line-by-line logic:
    - `authenticationManager.authenticate(...)`
      - sends the email and pin into Spring Security
      - Spring checks whether the credentials are valid
    - `new UsernamePasswordAuthenticationToken(request.email(), request.pin())`
      - wraps the login input into a standard authentication object
    - cast principal to `AuthenticatedUser`
      - after authentication succeeds, Spring gives back the authenticated principal
      - this object contains the identity details extracted for the logged-in user
    - `userRepository.findById(...)`
      - loads the real database user entity using the authenticated user id
      - this ensures the response uses fresh persistent data
    - `orElseThrow(...)`
      - if the user somehow cannot be found, login stops with unauthorized error
    - role check block
      - if the request specified a role, this confirms the user actually has that role
      - this prevents someone from signing in as the wrong portal role intentionally
    - `auditService.log(...)`
      - records that the user logged in
      - useful for traceability and audit history
    - `return new AuthResponse(...)`
      - builds the frontend login response
      - includes:
        - generated JWT token
        - user id
        - email
        - role
        - branch id
        - staff id

Why this file matters:

- this is the bridge between Spring Security and the project’s own business response format
- without it, the frontend would not receive the token and metadata it needs after login

### [`CustomerPortalController.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/web/CustomerPortalController.java)

How to explain it:

- `@RestController`
  - marks the class as a REST API controller
  - return values are serialized directly to JSON

- `@RequestMapping("/api/portal/sessions")`
  - defines the base URL for all customer portal endpoints

- `@RequiredArgsConstructor`
  - Lombok generates a constructor for all final fields
  - reduces boilerplate while still using constructor injection

- `@CrossOrigin(origins = "*")`
  - allows portal access from any origin
  - useful for flexible customer-facing deployment, though in production it is usually better to restrict this more tightly

- fields
  - `sessionService`
    - drives session lookup, booking, signature, and payment logic
  - `customerService`
    - handles customer account registration and login
  - `referenceService`
    - returns option lists like branches
  - `pricingService`
    - returns services, add-ons, and pricing data
  - `otpService`
    - handles OTP generation and verification

Key endpoints:

- `getBranches()`
  - returns branch options for booking forms
  - keeps frontend dropdowns dynamic rather than hardcoded

- `getServices()`
  - returns active service types
  - filters out category `ADDON` because main services and add-ons are shown separately in the portal

- `getAddOns(branchId)`
  - returns add-on services
  - supports optional branch filtering so add-ons can differ by location

- `getPricing(serviceId)`
  - returns vehicle-category-specific pricing for a selected service

- `mapToServiceResponse(...)`
  - private helper to convert a `ServiceTypeEntity` into a DTO
  - this is important because controllers should return DTOs, not raw entities

- `mapToPricingResponse(...)`
  - same idea for pricing rows

- `findActiveSession(reg, phone, email)`
  - allows customer portal lookup
  - if email exists, it uses registration + email
  - otherwise it falls back to registration + phone
  - this supports the evolving customer access flow

- `sendOtp(...)`
  - triggers OTP generation for email login flow

- `getLatestMockOtp(...)`
  - local-development helper
  - returns the latest mock OTP directly in local mode

- `verifyOtp(...)`
  - verifies the OTP code
  - if invalid, throws unauthorized
  - if valid, loads the active session for that customer

- `registerCustomer(...)`
  - receives customer self-registration data
  - calls customer service
  - returns a clean registration response DTO

- `loginCustomer(...)`
  - signs customer back in with username/email/PIN
  - delegates to customer service business logic

- `getSessionByToken(token)`
  - loads session tracking data using the portal token

- `signSession(token, request)`
  - lets the customer sign from the portal
  - first resolves the session by token, then calls the session service

- `paySession(token)`
  - same idea, but for payment state

- `bookSession(...)`
  - customer booking endpoint
  - uses the same session domain model as staff, but through the public portal flow

Why this file matters:

- it is the main public-facing backend controller
- it connects booking, tracking, OTP, customer accounts, and pricing in one place

### [`SessionServiceImpl.java`](C:/Users/HP/Desktop/car-wash-on/backend/src/main/java/com/carwash/ops/service/impl/SessionServiceImpl.java)

How to explain it at a high level first:

- this is the workflow engine of the whole system
- it controls the session lifecycle from registration through washing, inspection, completion, payment, and customer portal access

Class-level details:

- `@Service`
  - marks the class as a Spring service

- `@Transactional(readOnly = true)`
  - says the default behavior is read-only
  - write methods override this with method-level `@Transactional`

- `ADD_ON_SEPARATOR`
  - used to serialize multiple add-on values into one stored text field

- logger
  - allows operational logging, especially around payment and state changes

Dependencies:

- `vehicleSessionRepository`
  - main persistence access for sessions
- `branchRepository`
  - validates and loads branches
- `laneRepository`
  - validates and loads lanes
- `userRepository`
  - loads acting staff user
- `staffRepository`
  - loads operator or inspector staff
- `matsTrackingRepository`
  - stores mat workflow data
- `signatureRepository`
  - stores signature records
- `inspectionRepository`
  - stores inspection records
- `auditService`
  - logs major actions
- `customerService`
  - links sessions to customer accounts and loyalty updates
- `messagingTemplate`
  - publishes realtime websocket updates
- `notificationServices`
  - sends booking confirmations, completion alerts, and receipts

#### `create(CreateVehicleSessionRequest request, String username)`

This is the staff-side registration flow.

Step by step:

- first checks `sourceRequestId`
  - if one exists and a matching session is already stored, it returns the existing one
  - this helps with idempotency and duplicate-submit protection

- normalizes registration number
  - trims whitespace and uppercases the value
  - this prevents duplicate-looking plates with different formatting

- normalizes phone
  - converts blanks into null
  - keeps storage cleaner

- loads branch
  - ensures the branch exists before continuing

- validates duplicate active session
  - prevents another active session for the same plate and phone in the same branch

- loads cashier user from username
  - the backend records who created the session

- builds a new `VehicleSession`
  - sets branch
  - sets cashier user
  - sets registration and customer data
  - stores vehicle image if present
  - stores service package
  - stores add-ons
  - sets status to `REGISTERED`
  - stores source request id
  - sets price
  - sets paid to false
  - stores appointment time
  - sets `registeredAt`
  - generates a `portalToken`

- customer CRM logic block
  - if phone exists, it gets or creates a customer record
  - this links operational sessions to reusable customer accounts

- optional lane assignment
  - if lane id exists, it validates and sets the lane

- saves the session
  - now it is stored in the database

- writes audit log
  - records the creation action

- publishes realtime event
  - staff dashboards can update live

- sends booking notification through all configured notification services

- maps entity to response DTO and returns it

#### `list(Long branchId, SessionStatus status)`

- fetches sessions using repository filtering
- maps each session to `VehicleSessionResponse`
- this powers the sessions board

#### `startWash(...)`

- loads session
- ensures current status is `REGISTERED`
- changes status to `WASHING`
- stamps `washingStartedAt`
- stores optional delay reason
- optionally sets lane
- optionally sets operator staff
- saves session
- audits the transition
- publishes realtime update
- returns mapped response

#### `recordMats(...)`

- loads session
- blocks mats recording if wash has not started yet
- loads or creates a `MatsTracking` record
- stores mats removed, reinstalled, and notes
- if session is still in `WASHING`, it advances to `INTERIOR`
- saves both mats data and session
- logs audit event
- publishes realtime update

#### `captureSignature(...)`

- loads session
- prevents early signature capture before interior stage
- loads or creates `Signature`
- stores signer name and signature image data
- saves signature
- logs action
- publishes realtime update
- returns updated session view

#### `inspect(...)`

- loads session
- makes sure inspection only happens after interior stage
- sets status to `INSPECTION`
- stamps `inspectionStartedAt` if missing
- loads or creates an `Inspection` record
- stores inspector staff, pass/fail flags, and notes
- saves inspection and session
- audits the action
- publishes realtime update

#### `complete(...)`

- loads session
- ensures status is `INSPECTION`
- ensures an inspection record exists
- changes status to `COMPLETED`
- stamps completion time
- saves session
- updates customer loyalty if a customer account is linked
- logs audit transition
- publishes realtime update
- sends completion notifications
- returns mapped response

#### `processPayment(...)`

- loads session
- marks it as paid
- saves session
- logs payment action
- publishes realtime update
- sends receipt notifications

#### `searchByRegistration(...)`

- normalizes the plate
- loads all matching sessions in descending date order
- for each session, also loads mats, signature, and inspection details
- maps them into a vehicle history response for search screen usage

Helper methods:

- `getSession(...)`
  - central session lookup with not-found protection
- `getLane(...)`
  - lane lookup helper
- `getStaff(...)`
  - staff lookup helper
- `getUserByUsername(...)`
  - supports looking up by email or username
  - this was important because different auth flows identify users differently
- `requireStatus(...)`
  - central status validation helper
- `blankToNull(...)`
  - normalizes empty strings before persistence
- `validateNoDuplicateActiveSession(...)`
  - enforces the duplicate booking/session prevention rule
- `map(...)`
  - converts a heavy session entity into a frontend-ready response DTO

Why this file matters:

- this class contains the real business process of the application
- if you understand this file, you understand the system
