<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'teacher'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$eventId = filter_input(INPUT_GET, 'event_id', FILTER_VALIDATE_INT);
if (!$eventId || !eventRoleAllowed($pdo, $eventId, $_SESSION)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You cannot view this event roster.']);
    exit;
}

try {
    seedEventAttendees($pdo, $eventId);
    $stmt = $pdo->prepare("SELECT ea.user_id, ea.attendance_status, ea.checked_in_at,
            u.full_name, u.user_id AS school_id, u.course, u.department
        FROM event_attendees ea JOIN users u ON u.id = ea.user_id
        WHERE ea.reservation_id = ? ORDER BY u.course, u.full_name");
    $stmt->execute([$eventId]);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to load attendance list.']);
}
