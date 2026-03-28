INSERT INTO branches (id, name, location, timezone, active, created_at, updated_at) VALUES
(1, 'Accra Central', 'Osu Ringway, Accra', 'Africa/Accra', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Tema Waterfront', 'Harbour Road, Tema', 'Africa/Accra', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO lanes (id, branch_id, lane_name, display_order, active, created_at, updated_at) VALUES
(1, 1, 'Lane Alpha', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Lane Bravo', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'Lane Coastal', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO staff (id, branch_id, full_name, employee_code, phone, active, created_at, updated_at) VALUES
(1, 1, 'Amina Boateng', 'STF-001', '+233200000001', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Kojo Mensah', 'STF-002', '+233200000002', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 'Abena Nyarko', 'STF-003', '+233200000003', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 'Kwame Asare', 'STF-004', '+233200000004', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 'Efua Ofori', 'STF-005', '+233200000005', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 2, 'Yaw Thompson', 'STF-006', '+233200000006', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO users (id, branch_id, staff_id, username, email, password_hash, pin_hash, role, active, created_at, updated_at) VALUES
(1, 1, 1, 'admin', 'admin@carwash.com', 'Password123!', 'Password123!', 'ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'manager.accra', 'manager@carwash.com', 'Password123!', 'Password123!', 'BRANCH_MANAGER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 3, 'cashier.accra', 'cashier@carwash.com', 'Password123!', 'Password123!', 'CASHIER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 4, 'lane.accra', 'lane@carwash.com', 'Password123!', 'Password123!', 'LANE_OPERATOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 5, 'inspector.accra', 'inspector@carwash.com', 'Password123!', 'Password123!', 'INSPECTOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO vehicle_sessions (
    id, branch_id, lane_id, cashier_user_id, operator_staff_id, registration_number, customer_name, customer_phone,
    vehicle_type, service_package, status, source_request_id, registered_at, washing_started_at, interior_started_at,
    inspection_started_at, completed_at, delay_reason, created_at, updated_at
) VALUES
(1, 1, 1, 3, 4, 'GR-2026-11', 'Nana Kwarteng', '+233540000111', 'SUV', 'Premium Wash', 'COMPLETED', 'seed-session-1',
 CURRENT_TIMESTAMP - INTERVAL '5 hours',
 CURRENT_TIMESTAMP - INTERVAL '4 hours 50 minutes',
 CURRENT_TIMESTAMP - INTERVAL '4 hours 25 minutes',
 CURRENT_TIMESTAMP - INTERVAL '4 hours 10 minutes',
 CURRENT_TIMESTAMP - INTERVAL '3 hours 58 minutes',
 NULL,
 CURRENT_TIMESTAMP - INTERVAL '5 hours',
 CURRENT_TIMESTAMP - INTERVAL '3 hours 58 minutes'),
(2, 1, 2, 3, 4, 'GT-1190-24', 'Selorm Adjei', '+233540000222', 'Sedan', 'Express Wash', 'INSPECTION', 'seed-session-2',
 CURRENT_TIMESTAMP - INTERVAL '90 minutes',
 CURRENT_TIMESTAMP - INTERVAL '78 minutes',
 CURRENT_TIMESTAMP - INTERVAL '42 minutes',
 CURRENT_TIMESTAMP - INTERVAL '14 minutes',
 NULL,
 'Awaiting final approval',
 CURRENT_TIMESTAMP - INTERVAL '90 minutes',
 CURRENT_TIMESTAMP),
(3, 2, 3, 3, 6, 'GW-4300-25', 'Priscilla Nortey', '+233540000333', 'Truck', 'Executive Detail', 'WASHING', 'seed-session-3',
 CURRENT_TIMESTAMP - INTERVAL '30 minutes',
 CURRENT_TIMESTAMP - INTERVAL '20 minutes',
 NULL,
 NULL,
 NULL,
 NULL,
 CURRENT_TIMESTAMP - INTERVAL '30 minutes',
 CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO mats_tracking (id, vehicle_session_id, mats_removed, mats_reinstalled, condition_notes, created_at, updated_at) VALUES
(1, 1, 4, 4, 'Restored and dry', CURRENT_TIMESTAMP - INTERVAL '4 hours 22 minutes', CURRENT_TIMESTAMP - INTERVAL '4 hours 20 minutes'),
(2, 2, 4, 4, 'Queued for inspection', CURRENT_TIMESTAMP - INTERVAL '38 minutes', CURRENT_TIMESTAMP - INTERVAL '35 minutes')
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO signatures (id, vehicle_session_id, signed_by, signature_data_url, created_at, updated_at) VALUES
(1, 1, 'Nana Kwarteng', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours')
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO inspections (id, vehicle_session_id, inspector_staff_id, body_check_passed, interior_check_passed, notes, created_at, updated_at) VALUES
(1, 1, 5, TRUE, TRUE, 'Excellent finish', CURRENT_TIMESTAMP - INTERVAL '4 hours 5 minutes', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(2, 2, 5, TRUE, TRUE, 'Waiting final handoff', CURRENT_TIMESTAMP - INTERVAL '12 minutes', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

INSERT INTO audit_logs (id, user_id, vehicle_session_id, action, description, metadata_json, created_at, updated_at) VALUES
(1, 3, 1, 'CREATE', 'Vehicle session registered', '{"status":"REGISTERED"}', CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
(2, 4, 1, 'SESSION_TRANSITION', 'Session moved to WASHING', '{"status":"WASHING"}', CURRENT_TIMESTAMP - INTERVAL '4 hours 50 minutes', CURRENT_TIMESTAMP - INTERVAL '4 hours 50 minutes'),
(3, 5, 1, 'SESSION_TRANSITION', 'Session completed', '{"status":"COMPLETED"}', CURRENT_TIMESTAMP - INTERVAL '3 hours 58 minutes', CURRENT_TIMESTAMP - INTERVAL '3 hours 58 minutes')
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at;

SELECT setval('branches_id_seq', COALESCE((SELECT MAX(id) FROM branches), 1), TRUE);
SELECT setval('lanes_id_seq', COALESCE((SELECT MAX(id) FROM lanes), 1), TRUE);
SELECT setval('staff_id_seq', COALESCE((SELECT MAX(id) FROM staff), 1), TRUE);
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), TRUE);
SELECT setval('vehicle_sessions_id_seq', COALESCE((SELECT MAX(id) FROM vehicle_sessions), 1), TRUE);
SELECT setval('mats_tracking_id_seq', COALESCE((SELECT MAX(id) FROM mats_tracking), 1), TRUE);
SELECT setval('signatures_id_seq', COALESCE((SELECT MAX(id) FROM signatures), 1), TRUE);
SELECT setval('inspections_id_seq', COALESCE((SELECT MAX(id) FROM inspections), 1), TRUE);
SELECT setval('audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM audit_logs), 1), TRUE);
