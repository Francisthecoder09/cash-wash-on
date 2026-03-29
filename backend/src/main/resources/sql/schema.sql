SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS pricing;
DROP TABLE IF EXISTS service_types;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS inspections;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS mats_tracking;
DROP TABLE IF EXISTS vehicle_sessions;
DROP TABLE IF EXISTS customer_otps;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS lanes;
DROP TABLE IF EXISTS branches;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    location VARCHAR(200) NOT NULL,
    timezone VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_branch_created_at ON branches (created_at);
CREATE INDEX IF NOT EXISTS idx_branch_updated_at ON branches (updated_at);

CREATE TABLE IF NOT EXISTS lanes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    lane_name VARCHAR(60) NOT NULL,
    display_order INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX IF NOT EXISTS idx_lane_branch_id ON lanes (branch_id);
CREATE INDEX IF NOT EXISTS idx_lane_created_at ON lanes (created_at);
CREATE INDEX IF NOT EXISTS idx_lane_updated_at ON lanes (updated_at);

CREATE TABLE IF NOT EXISTS staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX IF NOT EXISTS idx_staff_branch_id ON staff (branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_created_at ON staff (created_at);
CREATE INDEX IF NOT EXISTS idx_staff_updated_at ON staff (updated_at);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    email VARCHAR(80) NOT NULL UNIQUE,
    username VARCHAR(80),
    password_hash VARCHAR(255),
    pin_hash VARCHAR(255),
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

CREATE INDEX IF NOT EXISTS idx_user_branch_id ON users (branch_id);
CREATE INDEX IF NOT EXISTS idx_user_staff_id ON users (staff_id);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON users (created_at);
CREATE INDEX IF NOT EXISTS idx_user_updated_at ON users (updated_at);

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(100),
    username VARCHAR(60) UNIQUE,
    pin_hash VARCHAR(255),
    total_visits INTEGER DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    last_vehicle_registration VARCHAR(25),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customer_username ON customers (username);
CREATE INDEX IF NOT EXISTS idx_customer_created_at ON customers (created_at);
CREATE INDEX IF NOT EXISTS idx_customer_updated_at ON customers (updated_at);

CREATE TABLE IF NOT EXISTS customer_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_otps_email ON customer_otps (email);
CREATE INDEX IF NOT EXISTS idx_customer_otps_created_at ON customer_otps (created_at);

CREATE TABLE IF NOT EXISTS vehicle_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    lane_id BIGINT,
    cashier_user_id BIGINT NOT NULL,
    operator_staff_id BIGINT,
    customer_id BIGINT,
    registration_number VARCHAR(25) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30),
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_image_url LONGTEXT,
    service_package VARCHAR(80) NOT NULL,
    add_on_services TEXT,
    status VARCHAR(30) NOT NULL,
    source_request_id VARCHAR(80) UNIQUE,
    registered_at TIMESTAMP NOT NULL,
    appointment_at TIMESTAMP,
    washing_started_at TIMESTAMP,
    interior_started_at TIMESTAMP,
    inspection_started_at TIMESTAMP,
    completed_at TIMESTAMP,
    portal_token VARCHAR(100) UNIQUE,
    price DECIMAL(10,2) DEFAULT 0.0,
    is_paid BOOLEAN DEFAULT FALSE,
    delay_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (lane_id) REFERENCES lanes(id),
    FOREIGN KEY (cashier_user_id) REFERENCES users(id),
    FOREIGN KEY (operator_staff_id) REFERENCES staff(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_session_registration_number ON vehicle_sessions (registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_branch_id ON vehicle_sessions (branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_lane_id ON vehicle_sessions (lane_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_cashier_user_id ON vehicle_sessions (cashier_user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_operator_staff_id ON vehicle_sessions (operator_staff_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_customer_id ON vehicle_sessions (customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_created_at ON vehicle_sessions (created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_updated_at ON vehicle_sessions (updated_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_registered_at ON vehicle_sessions (registered_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_completed_at ON vehicle_sessions (completed_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_session_status ON vehicle_sessions (status);

CREATE TABLE IF NOT EXISTS mats_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL UNIQUE,
    mats_removed INTEGER NOT NULL DEFAULT 0,
    mats_reinstalled INTEGER NOT NULL DEFAULT 0,
    condition_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_session_id) REFERENCES vehicle_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_mats_tracking_session_id ON mats_tracking (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_mats_tracking_created_at ON mats_tracking (created_at);
CREATE INDEX IF NOT EXISTS idx_mats_tracking_updated_at ON mats_tracking (updated_at);

CREATE TABLE IF NOT EXISTS signatures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL UNIQUE,
    signed_by VARCHAR(120) NOT NULL,
    signature_data_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_session_id) REFERENCES vehicle_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_signature_session_id ON signatures (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_signature_created_at ON signatures (created_at);
CREATE INDEX IF NOT EXISTS idx_signature_updated_at ON signatures (updated_at);

CREATE TABLE IF NOT EXISTS inspections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL UNIQUE,
    inspector_staff_id BIGINT NOT NULL,
    body_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    interior_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_session_id) REFERENCES vehicle_sessions(id),
    FOREIGN KEY (inspector_staff_id) REFERENCES staff(id)
);

CREATE INDEX IF NOT EXISTS idx_inspection_session_id ON inspections (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_inspection_inspector_staff_id ON inspections (inspector_staff_id);
CREATE INDEX IF NOT EXISTS idx_inspection_created_at ON inspections (created_at);
CREATE INDEX IF NOT EXISTS idx_inspection_updated_at ON inspections (updated_at);

CREATE TABLE IF NOT EXISTS session_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_name VARCHAR(120) NOT NULL,
    message_body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_session_id) REFERENCES vehicle_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_session_messages_vehicle_session_id ON session_messages (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_created_at ON session_messages (created_at);

CREATE TABLE IF NOT EXISTS session_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_session_id BIGINT NOT NULL,
    processed_by_user_id BIGINT,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reference_number VARCHAR(120),
    payment_notes VARCHAR(500),
    paid_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_session_id) REFERENCES vehicle_sessions(id),
    FOREIGN KEY (processed_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_session_payments_vehicle_session_id ON session_payments (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_session_payments_paid_at ON session_payments (paid_at);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    vehicle_session_id BIGINT,
    action VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    metadata_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_session_id) REFERENCES vehicle_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_vehicle_session_id ON audit_logs (vehicle_session_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_updated_at ON audit_logs (updated_at);

-- ==================== SERVICE MANAGEMENT ====================

CREATE TABLE IF NOT EXISTS service_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(120) NOT NULL UNIQUE,
    branch_id BIGINT,
    description VARCHAR(1000),
    base_price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    category VARCHAR(50),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE INDEX IF NOT EXISTS idx_service_type_name ON service_types (service_name);
CREATE INDEX IF NOT EXISTS idx_service_type_branch_id ON service_types (branch_id);

CREATE TABLE IF NOT EXISTS pricing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_type_id BIGINT NOT NULL,
    vehicle_category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2),
    effective_from TIMESTAMP,
    effective_until TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id)
);

CREATE INDEX IF NOT EXISTS idx_pricing_service_type_id ON pricing (service_type_id);
CREATE INDEX IF NOT EXISTS idx_pricing_vehicle_category ON pricing (vehicle_category);
