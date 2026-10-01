-- Run once against the existing ACLC campus database before deploying event features.
ALTER TABLE users
    ADD COLUMN course VARCHAR(100) DEFAULT NULL AFTER email,
    ADD COLUMN department VARCHAR(100) DEFAULT NULL AFTER course;

ALTER TABLE reservations
    ADD COLUMN target_course VARCHAR(100) DEFAULT NULL AFTER event_name,
    ADD COLUMN target_department VARCHAR(100) DEFAULT NULL AFTER target_course,
    ADD COLUMN attendees_seeded TINYINT(1) NOT NULL DEFAULT 0 AFTER target_department;

CREATE TABLE event_attendees (
    id INT NOT NULL AUTO_INCREMENT,
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    qr_token CHAR(64) NOT NULL,
    attendance_status ENUM('registered','attended','absent','unavailable') NOT NULL DEFAULT 'registered',
    invite_read TINYINT(1) NOT NULL DEFAULT 0,
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checked_in_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_event_attendee (reservation_id, user_id),
    UNIQUE KEY unique_qr_token (qr_token),
    KEY attendee_user (user_id),
    CONSTRAINT event_attendees_reservation_fk FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE,
    CONSTRAINT event_attendees_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
