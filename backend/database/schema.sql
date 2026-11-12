-- =====================================================================
-- IT Helpdesk & Incident Management System - Relational Database Schema
-- Database: helpdesk_db
-- =====================================================================

CREATE DATABASE IF NOT EXISTS helpdesk_db;
USE helpdesk_db;

-- 1. ROLE Entity
CREATE TABLE IF NOT EXISTS ROLE (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. DEPARTMENT Entity
CREATE TABLE IF NOT EXISTS DEPARTMENT (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. USER Entity
CREATE TABLE IF NOT EXISTS USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(50),
    department_id INT,
    role_id INT NOT NULL DEFAULT 1,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(department_id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES ROLE(role_id) ON DELETE RESTRICT
);

-- 4. SUPPORT_TEAM Entity
CREATE TABLE IF NOT EXISTS SUPPORT_TEAM (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE
);

-- 5. TECHNICIAN Entity
CREATE TABLE IF NOT EXISTS TECHNICIAN (
    technician_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    team_id INT,
    specialization VARCHAR(150),
    availability_status VARCHAR(50) DEFAULT 'Available',
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES SUPPORT_TEAM(team_id) ON DELETE SET NULL
);

-- 6. INCIDENT_CATEGORY Entity
CREATE TABLE IF NOT EXISTS INCIDENT_CATEGORY (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- 7. PRIORITY Entity
CREATE TABLE IF NOT EXISTS PRIORITY (
    priority_id INT AUTO_INCREMENT PRIMARY KEY,
    priority_name VARCHAR(50) NOT NULL UNIQUE
);

-- 8. INCIDENT_STATUS Entity
CREATE TABLE IF NOT EXISTS INCIDENT_STATUS (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE
);

-- 9. INCIDENT Entity
CREATE TABLE IF NOT EXISTS INCIDENT (
    incident_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    priority_id INT NOT NULL,
    status_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_technician_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES INCIDENT_CATEGORY(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (priority_id) REFERENCES PRIORITY(priority_id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES INCIDENT_STATUS(status_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_technician_id) REFERENCES TECHNICIAN(technician_id) ON DELETE SET NULL
);

-- 10. INCIDENT_HISTORY Entity
CREATE TABLE IF NOT EXISTS INCIDENT_HISTORY (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    old_status_id INT,
    new_status_id INT NOT NULL,
    changed_by INT NOT NULL,
    old_technician_id INT,
    new_technician_id INT,
    remarks TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES INCIDENT(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (old_status_id) REFERENCES INCIDENT_STATUS(status_id) ON DELETE SET NULL,
    FOREIGN KEY (new_status_id) REFERENCES INCIDENT_STATUS(status_id) ON DELETE RESTRICT,
    FOREIGN KEY (changed_by) REFERENCES USER(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (old_technician_id) REFERENCES TECHNICIAN(technician_id) ON DELETE SET NULL,
    FOREIGN KEY (new_technician_id) REFERENCES TECHNICIAN(technician_id) ON DELETE SET NULL
);

-- 11. SLA Entity
CREATE TABLE IF NOT EXISTS SLA (
    sla_id INT AUTO_INCREMENT PRIMARY KEY,
    sla_name VARCHAR(100) NOT NULL UNIQUE
);

-- 12. SLA_TRACKING Entity
CREATE TABLE IF NOT EXISTS SLA_TRACKING (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    sla_id INT NOT NULL,
    response_due_at DATETIME,
    resolution_due_at DATETIME,
    first_response_at DATETIME,
    resolved_at DATETIME,
    response_breached BOOLEAN DEFAULT FALSE,
    resolution_breached BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (incident_id) REFERENCES INCIDENT(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (sla_id) REFERENCES SLA(sla_id) ON DELETE RESTRICT
);

-- 13. RESOLUTION Entity
CREATE TABLE IF NOT EXISTS RESOLUTION (
    resolution_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL UNIQUE,
    technician_id INT NOT NULL,
    resolution_details TEXT NOT NULL,
    resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES INCIDENT(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES TECHNICIAN(technician_id) ON DELETE RESTRICT
);

-- 14. FEEDBACK Entity
CREATE TABLE IF NOT EXISTS FEEDBACK (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES INCIDENT(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE RESTRICT
);

-- 15. ASSET Entity
CREATE TABLE IF NOT EXISTS ASSET (
    asset_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    asset_name VARCHAR(150) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100),
    assigned_user_id INT,
    department_id INT,
    purchase_date DATE,
    asset_status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (assigned_user_id) REFERENCES USER(user_id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES DEPARTMENT(department_id) ON DELETE SET NULL
);

-- 16. SERVICE Entity
CREATE TABLE IF NOT EXISTS SERVICE (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    team_id INT,
    service_status VARCHAR(50) DEFAULT 'Operational',
    FOREIGN KEY (team_id) REFERENCES SUPPORT_TEAM(team_id) ON DELETE SET NULL
);

-- 17. PROBLEM Entity
CREATE TABLE IF NOT EXISTS PROBLEM (
    problem_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_title VARCHAR(255) NOT NULL,
    description TEXT,
    root_cause TEXT,
    problem_status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. ESCALATION Entity
CREATE TABLE IF NOT EXISTS ESCALATION (
    escalation_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    escalated_by INT NOT NULL,
    escalation_level INT NOT NULL,
    reason TEXT NOT NULL,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (incident_id) REFERENCES INCIDENT(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (escalated_by) REFERENCES USER(user_id) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE INDEX idx_incidents_status ON INCIDENT(status_id);
CREATE INDEX idx_incidents_priority ON INCIDENT(priority_id);
CREATE INDEX idx_incidents_user ON INCIDENT(user_id);
CREATE INDEX idx_incidents_technician ON INCIDENT(assigned_technician_id);
