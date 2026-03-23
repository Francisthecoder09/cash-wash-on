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
  "username": "admin",
  "password": "Password123!"
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
  "vehicleType": "SUV",
  "servicePackage": "Premium Wash",
  "sourceRequestId": "0f10a7d6-d7f0-4fd8-bf23-83cd6a38a841"
}
```

### Dashboard

- `GET /api/dashboard/summary?branchId=1`

### Export

- `GET /api/export/csv?branchId=1`
- `GET /api/export/excel?branchId=1`

### Realtime

- WebSocket endpoint: `/ws`
- Topic subscription: `/topic/sessions`

## Default Seed Users

- `admin`
- `manager.accra`
- `cashier.accra`
- `lane.accra`
- `inspector.accra`

Password for all seed users:

```text
password
```

(Note: Use lowercase "password" for all demo accounts)

The seed SQL inserts the users, and the backend bootstraps any non-BCrypt seed passwords into BCrypt on first startup.

Default local backend datasource:

```text
jdbc:postgresql://localhost:5432/car_wash_ops
username: postgres
password: postgres
```

## Setup Instructions

### Option 1: Docker Compose

1. From the repository root, run:

```bash
docker compose up --build
```

2. Open:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Option 2: Local Development

1. Start PostgreSQL and create/import the database:

```bash
createdb car_wash_ops
psql -d car_wash_ops -f database/schema.sql
psql -d car_wash_ops -f database/seed.sql
```

2. Run the backend:

```bash
cd backend
mvn spring-boot:run
```

3. Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Open the app at `http://localhost:5173`.

## Notes

- Offline-first behavior queues POST requests in IndexedDB and syncs them automatically when connectivity returns.
- The tablet lane view is optimized for touch: large action buttons, large typography, live timer, minimal text entry, and canvas signature capture.
- Delayed sessions are shown using the red status system after 45 minutes without completion.
