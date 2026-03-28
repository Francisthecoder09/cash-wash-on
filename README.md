# Car Wash Operations Management System

## Project Structure

```text
car-wash-on/
├─ backend/
│  ├─ src/main/java/com/carwash/ops/
│  │  ├─ common/
│  │  ├─ config/
│  │  ├─ domain/
│  │  ├─ dto/
│  │  ├─ repository/
│  │  ├─ security/
│  │  ├─ service/
│  │  └─ web/
│  ├─ src/main/resources/application.yml
│  ├─ pom.xml
│  └─ Dockerfile
├─ frontend/
│  ├─ src/api
│  ├─ src/components
│  ├─ src/hooks
│  ├─ src/pages
│  ├─ src/store
│  ├─ src/theme
│  ├─ src/types
│  ├─ src/utils
│  ├─ package.json
│  ├─ nginx.conf
│  └─ Dockerfile
├─ database/
│  ├─ schema.sql
│  └─ seed.sql
└─ docker-compose.yml
```

## Backend

- Java 21 + Spring Boot 3.3
- Spring Security with JWT and BCrypt
- Spring Data JPA with PostgreSQL
- DTO-based REST API
- WebSocket topic at `/topic/sessions`
- Apache POI export endpoints
- Workflow enforcement:
  - `REGISTERED -> WASHING -> INTERIOR -> INSPECTION -> COMPLETED`

## Frontend

- React 18 + TypeScript + Vite
- Material UI 6 with premium dark/light themes
- Framer Motion transitions
- Responsive dashboard, session board, search view, and lane tablet UI
- IndexedDB queue with auto-sync on reconnect

## Database

- PostgreSQL 17
- Normalized tables for:
  - `branches`
  - `lanes`
  - `staff`
  - `users`
  - `vehicle_sessions`
  - `mats_tracking`
  - `signatures`
  - `inspections`
  - `audit_logs`
- Indexed fields include:
  - `registration_number`
  - timestamps
  - foreign keys

## API Documentation

### Authentication

- `POST /api/auth/login`
  - Body:

```json
{
  "email": "admin@rinseflow.local",
  "pin": "123456",
  "role": "ADMIN"
}
```

### Reference Data

- `GET /api/reference/branches`
- `GET /api/reference/branches/{branchId}/lanes`
- `GET /api/reference/branches/{branchId}/staff`

### Sessions

- `GET /api/sessions?branchId=1`
- `POST /api/sessions`
- `POST /api/sessions/{sessionId}/start-wash`
- `POST /api/sessions/{sessionId}/record-mats`
- `POST /api/sessions/{sessionId}/capture-signature`
- `POST /api/sessions/{sessionId}/inspect`
- `POST /api/sessions/{sessionId}/complete`
- `GET /api/sessions/search?registrationNumber=GR-2026-11`

#### Create Session Payload

```json
{
  "branchId": 1,
  "laneId": 1,
  "registrationNumber": "GR-2026-88",
  "customerName": "Akosua Annan",
  "customerPhone": "+233540123456",
  "customerEmail": "akosua@rinseflow.com",
  "vehicleType": "SUV",
  "servicePackage": "Premium Wash",
  "sourceRequestId": "0f10a7d6-d7f0-4fd8-bf23-83cd6a38a841"
}
```

### Customer Portal

- Portal booking now captures `customerEmail`
- Customer re-entry uses `registration number + email`
- OTP email delivery works in production when SMTP env vars are configured

### Dashboard

- `GET /api/dashboard/summary?branchId=1`

### Export

- `GET /api/export/csv?branchId=1`
- `GET /api/export/excel?branchId=1`

### Realtime

- WebSocket endpoint: `/ws`
- Topic subscription: `/topic/sessions`

## Default Seed Users

- `admin@rinseflow.com` / `123456` / `ADMIN`
- `manager@rinseflow.com` / `123456` / `BRANCH_MANAGER`
- `cashier@rinseflow.com` / `123456` / `CASHIER`
- `lane@rinseflow.com` / `123456` / `LANE_OPERATOR`
- `inspector@rinseflow.com` / `123456` / `INSPECTOR`
- `auditor@rinseflow.com` / `123456` / `AUDITOR`

The implemented login flow uses `email`, `pin`, and a matching `role`.

For local development, the default backend datasource is:

```text
jdbc:h2:mem:carwashdb;DB_CLOSE_DELAY=-1;MODE=MySQL
username: sa
password:
```

## Setup Instructions

### Local Development

1. Run the backend:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

2. Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Open:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8083`
   - Health: `http://localhost:8083/actuator/health`

### Production / Hosted Deployment

1. Copy the example env files:

```bash
backend/.env.example
frontend/.env.example
```

2. Set backend env vars for:
   - PostgreSQL or another production database
   - JWT secret
   - frontend CORS origin
   - SMTP delivery for customer OTP emails

3. Set frontend env vars:

```bash
VITE_API_URL=https://your-backend-domain.com
```

4. Important backend production env vars:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/car_wash_ops
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password
SPRING_SQL_INIT_MODE=never
APP_JWT_SECRET=replace_with_a_long_random_secret
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
APP_MAIL_MOCK_ENABLED=false
APP_MAIL_FROM=noreply@yourdomain.com
SPRING_MAIL_HOST=smtp.sendgrid.net
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=apikey
SPRING_MAIL_PASSWORD=your_sendgrid_api_key
```

5. If you use SendGrid, complete domain authentication before enabling `APP_MAIL_MOCK_ENABLED=false`.

### Docker Compose

The existing compose setup can still be used for containerized local runs, but verify its exposed ports and env vars before using it in production.

## Notes

- Offline-first behavior queues POST requests in IndexedDB and syncs them automatically when connectivity returns.
- The tablet lane view is optimized for touch: large action buttons, large typography, live timer, minimal text entry, and canvas signature capture.
- Delayed sessions are shown using the red status system after 45 minutes without completion.
