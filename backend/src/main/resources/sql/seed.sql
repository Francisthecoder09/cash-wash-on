-- H2 compatible seed data
-- Note: Since spring.sql.init.mode=always and we use a memory DB, 
-- we can just use plain INSERTs.

INSERT INTO branches (id, name, location, timezone, active, created_at, updated_at) VALUES
(1, 'Accra Central', 'Osu Ringway, Accra', 'Africa/Accra', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Tema Waterfront', 'Harbour Road, Tema', 'Africa/Accra', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO lanes (id, branch_id, lane_name, display_order, active, created_at, updated_at) VALUES
(1, 1, 'Lane Alpha', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Lane Bravo', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'Lane Coastal', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO staff (id, branch_id, full_name, employee_code, phone, active, created_at, updated_at) VALUES
(1, 1, 'Amina Boateng', 'STF-001', '+233200000001', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Kojo Mensah', 'STF-002', '+233200000002', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 'Abena Nyarko', 'STF-003', '+233200000003', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 'Kwame Asare', 'STF-004', '+233200000004', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 'Efua Ofori', 'STF-005', '+233200000005', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 2, 'Yaw Thompson', 'STF-006', '+233200000006', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 1, 'Kofi Acheampong', 'STF-007', '+233200000007', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 1, 'System Portal', 'SYS-PORTAL', '+233000000000', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO customers (id, full_name, phone, email, total_visits, loyalty_points, last_vehicle_registration, created_at, updated_at) VALUES
(1, 'Nana Kwarteng', '+233540000111', 'nana@example.com', 5, 50, 'GR-2026-11', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Selorm Adjei', '+233540000222', 'selorm@example.com', 2, 20, 'GT-1190-24', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Priscilla Nortey', '+233540000333', 'priscilla@example.com', 1, 10, 'GW-4300-25', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, branch_id, staff_id, email, username, password_hash, pin_hash, role, active, created_at, updated_at) VALUES
(1, 1, 1, 'admin@rinseflow.com', 'admin', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', 'ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'manager@rinseflow.com', 'manager.accra', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', 'BRANCH_MANAGER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 3, 'cashier@rinseflow.com', 'cashier.accra', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', 'CASHIER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 4, 'lane@rinseflow.com', 'lane.accra', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', 'LANE_OPERATOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 5, 'inspector@rinseflow.com', 'inspector.accra', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', 'INSPECTOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 1, 7, 'auditor@rinseflow.com', 'auditor.accra', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', 'AUDITOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 1, 8, 'portal@rinseflow.com', 'portal', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', '$2a$10$T/93Rm2NtlgibIuZO7WtuO9M3TYpV9LtW1NWc7bxsw2UXEvJB8zJ2', 'CASHIER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO vehicle_sessions (
    id, branch_id, lane_id, cashier_user_id, operator_staff_id, customer_id, registration_number, customer_name, customer_phone,
    vehicle_type, service_package, status, source_request_id, registered_at, washing_started_at, interior_started_at,
    inspection_started_at, completed_at, portal_token, price, is_paid, delay_reason, created_at, updated_at
) VALUES
(1, 1, 1, 3, 4, 1, 'GR-2026-11', 'Nana Kwarteng', '+233540000111', 'SUV', 'Premium Wash', 'COMPLETED', 'seed-session-1',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'token-hash-1', 25.0, TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 3, 4, 2, 'GT-1190-24', 'Selorm Adjei', '+233540000222', 'Sedan', 'Express Wash', 'INSPECTION', 'seed-session-2',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 'token-hash-2', 15.0, FALSE, 'Awaiting final approval', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 3, 3, 6, 3, 'GW-4300-25', 'Priscilla Nortey', '+233540000333', 'Truck', 'Executive Detail', 'WASHING', 'seed-session-3',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'token-hash-3', 60.0, FALSE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO mats_tracking (id, vehicle_session_id, mats_removed, mats_reinstalled, condition_notes, created_at, updated_at) VALUES
(1, 1, 4, 4, 'Restored and dry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 4, 4, 'Queued for inspection', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO signatures (id, vehicle_session_id, signed_by, signature_data_url, created_at, updated_at) VALUES
(1, 1, 'Nana Kwarteng', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inspections (id, vehicle_session_id, inspector_staff_id, body_check_passed, interior_check_passed, notes, created_at, updated_at) VALUES
(1, 1, 5, TRUE, TRUE, 'Excellent finish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 5, TRUE, TRUE, 'Waiting final handoff', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO audit_logs (id, user_id, vehicle_session_id, action, description, metadata_json, created_at, updated_at) VALUES
(1, 3, 1, 'CREATE', 'Vehicle session registered', '{"status":"REGISTERED"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 1, 'SESSION_TRANSITION', 'Session moved to WASHING', '{"status":"WASHING"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 5, 1, 'SESSION_TRANSITION', 'Session completed', '{"status":"COMPLETED"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================== SERVICE DATA ====================

INSERT INTO service_types (id, service_name, description, base_price, duration_minutes, category, is_featured, active, created_at, updated_at) VALUES
(1, 'Basic Wash', 'Exterior wash and dry', 10.00, 20, 'WASH', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Premium Wash', 'Basic wash + wax and tire shine', 20.00, 35, 'WASH', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Interior Detail', 'Deep cleaning of seats and carpet', 45.00, 60, 'INTERIOR', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Full Executive', 'Premium wash + Interior detail', 60.00, 90, 'WASH', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Interior Detailing', 'Seats, dash, and high-touch cabin finishing', 12.00, 15, 'ADDON', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Rim Cleaning', 'Extra attention on wheel faces and brake dust', 8.00, 10, 'ADDON', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Tire Shine', 'Finishing gloss for a cleaner handoff look', 6.00, 8, 'ADDON', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Dashboard Wipe-down', 'Quick interior reset for dash and front trim', 5.00, 8, 'ADDON', FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO pricing (id, service_type_id, vehicle_category, price, discount_percentage, active, created_at, updated_at) VALUES
(1, 1, 'SEDAN', 10.00, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'SUV', 12.00, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'SEDAN', 20.00, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'SUV', 25.00, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 4, 'SEDAN', 60.00, 5.0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset sequences to avoid PK violations
ALTER TABLE branches AUTO_INCREMENT = 100;
ALTER TABLE lanes AUTO_INCREMENT = 100;
ALTER TABLE staff AUTO_INCREMENT = 100;
ALTER TABLE users AUTO_INCREMENT = 100;
ALTER TABLE vehicle_sessions AUTO_INCREMENT = 100;
ALTER TABLE mats_tracking AUTO_INCREMENT = 100;
ALTER TABLE signatures AUTO_INCREMENT = 100;
ALTER TABLE inspections AUTO_INCREMENT = 100;
ALTER TABLE audit_logs AUTO_INCREMENT = 100;
ALTER TABLE service_types AUTO_INCREMENT = 100;
ALTER TABLE pricing AUTO_INCREMENT = 100;
ALTER TABLE customers AUTO_INCREMENT = 100;
