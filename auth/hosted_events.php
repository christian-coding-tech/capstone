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

try {
    seedEventAttendees($pdo);
        $sql = "SELECT r.id AS event_id, r.event_name, r.date_of_use, r.time_start, r.time_end,
            r.status, r.rejection_reason,
            r.target_course, r.target_department, v.name AS venue_name, u.full_name AS host_name,
            COUNT(ea.id) AS attendee_count,
            SUM(ea.attendance_status = 'attended') AS attended_count,
            SUM(ea.attendance_status = 'registered') AS registered_count,
            SUM(ea.attendance_status = 'absent') AS absent_count,
            SUM(ea.attendance_status = 'unavailable') AS unavailable_count,
            SUM(ea.attendance_status = 'registered') AS not_checked_in_count
        FROM reservations r
        JOIN venues v ON v.id = r.venue_id
        JOIN users u ON u.id = r.teacher_id
        LEFT JOIN event_attendees ea ON ea.reservation_id = r.id
        WHERE r.status IN ('approved', 'rejected')";
    $params = [];
    if ($_SESSION['role'] === 'teacher') {
        $sql .= ' AND r.teacher_id = ?';
        $params[] = $_SESSION['user_id'];
    }
    $sql .= ' GROUP BY r.id ORDER BY r.date_of_use DESC, r.time_start DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to load events. Run the event attendance database migration first.']);
}
