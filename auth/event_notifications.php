<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'] ?? '', ['student', 'teacher', 'admin'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Sign in to view account notifications.']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $markRead = $pdo->prepare('UPDATE event_attendees SET invite_read = 1 WHERE user_id = ? AND invite_read = 0');
        $markRead->execute([$_SESSION['user_id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Invalid request.']);
        exit;
    }

    if ($_SESSION['role'] === 'student') {
        seedEventAttendees($pdo);
    }
    $stmt = $pdo->prepare("SELECT ea.reservation_id AS event_id, ea.invite_read, ea.invited_at,
            r.event_name, r.date_of_use, r.time_start, r.time_end,
            v.name AS venue_name, host.full_name AS host_name
        FROM event_attendees ea
        JOIN reservations r ON r.id = ea.reservation_id
        JOIN venues v ON v.id = r.venue_id
        JOIN users host ON host.id = r.teacher_id
        WHERE ea.user_id = ? AND r.status = 'approved'
          AND TIMESTAMP(r.date_of_use, r.time_end) >= NOW()
        ORDER BY ea.invited_at DESC, r.date_of_use, r.time_start
        LIMIT 30");
    $stmt->execute([$_SESSION['user_id']]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $unread = 0;
    foreach ($notifications as $notification) {
        if (!(int) $notification['invite_read']) $unread++;
    }
    echo json_encode(['success' => true, 'unread' => $unread, 'data' => $notifications]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Notifications are temporarily unavailable. Apply the department and notifications database migration.']);
}
