-- =====================================================================
-- IT Helpdesk & Incident Management System - Seed Data
-- Database: helpdesk_db
-- Passwords for demo users:
-- admin@helpdesk.com    -> password123
-- tech@helpdesk.com     -> password123
-- employee@company.com  -> password123
-- agent@helpdesk.com    -> password123
-- manager@helpdesk.com  -> password123
-- =====================================================================

USE helpdesk_db;

-- 1. ROLES
INSERT INTO ROLE (role_id, role_name) VALUES
(1, 'Employee'),
(2, 'Helpdesk Agent'),
(3, 'Technician'),
(4, 'IT Manager'),
(5, 'Administrator')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- 2. DEPARTMENTS
INSERT INTO DEPARTMENT (department_id, department_name) VALUES
(1, 'Information Technology'),
(2, 'Finance & Accounting'),
(3, 'Human Resources'),
(4, 'Marketing & Sales'),
(5, 'Operations & Logistics')
ON DUPLICATE KEY UPDATE department_name=VALUES(department_name);

-- 3. USERS (hashed password for 'password123' is '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu')
INSERT INTO USER (user_id, name, email, phone, department_id, role_id, password_hash) VALUES
(1, 'Admin User', 'admin@helpdesk.com', '+1-555-0100', 1, 5, '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu'),
(2, 'Alex Rivera', 'tech@helpdesk.com', '+1-555-0101', 1, 3, '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu'),
(3, 'Sarah Chen', 'sarah.tech@helpdesk.com', '+1-555-0102', 1, 3, '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu'),
(4, 'John Doe', 'employee@company.com', '+1-555-0201', 2, 1, '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu'),
(5, 'Emily Smith', 'emily.hr@company.com', '+1-555-0202', 3, 1, '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu'),
(6, 'Helpdesk Agent', 'agent@helpdesk.com', '+1-555-0301', 1, 2, '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu'),
(7, 'IT Manager', 'manager@helpdesk.com', '+1-555-0302', 1, 4, '$2b$10$TCT41nbFfkW3zmsRHSAQKOero1WftejNJxotWAzbF5LkMOysHNpZu')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. SUPPORT TEAMS
INSERT INTO SUPPORT_TEAM (team_id, team_name) VALUES
(1, 'Network Operations (NOC)'),
(2, 'Desktop & Workstation Support'),
(3, 'Cloud & Infrastructure Support'),
(4, 'Identity & Access Management')
ON DUPLICATE KEY UPDATE team_name=VALUES(team_name);

-- 5. TECHNICIANS
INSERT INTO TECHNICIAN (technician_id, user_id, team_id, specialization, availability_status) VALUES
(1, 2, 1, 'Network & VPN Security', 'Available'),
(2, 3, 2, 'Workstation Hardware & OS', 'Available')
ON DUPLICATE KEY UPDATE specialization=VALUES(specialization);

-- 6. INCIDENT CATEGORIES
INSERT INTO INCIDENT_CATEGORY (category_id, category_name) VALUES
(1, 'Hardware & Devices'),
(2, 'Software & Applications'),
(3, 'Network & Connectivity'),
(4, 'Access & Authentication'),
(5, 'Email & Collaboration')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 7. PRIORITIES
INSERT INTO PRIORITY (priority_id, priority_name) VALUES
(1, 'Low'),
(2, 'Medium'),
(3, 'High'),
(4, 'Critical')
ON DUPLICATE KEY UPDATE priority_name=VALUES(priority_name);

-- 8. INCIDENT STATUSES
INSERT INTO INCIDENT_STATUS (status_id, status_name) VALUES
(1, 'New'),
(2, 'Assigned'),
(3, 'In Progress'),
(4, 'Pending Customer'),
(5, 'Resolved'),
(6, 'Closed')
ON DUPLICATE KEY UPDATE status_name=VALUES(status_name);

-- 9. SLAS
INSERT INTO SLA (sla_id, sla_name) VALUES
(1, 'Standard Low SLA (72h)'),
(2, 'Business Medium SLA (24h)'),
(3, 'High Urgency SLA (8h)'),
(4, 'Mission-Critical P1 SLA (4h)')
ON DUPLICATE KEY UPDATE sla_name=VALUES(sla_name);

-- 10. INCIDENTS
INSERT INTO INCIDENT (incident_id, ticket_number, user_id, category_id, priority_id, status_id, subject, description, assigned_technician_id, created_at) VALUES
(1, 'INC-1001', 4, 3, 3, 3, 'Cannot connect to Corporate VPN from remote location', 'Receiving SSL handshake failure and packet timeout when connecting via Cisco AnyConnect.', 1, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 'INC-1002', 5, 1, 2, 2, 'External monitor flickering intermittently via USB-C hub', 'Second display blanks out for a few seconds every 10 minutes when docked to Dell XPS.', 2, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(3, 'INC-1003', 4, 2, 4, 5, 'Excel crashing when generating large pivot tables', 'Excel 365 crashes with error 0xc0000005 when recalculating Q3 financial forecasts.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'INC-1004', 5, 4, 1, 1, 'Password expired for corporate HR portal', 'Unable to login to Workday portal due to 90-day password expiration policy.', NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE))
ON DUPLICATE KEY UPDATE ticket_number=VALUES(ticket_number);

-- 11. INCIDENT HISTORIES
INSERT INTO INCIDENT_HISTORY (incident_id, old_status_id, new_status_id, changed_by, old_technician_id, new_technician_id, remarks, changed_at) VALUES
(1, 1, 2, 1, NULL, 1, 'Incident assigned to Alex Rivera', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 2, 3, 2, 1, 1, 'Investigating VPN gateway logs', DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(3, 3, 5, 2, 1, 1, 'Disabled offending Excel add-in and updated Office to current build', DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- 12. SLA TRACKING
INSERT INTO SLA_TRACKING (incident_id, sla_id, response_due_at, resolution_due_at, first_response_at, resolved_at, response_breached, resolution_breached) VALUES
(1, 3, DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL, FALSE, FALSE),
(2, 2, DATE_ADD(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 19 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), NULL, FALSE, FALSE),
(3, 4, DATE_SUB(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 16 HOUR), DATE_SUB(NOW(), INTERVAL 22 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), FALSE, FALSE),
(4, 1, DATE_ADD(NOW(), INTERVAL 23 HOUR), DATE_ADD(NOW(), INTERVAL 71 HOUR), NULL, NULL, FALSE, FALSE);

-- 13. RESOLUTIONS
INSERT INTO RESOLUTION (incident_id, technician_id, resolution_details, resolved_at) VALUES
(3, 1, 'Diagnosed crash to corrupted COM add-in in Excel. Removed obsolete plugin, cleared cache, and verified pivot table calculation successfully.', DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- 14. FEEDBACK
INSERT INTO FEEDBACK (incident_id, user_id, rating, comments, submitted_at) VALUES
(3, 4, 5, 'Alex quickly resolved the issue right before my board presentation. Outstanding support!', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- 15. ASSETS
INSERT INTO ASSET (asset_id, asset_tag, asset_name, asset_type, serial_number, assigned_user_id, department_id, purchase_date, asset_status) VALUES
(1, 'AST-2024-001', 'MacBook Pro 16" M3 Max', 'Laptop', 'C02G1234MD6R', 4, 2, '2024-01-15', 'Active'),
(2, 'AST-2024-002', 'Dell XPS 15 9530', 'Laptop', 'DLXPS-98711', 5, 3, '2024-02-10', 'Active'),
(3, 'AST-2023-088', 'Cisco Catalyst 9300 Switch', 'Network Switch', 'FCW2348A0BC', NULL, 1, '2023-06-20', 'Active'),
(4, 'AST-2024-042', 'HP LaserJet Enterprise MFP', 'Printer', 'HPLJ-44321', NULL, 2, '2023-08-12', 'Active');

-- 16. SERVICES
INSERT INTO SERVICE (service_id, service_name, description, team_id, service_status) VALUES
(1, 'Corporate Global VPN', 'Remote access secure tunnel for home and traveling employees', 1, 'Operational'),
(2, 'Microsoft 365 Suite', 'Cloud email, Teams, SharePoint, and Office desktop apps', 3, 'Operational'),
(3, 'SAP ERP Finance System', 'Enterprise accounting, invoicing, and ledger system', 3, 'Operational'),
(4, 'Workday HR Portal', 'Employee records, benefits, payroll, and PTO management', 4, 'Operational');

-- 17. PROBLEMS
INSERT INTO PROBLEM (problem_id, problem_title, description, root_cause, problem_status, created_at) VALUES
(1, 'East Coast VPN Gateway Handshake Drops', 'Multiple users on residential ISP connections experiencing MTU packet drops.', 'ISP fiber modem MTU mismatch exceeding 1400 bytes.', 'Open', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 18. ESCALATIONS
INSERT INTO ESCALATION (escalation_id, incident_id, escalated_by, escalation_level, reason, escalated_at, status) VALUES
(1, 1, 2, 2, 'Requires routing table adjustment on Cisco ASA edge firewall', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'In Progress');
