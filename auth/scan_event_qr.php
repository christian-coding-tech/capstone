<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'teacher'], true) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$token = trim($_POST['token'] ?? '');
if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    echo json_encode(['success' => false, 'message' => 'Invalid QR code.']);
    exit;
}

$stmt = $pdo->prepare("SELECT ea.id, ea.attendance_status, r.id AS event_id, r.teacher_id,
        r.date_of_use, r.time_start, r.time_end, u.full_name
    FROM event_attendees ea
    JOIN reservations r ON r.id = ea.reservation_id
    JOIN users u ON u.id = ea.user_id
    WHERE ea.qr_token = ? AND r.status = 'approved'");
$stmt->execute([$token]);
$attendee = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$attendee || !eventRoleAllowed($pdo, (int) $attendee['event_id'], $_SESSION)) {
    echo json_encode(['success' => false, 'message' => 'QR code is invalid or does not belong to an event you host.']);
    exit;
}

$now = new DateTimeImmutable();
$startsAt = new DateTimeImmutable($attendee['date_of_use'] . ' ' . $attendee['time_start']);
$endsAt = new DateTimeImmutable($attendee['date_of_use'] . ' ' . $attendee['time_end']);
if ($now < $startsAt->modify('-30 minutes') || $now > $endsAt) {
    echo json_encode(['success' => false, 'message' => 'Attendance scanning is only available near the event time.']);
    exit;
}
if ($attendee['attendance_status'] === 'attended') {
    echo json_encode(['success' => false, 'message' => $attendee['full_name'] . ' has already checked in.']);
    exit;
}
if ($attendee['attendance_status'] === 'unavailable' || $attendee['attendance_status'] === 'absent') {
    echo json_encode(['success' => false, 'message' => 'This student is marked unable to attend or absent.']);
    exit;
}

$update = $pdo->prepare("UPDATE event_attendees SET attendance_status = 'attended', checked_in_at = NOW() WHERE id = ? AND attendance_status = 'registered'");
$update->execute([$attendee['id']]);
echo json_encode(['success' => $update->rowCount() === 1, 'message' => $update->rowCount() === 1 ? $attendee['full_name'] . ' checked in.' : 'Attendance was already recorded.']);
