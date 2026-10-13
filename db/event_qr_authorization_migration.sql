-- Run once on databases that already have event attendance enabled.
ALTER TABLE users
    ADD COLUMN section VARCHAR(100) DEFAULT NULL AFTER course,
    ADD COLUMN adviser VARCHAR(100) DEFAULT NULL AFTER section,
    ADD COLUMN id_photo VARCHAR(255) DEFAULT NULL AFTER adviser;

CREATE TABLE user_qr_codes (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    qr_token CHAR(64) NOT NULL,
    image_data MEDIUMTEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_qr (user_id),
    UNIQUE KEY unique_user_qr_token (qr_token),
    CONSTRAINT user_qr_codes_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE event_scan_authorizations (
    reservation_id INT NOT NULL,
    user_id INT NOT NULL,
    granted_by INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reservation_id, user_id),
    KEY scan_authorization_user (user_id),
    CONSTRAINT scan_authorization_event_fk FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE,
    CONSTRAINT scan_authorization_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT scan_authorization_granter_fk FOREIGN KEY (granted_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
