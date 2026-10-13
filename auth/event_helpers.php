<?php
function ensureUserQrCode(PDO $pdo, int $userId): string
{
    $insert = $pdo->prepare('INSERT IGNORE INTO user_qr_codes (user_id, qr_token) VALUES (?, ?)');
    $insert->execute([$userId, bin2hex(random_bytes(32))]);

    $query = $pdo->prepare('SELECT qr_token FROM user_qr_codes WHERE user_id = ?');
    $query->execute([$userId]);
    $token = $query->fetchColumn();
    if (!$token) {
        throw new RuntimeException('Unable to create the account QR code.');
    }

    return $token;
}

function seedEventAttendees(PDO $pdo, ?int $reservationId = null): void
{
    $sql = "SELECT r.id, r.target_course, r.target_department
            FROM reservations r
            WHERE r.status = 'approved' AND r.attendees_seeded = 0";
    $params = [];
    if ($reservationId !== null) {
        $sql .= ' AND r.id = ?';
        $params[] = $reservationId;
    }

    $events = $pdo->prepare($sql);
    $events->execute($params);
    foreach ($events->fetchAll(PDO::FETCH_ASSOC) as $event) {
        $course = $event['target_course'];
        $department = $event['target_department'];
        $students = $pdo->prepare("SELECT id FROM users WHERE role = 'student' AND status = 'active'
            AND (? IS NULL OR course = ?)
            AND (? IS NULL OR department = ?)");
        $students->execute([$course, $course, $department, $department]);
        foreach ($students->fetchAll(PDO::FETCH_COLUMN) as $studentId) {
            $token = bin2hex(random_bytes(32));
            $add = $pdo->prepare('INSERT IGNORE INTO event_attendees (reservation_id, user_id, qr_token) VALUES (?, ?, ?)');
            $add->execute([$event['id'], $studentId, $token]);
        }
        $markSeeded = $pdo->prepare('UPDATE reservations SET attendees_seeded = 1 WHERE id = ?');
        $markSeeded->execute([$event['id']]);
    }

    $pdo->exec("UPDATE event_attendees ea
        JOIN reservations r ON r.id = ea.reservation_id
        SET ea.attendance_status = 'absent'
        WHERE ea.attendance_status = 'registered'
          AND TIMESTAMP(r.date_of_use, r.time_end) < NOW()");
}

function eventRoleAllowed(PDO $pdo, int $reservationId, array $session): bool
{
    if (($session['role'] ?? '') === 'admin') return true;
    $stmt = $pdo->prepare("SELECT r.teacher_id
        FROM reservations r JOIN users host ON host.id = r.teacher_id
        WHERE r.id = ? AND host.status = 'active'");
    $stmt->execute([$reservationId]);
    $teacherId = $stmt->fetchColumn();
    if (($session['role'] ?? '') === 'teacher' && (int) $teacherId === (int) ($session['user_id'] ?? 0)) {
        return true;
    }

    $authorization = $pdo->prepare("SELECT 1 FROM event_scan_authorizations a
        JOIN users u ON u.id = a.user_id
        WHERE a.reservation_id = ? AND a.user_id = ? AND u.status = 'active' AND u.role IN ('student', 'teacher')");
    $authorization->execute([$reservationId, (int) ($session['user_id'] ?? 0)]);
    return (bool) $authorization->fetchColumn();
}

function eventHostIsTeacher(PDO $pdo, int $reservationId, int $userId): bool
{
    $stmt = $pdo->prepare('SELECT 1 FROM reservations WHERE id = ? AND teacher_id = ?');
    $stmt->execute([$reservationId, $userId]);
    return (bool) $stmt->fetchColumn();
}
