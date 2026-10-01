-- Run once on databases where db/event_attendance_migration.sql has already been applied.
-- Fresh imports from aclc_campus.sql already contain these fields; do not run this on fresh installs.
ALTER TABLE users
    ADD COLUMN department VARCHAR(100) DEFAULT NULL AFTER course;

ALTER TABLE reservations
    ADD COLUMN target_department VARCHAR(100) DEFAULT NULL AFTER target_course;

ALTER TABLE event_attendees
    ADD COLUMN invite_read TINYINT(1) NOT NULL DEFAULT 0 AFTER attendance_status,
    ADD COLUMN invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER invite_read;
