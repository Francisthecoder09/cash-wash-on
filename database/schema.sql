CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL,
    timezone VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_branch_created_at ON branches (created_at);
CREATE INDEX IF NOT EXISTS idx_branch_updated_at ON branches (updated_at);

CREATE TABLE IF NOT EXISTS lanes (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    lane_name VARCHAR(60) NOT NULL,
    display_order INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lane_branch_id ON lanes (branch_id);
CREATE INDEX IF NOT EXISTS idx_lane_created_at ON lanes (created_at);
CREATE INDEX IF NOT EXISTS idx_lane_updated_at ON lanes (updated_at);

CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    full_name VARCHAR(120) NOT NULL,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_branch_id ON staff (branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_created_at ON staff (created_at);
CREATE INDEX IF NOT EXISTS idx_staff_updated_at ON staff (updated_at);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    staff_id BIGINT NOT NULL REFERENCES staff(id),
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255),
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_branch_id ON users (branch_id);
CREATE INDEX IF NOT EXISTS idx_user_staff_id ON users (staff_id);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON users (created_at);
CREATE INDEX IF NOT EXISTS idx_user_updated_at ON users (updated_at);

CREATE TABLE IF NOT EXISTS vehicle_sessions (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    lane_id BIGINT REFERENCES lanes(id),
    cashier_user_id BIGINT NOT NULL REFERENCES users(id),
    operator_staff_id BIGINT REFERENCES staff(id),
    registration_number VARCHAR(25) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30),
    vehicle_type VARCHAR(50) NOT NULL,
    service_package VARCHAR(80) NOT NULL,
    status VARCHAR(30) NOT NULL,
    source_request_id VARCHAR(80) UNIQUE,
    registered_at TIMESTAMPTZ NOT NULL,
    washing_started_at TIMESTAMPTZ,
    interior_started_at TIMESTAMPTZ,
    inspection_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    delay_reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_session_registration_number ON vehicle_sessions (registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_branch_id ON vehicle_sessions (branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_lane_id ON vehicle_sessions (lane_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_cashier_user_id ON vehicle_sessions (cashier_user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_operator_staff_id ON vehicle_sessions (operator_staff_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_created_at ON vehicle_sessions (created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_updated_at ON vehicle_sessions (updated_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_registered_at ON vehicle_sessions (registered_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_completed_at ON vehicle_sessions (completed_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_status ON vehicle_sessions (status);

CREATE TABLE IF NOT EXISTS mats_tracking (
    id BIGSERIAL PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL UNIQUE REFERENCES vehicle_sessions(id),
    mats_removed INTEGER NOT NULL DEFAULT 0,
    mats_reinstalled INTEGER NOT NULL DEFAULT 0,
    condition_notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mats_tracking_session_id ON mats_tracking (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_mats_tracking_created_at ON mats_tracking (created_at);
CREATE INDEX IF NOT EXISTS idx_mats_tracking_updated_at ON mats_tracking (updated_at);

CREATE TABLE IF NOT EXISTS signatures (
    id BIGSERIAL PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL UNIQUE REFERENCES vehicle_sessions(id),
    signed_by VARCHAR(120) NOT NULL,
    signature_data_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_signature_session_id ON signatures (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_signature_created_at ON signatures (created_at);
CREATE INDEX IF NOT EXISTS idx_signature_updated_at ON signatures (updated_at);

CREATE TABLE IF NOT EXISTS inspections (
    id BIGSERIAL PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL UNIQUE REFERENCES vehicle_sessions(id),
    inspector_staff_id BIGINT NOT NULL REFERENCES staff(id),
    body_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    interior_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspection_session_id ON inspections (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_inspection_inspector_staff_id ON inspections (inspector_staff_id);
CREATE INDEX IF NOT EXISTS idx_inspection_created_at ON inspections (created_at);
CREATE INDEX IF NOT EXISTS idx_inspection_updated_at ON inspections (updated_at);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    vehicle_session_id BIGINT REFERENCES vehicle_sessions(id),
    action VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    metadata_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_vehicle_session_id ON audit_logs (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_updated_at ON audit_logs (updated_at);
