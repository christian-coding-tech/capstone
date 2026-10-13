<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

try {
    seedEventAttendees($pdo);
    $stmt = $pdo->prepare("SELECT r.id AS event_id, r.event_name, r.date_of_use, r.time_start, r.time_end,
            r.target_course, r.target_department, v.name AS venue_name, u.full_name AS host_name,
            COALESCE(ea.qr_token, q.qr_token) AS qr_token,
            COALESCE(ea.attendance_status, 'not_registered') AS attendance_status,
            ea.checked_in_at, (ea.id IS NOT NULL) AS is_attendee,
            student.full_name AS student_name, student.user_id AS student_usn,
            student.section, student.course AS program, student.adviser, student.id_photo,
            EXISTS (SELECT 1 FROM event_scan_authorizations a WHERE a.reservation_id = r.id AND a.user_id = ?) AS can_scan
        FROM reservations r
        JOIN venues v ON v.id = r.venue_id
        JOIN users u ON u.id = r.teacher_id
        JOIN user_qr_codes q ON q.user_id = ?
        LEFT JOIN event_attendees ea ON ea.reservation_id = r.id AND ea.user_id = ?
        LEFT JOIN users student ON student.id = ea.user_id
        WHERE r.status = 'approved'
          AND (ea.id IS NOT NULL OR EXISTS (
              SELECT 1 FROM event_scan_authorizations a WHERE a.reservation_id = r.id AND a.user_id = ?
          ))
        ORDER BY r.date_of_use DESC, r.time_start DESC");
    ensureUserQrCode($pdo, (int) $_SESSION['user_id']);
    $userId = (int) $_SESSION['user_id'];
    $stmt->execute([$userId, $userId, $userId, $userId]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $now = new DateTimeImmutable();

    foreach ($events as &$event) {
        $startsAt = new DateTimeImmutable($event['date_of_use'] . ' ' . $event['time_start']);
        $endsAt = new DateTimeImmutable($event['date_of_use'] . ' ' . $event['time_end']);
        if ($event['attendance_status'] === 'attended') {
            $event['history_state'] = 'attended';
        } elseif ($event['attendance_status'] === 'unavailable') {
            $event['history_state'] = 'unavailable';
        } elseif ($endsAt < $now) {
            $event['history_state'] = 'missed';
        } elseif ($startsAt <= $now) {
            $event['history_state'] = 'ongoing';
        } else {
            $event['history_state'] = 'upcoming';
        }
    }
    unset($event);

    echo json_encode(['success' => true, 'data' => $events]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to load event history. Apply the event attendance and QR authorization migrations first.']);
}
