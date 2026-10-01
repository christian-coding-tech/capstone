<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student' || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$eventId = filter_input(INPUT_POST, 'event_id', FILTER_VALIDATE_INT);
$action = $_POST['action'] ?? '';
if (!$eventId || !in_array($action, ['register', 'unavailable'], true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid attendance request.']);
    exit;
}

try {
    seedEventAttendees($pdo, $eventId);
    $stmt = $pdo->prepare("SELECT ea.attendance_status, r.date_of_use, r.time_start, r.time_end, r.status AS event_status
        FROM event_attendees ea JOIN reservations r ON r.id = ea.reservation_id
        WHERE ea.reservation_id = ? AND ea.user_id = ?");
    $stmt->execute([$eventId, $_SESSION['user_id']]);
    $attendee = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$attendee || $attendee['event_status'] !== 'approved' || $attendee['attendance_status'] === 'attended') {
        echo json_encode(['success' => false, 'message' => 'This event is not available for RSVP changes.']);
        exit;
    }

    $startsAt = new DateTimeImmutable($attendee['date_of_use'] . ' ' . $attendee['time_start']);
    $endsAt = new DateTimeImmutable($attendee['date_of_use'] . ' ' . $attendee['time_end']);
    $now = new DateTimeImmutable();
    if ($now < $startsAt || $now > $endsAt) {
        echo json_encode(['success' => false, 'message' => 'RSVP changes are only available before or during the event.']);
        exit;
    }

    $newStatus = $action === 'unavailable' ? 'unavailable' : 'registered';
    $update = $pdo->prepare('UPDATE event_attendees SET attendance_status = ? WHERE reservation_id = ? AND user_id = ?');
    $update->execute([$newStatus, $eventId, $_SESSION['user_id']]);
    echo json_encode(['success' => true, 'message' => $newStatus === 'unavailable' ? 'Marked as unable to attend.' : 'You are registered for this event.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to update attendance. Run the event attendance database migration first.']);
}
