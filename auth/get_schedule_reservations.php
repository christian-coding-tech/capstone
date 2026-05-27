<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$month  = trim($_GET['month']  ?? date('m'));
$year   = trim($_GET['year']   ?? date('Y'));
$search = trim($_GET['search'] ?? '');
$day    = trim($_GET['day']    ?? '');

$query = "
    SELECT r.*, v.name AS venue_name, u.full_name AS teacher_name
    FROM reservations r
    JOIN venues v ON r.venue_id = v.id
    JOIN users u ON r.teacher_id = u.id
    WHERE r.status = 'approved'
";
$params = [];

if ($day) {
    $query   .= " AND r.date_of_use = ?";
    $params[] = "$year-$month-$day";
} else {
    $query   .= " AND MONTH(r.date_of_use) = ? AND YEAR(r.date_of_use) = ?";
    $params[] = $month;
    $params[] = $year;
}

if ($search) {
    $query   .= " AND (u.full_name LIKE ? OR v.name LIKE ? OR r.event_name LIKE ?)";
    $s        = "%$search%";
    $params[] = $s;
    $params[] = $s;
    $params[] = $s;
}

$query .= " ORDER BY r.date_of_use ASC, r.time_start ASC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'data' => $reservations]);
exit;
?>