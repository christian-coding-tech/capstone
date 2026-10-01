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
            ea.qr_token, ea.attendance_status, ea.checked_in_at
        FROM event_attendees ea
        JOIN reservations r ON r.id = ea.reservation_id
        JOIN venues v ON v.id = r.venue_id
        JOIN users u ON u.id = r.teacher_id
        WHERE ea.user_id = ? AND r.status = 'approved'
        ORDER BY r.date_of_use DESC, r.time_start DESC");
    $stmt->execute([$_SESSION['user_id']]);
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
    echo json_encode(['success' => false, 'message' => 'Unable to load event history. Run the event attendance database migration first.']);
}
