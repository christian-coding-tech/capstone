<?php
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
    if (($session['role'] ?? '') !== 'teacher') return false;

    $stmt = $pdo->prepare('SELECT teacher_id FROM reservations WHERE id = ?');
    $stmt->execute([$reservationId]);
    return (int) $stmt->fetchColumn() === (int) ($session['user_id'] ?? 0);
}
