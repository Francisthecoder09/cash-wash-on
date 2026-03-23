# 🎓 Car Wash Operations System - Complete Exam Preparation Guide

## Project Overview

This is a **Spring Boot 3.3** car wash management system with **React + TypeScript** frontend. It demonstrates enterprise Java development patterns including REST APIs, JWT authentication, role-based access control, JPA/Hibernate ORM, and real-time WebSocket updates.

---

# 📚 PART 1: CORE CONCEPTS EXPLAINED

## 1. Spring Boot Architecture

### What is Spring Boot?
Spring Boot is a framework that simplifies Java enterprise application development by providing:
- **Auto-configuration**: Automatically configures beans based on classpath
- **Embedded servers**: No need for external application servers
- **Starter dependencies**: Pre-configured dependency bundles
- **Production-ready features**: Health checks, metrics, externalized configuration

### This Project's Architecture Layers:

```
┌─────────────────────────────────────────────┐
│           CONTROLLER LAYER (Web)            │
│  @RestController, @RequestMapping          │
├─────────────────────────────────────────────┤
│            SERVICE LAYER (Business)        │
│  @Service, @Transactional                  │
├─────────────────────────────────────────────┤
│           REPOSITORY LAYER (Data)          │
│  JpaRepository, @Query, JPQL               │
├─────────────────────────────────────────────┤
│             ENTITY LAYER (Domain)          │
│  @Entity, @Table, @Column, Relationships   │
└─────────────────────────────────────────────┘
```

### Exam Tip:
> **Question**: Explain the flow of a typical HTTP request in Spring Boot.
> 
> **Answer**: Client → Controller (@RequestMapping) → Service (@Service) → Repository (JpaRepository) → Database → Response flows back through the same layers.

---

## 2. Object-Oriented Programming (OOP) in This Project

### Encapsulation
```java
// BaseEntity.java - Encapsulates id, createdAt, updatedAt
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Private - accessed via getters/setters
    
    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
```
**Concept**: Data hiding - internal state is protected, accessed only through public methods.

### Inheritance
```java
// User extends BaseEntity - inherits id, createdAt, updatedAt
public class User extends BaseEntity {
    private String username;
    private RoleName role;
    // ... more fields
}
```
**Concept**: BaseEntity provides common fields to all entities (User, Branch, Lane, Staff, etc.)

### Polymorphism
```java
// Service interface - multiple implementations
public interface AuthService {
    AuthResponse login(LoginRequest request);
}

// Implemented by:
@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService { ... }
```
**Concept**: Program to interface, not implementation - allows swapping implementations.

### Abstraction
```java
// Repository interface - abstracts database operations
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameAndActiveTrue(String username);
    List<User> findByBranch_Id(Long branchId);
}
```
**Concept**: Hides complex SQL operations behind simple method calls.

---

## 3. REST API Design

### What is REST?
Representational State Transfer - an architectural style for designing networked applications using HTTP methods.

### REST Principles Used in This Project:

| HTTP Method | Operation | Example |
|-------------|-----------|---------|
| GET | Read | `GET /api/sessions` |
| POST | Create | `POST /api/auth/login` |
| PUT | Update | `PUT /api/admin/branches/{id}` |
| DELETE | Delete | `DELETE /api/admin/users/{id}` |

### Controller Example (SessionController.java):
```java
@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    
    // READ - Get all sessions
    @GetMapping
    public List<VehicleSessionResponse> list(...) { ... }
    
    // CREATE - Register new vehicle
    @PostMapping
    public VehicleSessionResponse create(...) { ... }
    
    // UPDATE - Start wash
    @PostMapping("/{sessionId}/start-wash")
    public VehicleSessionResponse startWash(...) { ... }
}
```

### Exam Questions:

> **Q1**: What does @RestController return? 
> **A**: JSON/XML automatically serialized from method return objects.

> **Q2**: Difference between @RequestParam and @PathVariable?
> **A**: @RequestParam = query params (`?branchId=1`), @PathVariable = URL path (`/branches/1`)

---

## 4. Dependency Injection (DI)

### What is DI?
A design pattern where an object receives other objects it depends on, rather than creating them.

### Types Used in This Project:

#### Constructor Injection (Preferred):
```java
@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {
    // Dependencies injected via constructor
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    
    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }
}
```

#### Why Constructor Injection?
1. **Immutability** - dependencies declared as `final`
2. **Testability** - easy to mock in unit tests
3. **Compile-time safety** - missing dependencies cause build failures

### Exam Tip:
> **Question**: Why is @Autowired rarely used now?
> **A**: Constructor injection is preferred; @Autowired on fields breaks encapsulation and makes testing harder.

---

## 5. JPA/Hibernate ORM

### What is JPA?
Java Persistence API - specification for ORM (Object-Relational Mapping). Hibernate is the implementation.

### Entity Relationships in This Project:

#### One-to-Many (Branch → Lanes):
```java
// Branch.java
public class Branch extends BaseEntity {
    // One branch has many lanes - accessed via repository
    // No direct Java relationship, uses foreign key
}

// Lane.java
public class Lane extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;
}
```

#### Many-to-One (User → Branch):
```java
public class User extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    @JsonIgnore  // Prevents infinite recursion in JSON
    private Branch branch;
}
```

### Key Annotations:

| Annotation | Purpose |
|------------|---------|
| `@Entity` | Marks class as database table |
| `@Table` | Customizes table settings |
| `@Id` | Primary key |
| `@GeneratedValue` | Auto-increment strategy |
| `@Column` | Column configuration |
| `@ManyToOne` | Foreign key relationship |
| `@OneToMany` | Collection relationship |
| `@PrePersist` | Run before first save |
| `@PreUpdate` | Run before update |

### Exam Questions:

> **Q1**: What does `@MappedSuperclass` do?
> **A**: Creates a base class whose fields are inherited by entities, but no table is created for the base class itself.

> **Q2**: Lazy vs Eager fetching?
> **A**: Lazy = data loaded on demand (default for collections). Eager = data loaded immediately with parent.

> **Q3**: What problem does @JsonIgnore solve?
> **A**: Prevents infinite recursion when serializing bidirectional relationships to JSON.

---

## 6. Spring Security & JWT

### Security Flow:
```
1. User submits credentials → /api/auth/login
2. AuthService validates via AuthenticationManager
3. JwtService generates JWT token
4. Token returned to client
5. Client includes token in Authorization header
6. JwtAuthenticationFilter validates token on each request
7. SecurityContextHolder.setAuthentication() grants access
```

### JWT (JSON Web Token):
```java
// JwtService.java - Token generation
public String generateToken(AuthenticatedUser user) {
    return Jwts.builder()
            .subject(user.getUsername())           // Who
            .claim("uid", user.getId())            // Custom claims
            .claim("branchId", user.getBranchId())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(secretKey)
            .compact();
}
```

### Role-Based Access Control (RBAC):
```java
// Roles defined in enum
public enum RoleName {
    ADMIN,           // Full system access
    BRANCH_MANAGER, // Branch-level admin
    CASHIER,        // Register vehicles
    LANE_OPERATOR,  // Wash operations
    INSPECTOR,      // Quality checks
    AUDITOR         // Read-only reports
}

// Applied in controllers
@PreAuthorize("hasAnyRoles('ADMIN','BRANCH_MANAGER','CASHIER')")
public VehicleSessionResponse create(...) { ... }
```

### Exam Tip:
> **Question**: Why is JWT stateless?
> **A**: All user info is encoded in the token itself; server doesn't need to store session data.

---

## 7. Exception Handling

### Custom Exception:
```java
// ApiException.java
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    
    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
    
    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }
}
```

### Global Handler:
```java
// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(new ApiErrorResponse(...));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(...) { ... }
}
```

### Exam Question:
> **Q**: Why use @RestControllerAdvice?
> **A**: Centralizes exception handling across all REST controllers, returns consistent JSON error responses.

---

# 📂 PART 2: FILE-BY-FILE ANALYSIS

---

## File 1: CarWashOperationsApplication.java

### Purpose:
Main entry point for the Spring Boot application.

### Code:
```java
@SpringBootApplication
public class CarWashOperationsApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarWashOperationsApplication.class, args);
    }
}
```

### Explanation:
- `@SpringBootApplication` = @Configuration + @EnableAutoConfiguration + @ComponentScan
- Starts embedded server and deploys the application

### Key Concepts:
- Spring Boot auto-configuration
- Application startup lifecycle

---

## File 2: BaseEntity.java

### Purpose:
Abstract base class providing common fields (id, timestamps) for all entities.

### Code:
```java
@MappedSuperclass
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }
    
    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

### Key Concepts:
- **@MappedSuperclass**: Fields inherited by child entities, no table created
- **@Id @GeneratedValue**: Auto-increment primary key
- **@PrePersist**: Callback before INSERT
- **@PreUpdate**: Callback before UPDATE
- **Inheritance**: All entities extend this (User, Branch, Lane, Staff, VehicleSession, etc.)

### Exam Tips:
- BaseEntity demonstrates **encapsulation** (private fields) and **inheritance** (extends by all entities)
- Timestamps are crucial for **audit trails** and **data integrity**

---

## File 3: User.java

### Purpose:
Represents system users with authentication and authorization data.

### Key Fields:
- `username` - Unique login name
- `passwordHash` - BCrypt encrypted password
- `role` - Authorization level (ADMIN, CASHIER, etc.)
- `branch` - Which branch the user works at
- `staff` - Associated staff member record

### Relationships:
- `@ManyToOne` with Branch (each user belongs to one branch)
- `@ManyToOne` with Staff (each user linked to one staff member)

### Key Concepts:
- **Lazy Loading**: `FetchType.LAZY` prevents unnecessary queries
- **@JsonIgnore**: Prevents circular JSON serialization
- **Password Security**: BCrypt hashing (one-way encryption)

---

## File 4: VehicleSession.java

### Purpose:
Core business entity representing a vehicle going through the car wash process.

### Session Status Flow:
```
REGISTERED → WASHING → INTERIOR → INSPECTION → COMPLETED
```

### Key Fields:
- `registrationNumber` - Vehicle plate (e.g., "ABC-1234")
- `status` - Current state in the workflow
- Timestamps for each phase (registeredAt, washingStartedAt, interiorStartedAt, inspectionStartedAt, completedAt)

### Key Concepts:
- **State Machine**: Session transitions follow strict workflow
- **Temporal Data**: Multiple timestamp fields track process
- **Relationships**: Links to Branch, Lane, User (cashier), Staff (operator), Inspection, MatsTracking, Signature

---

## File 5: UserRepository.java

### Purpose:
Data access layer for User entity using Spring Data JPA.

### Code:
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameAndActiveTrue(String username);
    Optional<User> findByUsername(String username);
    List<User> findByBranch_Id(Long branchId);
}
```

### Key Concepts:
- **JpaRepository**: Provides CRUD + pagination + sorting
- **Query Methods**: Spring Data parses method names to generate SQL
- `findByBranch_Id` → `WHERE branch_id = ?` (note: uses nested property path)

### Exam Tip:
> The underscore in `findByBranch_Id` is required when traversing nested relationships!

---

## File 6: VehicleSessionRepository.java

### Purpose:
Complex queries for vehicle session analytics and filtering.

### Key Queries:
```java
@Query("""
    select count(v)
    from VehicleSession v
    where v.branch.id = :branchId 
    and v.completedAt >= :start and v.completedAt < :end
    """)
long countDailyCompleted(@Param("branchId") Long branchId, 
                          @Param("start") Instant start, 
                          @Param("end") Instant end);
```

### Key Concepts:
- **@Query**: Write custom JPQL (Java Persistence Query Language)
- **@Param**: Bind method parameters to query placeholders
- **JPQL vs SQL**: JPQL uses entity names/fields, not table/column names
- **Specification Pattern**: JpaSpecificationExecutor allows dynamic queries

---

## File 7: AuthServiceImpl.java

### Purpose:
Handles user authentication and JWT token generation.

### Authentication Flow:
```java
@Override
public AuthResponse login(LoginRequest request) {
    // 1. Validate credentials
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.username(), request.password()));
    
    // 2. Get user from DB
    User user = userRepository.findById(authenticatedUser.getId())...
    
    // 3. Validate role if provided
    if (request.role() != null && !user.getRole().equals(request.role())) {
        throw new ApiException(...);
    }
    
    // 4. Log the action
    auditService.log(user, null, AuditAction.LOGIN, ...);
    
    // 5. Return JWT token
    return new AuthResponse(
        jwtService.generateToken(authenticatedUser),
        user.getId(), user.getUsername(), user.getRole(), ...);
}
```

### Key Concepts:
- **AuthenticationManager**: Delegates to DaoAuthenticationProvider
- **BCrypt**: Industry-standard password hashing
- **Audit Trail**: Every login is logged
- **@Transactional(readOnly = true)**: Optimizes database reads

---

## File 8: JwtService.java

### Purpose:
Generates and validates JSON Web Tokens.

### Token Structure:
```java
{
  "sub": "manager.accra",        // Subject (username)
  "uid": 1,                      // User ID claim
  "branchId": 1,                 // Branch ID claim
  "roles": ["ROLE_ADMIN"],       // Authorities
  "iat": 1700000000,            // Issued at
  "exp": 1703600000             // Expiration
}
```

### Key Concepts:
- **HMAC-SHA256**: Asymmetric signing algorithm
- **Claims**: Custom data embedded in token
- **Token Expiration**: Prevents无限 sessions
- **Stateless**: Server doesn't store session

---

## File 9: SecurityConfig.java

### Purpose:
Configures Spring Security with JWT authentication.

### Key Configurations:
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Enables @PreAuthorize
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())  // Stateless API
            .cors(cors -> cors.configurationSource(...))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // Public endpoints
                .anyRequest().authenticated())  // Protected
            .addFilterBefore(jwtAuthenticationFilter, 
                UsernamePasswordAuthenticationFilter.class);
    }
}
```

### Key Concepts:
- **Stateless**: No server-side session storage
- **CORS**: Cross-Origin Resource Sharing configuration
- **JWT Filter**: Intercepts requests, validates token
- **Method Security**: @PreAuthorize for fine-grained access

---

## File 10: SessionController.java

### Purpose:
REST API for vehicle session operations (register, start wash, complete, etc.).

### Endpoints:
```java
@GetMapping              // List all sessions (filtered)
@PostMapping            // Register new vehicle
@PostMapping("/{id}/start-wash")    // Begin washing
@PostMapping("/{id}/record-mats")    // Track floor mats
@PostMapping("/{id}/capture-signature") // Customer signature
@PostMapping("/{id}/inspect")        // Quality inspection
@PostMapping("/{id}/complete")       // Finish session
```

### Key Concepts:
- **@PreAuthorize**: Role-based endpoint security
- **@PathVariable**: URL parameter extraction
- **@RequestParam**: Query parameter extraction
- **Principal**: Currently authenticated user

---

## File 11: SessionServiceImpl.java

### Purpose:
Business logic for vehicle session workflow management.

### Key Operations:
```java
@Transactional
public VehicleSessionResponse create(...) {
    // 1. Validate branch exists
    // 2. Create session entity
    // 3. Save to database
    // 4. Log audit event
    // 5. Publish WebSocket event
    // 6. Return response
}
```

### Key Concepts:
- **@Transactional**: All-or-nothing database operations
- **State Validation**: `requireStatus()` ensures valid transitions
- **Real-time Updates**: WebSocket broadcasts to all clients
- **Audit Trail**: Every action is logged

### Exam Tip:
> Why use @Transactional? It ensures data consistency - if any step fails, all changes roll back.

---

## File 12: AdminController.java

### Purpose:
Administrative operations for system management.

### Endpoints:
```java
// Branch Management
POST /api/admin/branches      // Create branch
GET  /api/admin/branches      // List all
GET  /api/admin/branches/{id} // Get one
PUT  /api/admin/branches/{id} // Update
DELETE /api/admin/branches/{id} // Soft delete

// Lane, User, Staff - similar CRUD pattern

// Dashboard (Admin only)
GET /api/admin/dashboard      // System-wide statistics
```

### Key Concepts:
- **Soft Delete**: Sets `active = false` instead of removing record
- **RESTful Design**: Proper HTTP verbs and status codes
- **Validation**: @Valid triggers Bean Validation

---

## File 13: GlobalExceptionHandler.java

### Purpose:
Centralized error handling for the entire API.

### Exception Mappings:
```java
@ExceptionHandler(ApiException.class)       // Custom app errors
@ExceptionHandler(MethodArgumentNotValidException.class)  // @Valid failures
@ExceptionHandler(ConstraintViolationException.class)      // Param validation
@ExceptionHandler(Exception.class)        // Catch-all
```

### Response Structure:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Branch not found: 999",
  "details": {}
}
```

---

# 📝 PART 3: LIKELY EXAM QUESTIONS

## Theory Questions

### Q1: What are the benefits of using Spring Data JPA?
**Answer:**
- Reduces boilerplate code for CRUD operations
- Automatic query generation from method names
- Support for pagination and sorting
- Easy custom query creation with @Query
- Integration with Spring's transaction management

### Q2: Explain the difference between GET, POST, PUT, and DELETE.
**Answer:**
- **GET**: Retrieve data (read-only, idempotent)
- **POST**: Create new resource (non-idempotent)
- **PUT**: Replace/update entire resource (idempotent)
- **DELETE**: Remove resource (idempotent)

### Q3: What is the purpose of @Transactional?
**Answer:**
- Ensures atomicity of database operations
- If any operation fails, all changes are rolled back
- Manages connection lifecycle automatically
- Default propagation is REQUIRED

### Q4: Explain JWT authentication flow.
**Answer:**
1. Client sends credentials to /api/auth/login
2. Server validates, generates JWT with user claims
3. Server returns token to client
4. Client stores token, sends in Authorization header
5. Server validates token signature on each request
6. If valid, user is authenticated for that request

### Q5: What is CORS and why is it needed?
**Answer:**
Cross-Origin Resource Sharing - browser security that blocks requests from different domains. Needed when frontend (localhost:5173) calls API (localhost:8080).

### Q6: Why use @JsonIgnore annotation?
**Answer:**
Prevents infinite recursion during JSON serialization when entities have bidirectional relationships (e.g., User → Branch → Users).

### Q7: What is the difference between @Component, @Service, and @Repository?
**Answer:**
- **@Component**: Generic Spring bean
- **@Service**: Semantic distinction for service layer
- **@Repository**: Special exception translation for DAO layer
- All are stereotypes that enable component scanning

### Q8: Explain the session status workflow in this system.
**Answer:**
```
REGISTERED → WASHING → INTERIOR → INSPECTION → COMPLETED
```
Each transition requires the previous status (enforced in code).

---

## Code Tracing Questions

### Q9: What SQL is generated by this method?
```java
List<User> findByBranch_Id(Long branchId);
```
**Answer:** `SELECT * FROM users WHERE branch_id = ?`

### Q10: What happens when a user calls POST /api/sessions without a token?
**Answer:**
1. JwtAuthenticationFilter checks Authorization header
2. Header missing or doesn't start with "Bearer "
3. Filter passes request to next filter
4. SecurityConfig blocks request (requires authentication)
5. Returns 401 Unauthorized

### Q11: Trace the flow of creating a new vehicle session.
**Answer:**
1. POST /api/sessions with JSON body
2. SessionController.create() receives request
3. @PreAuthorize checks user role
4. SessionServiceImpl.create() invoked
5. Validates branch exists
6. Creates VehicleSession entity
7. Saves to database via VehicleSessionRepository
8. AuditService logs the action
9. WebSocket broadcasts to /topic/sessions
10. Returns VehicleSessionResponse (JSON)

---

## Practical Questions

### Q12: Write a repository method to find active users in a branch.
**Answer:**
```java
List<User> findByBranch_IdAndActiveTrue(Long branchId);
```

### Q13: Add a new endpoint to get sessions by date range.
**Answer:**
```java
@GetMapping("/by-date")
public List<VehicleSessionResponse> getByDateRange(
        @RequestParam Instant startDate,
        @RequestParam Instant endDate) {
    return sessionService.findByDateRange(startDate, endDate);
}
```

### Q14: How would you add a new role "SUPERVISOR"?
**Answer:**
1. Add to RoleName enum: `SUPERVISOR`
2. Add endpoint permissions in controller: `@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")`
3. Update AuthenticatedUser to include new role
4. Optionally update frontend role guard

---

## Scenario-Based Questions

### Q15: The API returns 500 error when fetching sessions. How to debug?
**Answer:**
1. Check server logs for stack trace
2. Common causes:
   - LazyInitializationException (add @Transactional or fetch eager)
   - NullPointerException (missing field initialization)
   - JSON serialization error (missing @JsonIgnore)
3. Test endpoint with curl to isolate frontend issues
4. Check database connectivity

### Q16: Users can't log in after deploying. What could be wrong?
**Answer:**
1. Check database has users (was seed.sql run?)
2. Verify password encoding matches (BCrypt)
3. Check JWT secret in application.yml
4. Ensure token hasn't expired
5. Verify user account is active (isActive = true)

---

# 📋 QUICK REFERENCE: KEY ANNOTATIONS

| Layer | Annotation | Purpose |
|-------|-----------|---------|
| **Boot** | @SpringBootApplication | Entry point, enables auto-config |
| **Config** | @Configuration | Bean definitions |
| **Bean** | @Component, @Service, @Repository | Object creation |
| **Web** | @RestController, @GetMapping, @PostMapping | HTTP endpoints |
| **Security** | @PreAuthorize, @Secured | Access control |
| **Data** | @Entity, @Id, @Column | Database mapping |
| **Data** | @ManyToOne, @OneToMany | Relationships |
| **Data** | @Query, @Param | Custom SQL |
| **Transaction** | @Transactional | DB transaction scope |
| **Validation** | @Valid, @NotBlank | Input validation |
| **JSON** | @JsonIgnore | Exclude from JSON |

---

# 🔑 FINAL EXAM CHECKLIST

Before your exam, ensure you can explain:

- [ ] Spring Boot architecture layers
- [ ] How REST API request flows through layers
- [ ] JPA entity relationships and annotations
- [ ] JWT authentication and authorization
- [ ] Role-based access control
- [ ] Exception handling strategy
- [ ] Transaction management
- [ ] Lazy vs Eager loading
- [ ] Query method naming conventions
- [ ] Security filter chain

---

*This guide covers the core concepts demonstrated in the Car Wash Operations System. Study the code examples and understand the patterns - they apply to any Spring Boot enterprise application.*
