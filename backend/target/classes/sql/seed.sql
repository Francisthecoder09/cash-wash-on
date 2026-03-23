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
(7, 1, 'Kofi Acheampong', 'STF-007', '+233200000007', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, branch_id, staff_id, username, password_hash, role, active, created_at, updated_at) VALUES
(1, 1, 1, 'admin', 'password', 'ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'manager.accra', 'password', 'BRANCH_MANAGER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 3, 'cashier.accra', 'password', 'CASHIER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 4, 'lane.accra', 'password', 'LANE_OPERATOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 5, 'inspector.accra', 'password', 'INSPECTOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 1, 7, 'auditor.accra', 'password', 'AUDITOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO vehicle_sessions (
    id, branch_id, lane_id, cashier_user_id, operator_staff_id, registration_number, customer_name, customer_phone,
    vehicle_type, service_package, status, source_request_id, registered_at, washing_started_at, interior_started_at,
    inspection_started_at, completed_at, delay_reason, created_at, updated_at
) VALUES
(1, 1, 1, 3, 4, 'GR-2026-11', 'Nana Kwarteng', '+233540000111', 'SUV', 'Premium Wash', 'COMPLETED', 'seed-session-1',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 3, 4, 'GT-1190-24', 'Selorm Adjei', '+233540000222', 'Sedan', 'Express Wash', 'INSPECTION', 'seed-session-2',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 'Awaiting final approval', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 3, 3, 6, 'GW-4300-25', 'Priscilla Nortey', '+233540000333', 'Truck', 'Executive Detail', 'WASHING', 'seed-session-3',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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

-- Reset sequences to avoid PK violations
ALTER TABLE branches ALTER COLUMN id RESTART WITH 100;
ALTER TABLE lanes ALTER COLUMN id RESTART WITH 100;
ALTER TABLE staff ALTER COLUMN id RESTART WITH 100;
ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE vehicle_sessions ALTER COLUMN id RESTART WITH 100;
ALTER TABLE mats_tracking ALTER COLUMN id RESTART WITH 100;
ALTER TABLE signatures ALTER COLUMN id RESTART WITH 100;
ALTER TABLE inspections ALTER COLUMN id RESTART WITH 100;
ALTER TABLE audit_logs ALTER COLUMN id RESTART WITH 100;
