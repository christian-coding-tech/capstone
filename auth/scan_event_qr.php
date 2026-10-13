<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'] ?? '', ['teacher', 'student'], true) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$token = trim($_POST['token'] ?? '');
$eventId = filter_input(INPUT_POST, 'event_id', FILTER_VALIDATE_INT);
if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    echo json_encode(['success' => false, 'message' => 'Invalid QR code.']);
    exit;
}
if (!$eventId || !eventRoleAllowed($pdo, $eventId, $_SESSION)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You are not authorized to scan for this event.']);
    exit;
}

$stmt = $pdo->prepare("SELECT ea.id, ea.user_id AS attendee_user_id, ea.attendance_status, r.id AS event_id, r.event_name,
        r.date_of_use, r.time_start, r.time_end,
        u.full_name, u.user_id AS usn, u.section, u.course AS program, u.adviser, u.id_photo
    FROM event_attendees ea
    JOIN reservations r ON r.id = ea.reservation_id
    JOIN users u ON u.id = ea.user_id
    LEFT JOIN user_qr_codes q ON q.user_id = u.id
    WHERE ea.reservation_id = ? AND (ea.qr_token = ? OR q.qr_token = ?)
      AND u.status = 'active' AND u.role = 'student'
      AND r.status = 'approved'");
$stmt->execute([$eventId, $token, $token]);
$attendee = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$attendee) {
    echo json_encode(['success' => false, 'message' => 'This QR code is invalid or the student is not registered for this event.']);
    exit;
}

$now = new DateTimeImmutable();
$startsAt = new DateTimeImmutable($attendee['date_of_use'] . ' ' . $attendee['time_start']);
$endsAt = new DateTimeImmutable($attendee['date_of_use'] . ' ' . $attendee['time_end']);
$details = [
    'full_name' => $attendee['full_name'],
    'usn' => $attendee['usn'],
    'section' => $attendee['section'],
    'program' => $attendee['program'],
    'adviser' => $attendee['adviser'],
    'id_photo' => $attendee['id_photo'],
    'event_name' => $attendee['event_name'],
    'valid_from' => $startsAt->modify('-30 minutes')->format(DateTimeInterface::ATOM),
    'valid_until' => $endsAt->format(DateTimeInterface::ATOM),
];
if ((int) $attendee['attendee_user_id'] === (int) $_SESSION['user_id']) {
    echo json_encode(['success' => false, 'message' => 'You cannot scan your own attendance QR code.', 'details' => $details]);
    exit;
}
if ($now < $startsAt->modify('-30 minutes') || $now > $endsAt) {
    echo json_encode(['success' => false, 'message' => 'Attendance scanning is only available near the event time.', 'details' => $details]);
    exit;
}
if ($attendee['attendance_status'] === 'attended') {
    echo json_encode(['success' => false, 'message' => $attendee['full_name'] . ' has already checked in.', 'details' => $details]);
    exit;
}
if ($attendee['attendance_status'] === 'unavailable' || $attendee['attendance_status'] === 'absent') {
    echo json_encode(['success' => false, 'message' => 'This student is marked unable to attend or absent.', 'details' => $details]);
    exit;
}

$update = $pdo->prepare("UPDATE event_attendees SET attendance_status = 'attended', checked_in_at = NOW() WHERE id = ? AND attendance_status = 'registered'");
$update->execute([$attendee['id']]);
$success = $update->rowCount() === 1;
echo json_encode([
    'success' => $success,
    'message' => $success ? $attendee['full_name'] . ' checked in.' : 'Attendance was already recorded.',
    'details' => $details,
]);
