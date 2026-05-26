<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$teacher_id = $_SESSION['user_id'];
$status     = trim($_GET['status']     ?? 'pending');
$date_from  = trim($_GET['date_from']  ?? '');
$date_to    = trim($_GET['date_to']    ?? '');

$allowed = ['pending', 'approved', 'rejected'];
if (!in_array($status, $allowed)) $status = 'pending';

$query  = "
    SELECT r.*, v.name AS venue_name
    FROM reservations r
    JOIN venues v ON r.venue_id = v.id
    WHERE r.teacher_id = ? AND r.status = ?
";
$params = [$teacher_id, $status];

if ($date_from) {
    $query   .= " AND r.date_of_use >= ?";
    $params[] = $date_from;
}

if ($date_to) {
    $query   .= " AND r.date_of_use <= ?";
    $params[] = $date_to;
}

$query .= " ORDER BY r.created_at DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'data' => $reservations]);
exit;
?>