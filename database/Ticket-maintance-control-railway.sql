USE railway;

-- 1. USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
);

-- 2. TICKET STATUSES
CREATE TABLE ticket_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

-- 3. PRIORITIES
CREATE TABLE priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

-- 4. CATEGORIES
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

-- 5. TICKETS
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status_id INT NOT NULL,
    priority_id INT NOT NULL,
    category_id INT NOT NULL,
    created_by INT NOT NULL,
    assigned_to INT NULL,
    assigned_at DATETIME NULL,
    resolution TEXT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_tickets_status FOREIGN KEY (status_id) REFERENCES ticket_statuses(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tickets_priority FOREIGN KEY (priority_id) REFERENCES priorities(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tickets_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tickets_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_tickets_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_tickets_status (status_id),
    INDEX idx_tickets_priority (priority_id),
    INDEX idx_tickets_category (category_id),
    INDEX idx_tickets_created_by (created_by),
    INDEX idx_tickets_assigned_to (assigned_to),
    INDEX idx_tickets_created_at (created_at)
);

-- 6. STATUS TRANSITIONS
CREATE TABLE status_transitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_status_id INT NOT NULL,
    to_status_id INT NOT NULL,
    CONSTRAINT uq_status_transition UNIQUE (from_status_id, to_status_id),
    CONSTRAINT fk_transition_from_status FOREIGN KEY (from_status_id) REFERENCES ticket_statuses(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_transition_to_status FOREIGN KEY (to_status_id) REFERENCES ticket_statuses(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- 7. TICKET HISTORY
CREATE TABLE ticket_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    from_status_id INT NULL,
    to_status_id INT NULL,
    comment TEXT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_history_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_history_from_status FOREIGN KEY (from_status_id) REFERENCES ticket_statuses(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_history_to_status FOREIGN KEY (to_status_id) REFERENCES ticket_statuses(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    INDEX idx_history_ticket (ticket_id),
    INDEX idx_history_user (user_id),
    INDEX idx_history_event_type (event_type),
    INDEX idx_history_created_at (created_at)
);

-- SEED DATA

INSERT INTO users (id, name, email, password_hash, role, is_active, created_at) VALUES
    (1, 'Demo User', 'demo.user@example.com', 'PBKDF2-SHA256$100000$WTcVDUtTVZyggxW3+FAhxw==$7oz0rzAdXha7F+5E9kSfUU8COgL/Fwai7pJnGXbehcM=', 'USER', TRUE, NOW()),
    (2, 'Demo Operator', 'demo.operator@example.com', 'PBKDF2-SHA256$100000$WTcVDUtTVZyggxW3+FAhxw==$7oz0rzAdXha7F+5E9kSfUU8COgL/Fwai7pJnGXbehcM=', 'OPERATOR', TRUE, NOW());

INSERT INTO ticket_statuses (code, name) VALUES
    ('PENDING', 'Pending'),
    ('IN_PROGRESS', 'In Progress'),
    ('DIAGNOSED', 'Diagnosed'),
    ('RESOLVED', 'Resolved'),
    ('CANCELLED', 'Cancelled');

INSERT INTO priorities (code, name) VALUES
    ('LOW', 'Low'),
    ('MEDIUM', 'Medium'),
    ('HIGH', 'High'),
    ('CRITICAL', 'Critical');

INSERT INTO categories (code, name) VALUES
    ('HARDWARE', 'Hardware'),
    ('SOFTWARE', 'Software'),
    ('NETWORK', 'Network'),
    ('POWER', 'Power'),
    ('OTHER', 'Other');

INSERT INTO status_transitions (from_status_id, to_status_id) VALUES
    ((SELECT id FROM ticket_statuses WHERE code = 'PENDING'), (SELECT id FROM ticket_statuses WHERE code = 'IN_PROGRESS')),
    ((SELECT id FROM ticket_statuses WHERE code = 'PENDING'), (SELECT id FROM ticket_statuses WHERE code = 'CANCELLED')),
    ((SELECT id FROM ticket_statuses WHERE code = 'IN_PROGRESS'), (SELECT id FROM ticket_statuses WHERE code = 'DIAGNOSED')),
    ((SELECT id FROM ticket_statuses WHERE code = 'IN_PROGRESS'), (SELECT id FROM ticket_statuses WHERE code = 'CANCELLED')),
    ((SELECT id FROM ticket_statuses WHERE code = 'DIAGNOSED'), (SELECT id FROM ticket_statuses WHERE code = 'RESOLVED')),
    ((SELECT id FROM ticket_statuses WHERE code = 'RESOLVED'), (SELECT id FROM ticket_statuses WHERE code = 'IN_PROGRESS'));

-- STORED PROCEDURES
DELIMITER $$

CREATE PROCEDURE create_ticket (
    IN p_title VARCHAR(150),
    IN p_description TEXT,
    IN p_priority_id INT,
    IN p_category_id INT,
    IN p_created_by INT,
    IN p_created_at DATETIME
)
BEGIN
    DECLARE v_ticket_id INT;
    DECLARE v_pending_status_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    SELECT id INTO v_pending_status_id FROM ticket_statuses WHERE code = 'PENDING';

    INSERT INTO tickets (ticket_number, title, description, status_id, priority_id, category_id, created_by, assigned_to, assigned_at, resolution, created_at, updated_at, resolved_at)
    VALUES (NULL, p_title, p_description, v_pending_status_id, p_priority_id, p_category_id, p_created_by, NULL, NULL, NULL, p_created_at, p_created_at, NULL);
    
    SET v_ticket_id = LAST_INSERT_ID();

    UPDATE tickets SET ticket_number = CONCAT('TCK-', LPAD(v_ticket_id, 6, '0')) WHERE id = v_ticket_id;

    INSERT INTO ticket_history (ticket_id, user_id, event_type, from_status_id, to_status_id, comment, created_at)
    VALUES (v_ticket_id, p_created_by, 'CREATED', NULL, v_pending_status_id, NULL, p_created_at);

    COMMIT;
    
    SELECT id, ticket_number, title, description, status_id, priority_id, category_id, created_by, assigned_to, created_at FROM tickets WHERE id = v_ticket_id;
END$$

CREATE PROCEDURE assign_ticket (
    IN p_ticket_id INT,
    IN p_operator_id INT,
    IN p_actor_id INT,
    IN p_assigned_at DATETIME
)
BEGIN
    DECLARE v_current_status_id INT;
    DECLARE v_operator_role VARCHAR(20);
    DECLARE v_operator_active BOOLEAN;
    DECLARE v_current_assigned_to INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status_id, assigned_to INTO v_current_status_id, v_current_assigned_to FROM tickets WHERE id = p_ticket_id FOR UPDATE;
    IF v_current_status_id IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ticket does not exist'; END IF;

    SELECT role, is_active INTO v_operator_role, v_operator_active FROM users WHERE id = p_operator_id;
    IF v_operator_role IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Operator does not exist'; END IF;
    IF v_operator_role <> 'OPERATOR' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Selected user is not an operator'; END IF;
    IF v_operator_active = FALSE THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Operator is inactive'; END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_actor_id AND role = 'OPERATOR' AND is_active = TRUE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Actor is not an active operator';
    END IF;

    IF v_current_assigned_to IS NOT NULL AND v_current_assigned_to <> p_operator_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ticket is already assigned to another operator';
    END IF;

    UPDATE tickets SET assigned_to = p_operator_id, assigned_at = p_assigned_at, updated_at = p_assigned_at WHERE id = p_ticket_id;

    INSERT INTO ticket_history (ticket_id, user_id, event_type, from_status_id, to_status_id, comment, created_at)
    VALUES (p_ticket_id, p_actor_id, 'ASSIGNED', NULL, NULL, CONCAT('Ticket assigned to operator ID ', p_operator_id), p_assigned_at);

    COMMIT;
END$$

CREATE PROCEDURE transition_ticket (
    IN p_ticket_id INT,
    IN p_target_status_id INT,
    IN p_actor_id INT,
    IN p_comment TEXT,
    IN p_resolution TEXT,
    IN p_transition_at DATETIME
)
BEGIN
    DECLARE v_current_status_id INT;
    DECLARE v_assigned_to INT;
    DECLARE v_actor_role VARCHAR(20);
    DECLARE v_transition_exists INT DEFAULT 0;
    DECLARE v_target_code VARCHAR(30);
    DECLARE v_current_code VARCHAR(30);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT status_id, assigned_to INTO v_current_status_id, v_assigned_to FROM tickets WHERE id = p_ticket_id FOR UPDATE;
    IF v_current_status_id IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ticket does not exist'; END IF;

    SELECT role INTO v_actor_role FROM users WHERE id = p_actor_id AND is_active = TRUE;
    IF v_actor_role IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Actor does not exist or is inactive'; END IF;

    SELECT code INTO v_current_code FROM ticket_statuses WHERE id = v_current_status_id;
    SELECT code INTO v_target_code FROM ticket_statuses WHERE id = p_target_status_id;
    IF v_target_code IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Target status does not exist'; END IF;

    SELECT COUNT(*) INTO v_transition_exists FROM status_transitions WHERE from_status_id = v_current_status_id AND to_status_id = p_target_status_id;
    IF v_transition_exists = 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid state transition'; END IF;

    IF v_current_code = 'PENDING' AND v_target_code = 'IN_PROGRESS' THEN
        IF v_assigned_to IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'An operator must be assigned before starting the ticket'; END IF;
    END IF;

    IF v_target_code = 'CANCELLED' THEN
        IF p_comment IS NULL OR TRIM(p_comment) = '' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cancellation reason is required'; END IF;
    END IF;

    IF v_current_code = 'DIAGNOSED' AND v_target_code = 'RESOLVED' THEN
        IF p_resolution IS NULL OR TRIM(p_resolution) = '' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Resolution is required'; END IF;
    END IF;

    IF v_current_code = 'RESOLVED' AND v_target_code = 'IN_PROGRESS' THEN
        IF p_comment IS NULL OR TRIM(p_comment) = '' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reopening comment is required'; END IF;
    END IF;

    UPDATE tickets SET
        status_id = p_target_status_id,
        resolution = CASE WHEN v_target_code = 'RESOLVED' THEN p_resolution WHEN v_target_code = 'IN_PROGRESS' AND v_current_code = 'RESOLVED' THEN NULL ELSE resolution END,
        resolved_at = CASE WHEN v_target_code = 'RESOLVED' THEN p_transition_at WHEN v_current_code = 'RESOLVED' AND v_target_code = 'IN_PROGRESS' THEN NULL ELSE resolved_at END,
        updated_at = p_transition_at
    WHERE id = p_ticket_id;

    INSERT INTO ticket_history (ticket_id, user_id, event_type, from_status_id, to_status_id, comment, created_at)
    VALUES (
        p_ticket_id, p_actor_id,
        CASE WHEN v_target_code = 'CANCELLED' THEN 'CANCELLED' WHEN v_current_code = 'RESOLVED' AND v_target_code = 'IN_PROGRESS' THEN 'REOPENED' WHEN v_target_code = 'RESOLVED' THEN 'RESOLVED' ELSE 'STATUS_CHANGED' END,
        v_current_status_id, p_target_status_id,
        CASE WHEN v_target_code = 'RESOLVED' THEN p_resolution ELSE p_comment END,
        p_transition_at
    );

    COMMIT;
END$$
DELIMITER ;
