<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$date_from = trim($_GET['date_from'] ?? '');
$date_to   = trim($_GET['date_to']   ?? '');

$query = "
    SELECT u.full_name, u.user_id, u.email, u.status,
           l.action, l.timestamp
    FROM login_logs l
    JOIN users u ON l.user_id = u.id
    WHERE u.role = 'student'
";
$params = [];

if ($date_from) {
    $query   .= " AND DATE(l.timestamp) >= ?";
    $params[] = $date_from;
}
if ($date_to) {
    $query   .= " AND DATE(l.timestamp) <= ?";
    $params[] = $date_to;
}

$query .= " ORDER BY l.timestamp DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'data' => $logs]);
exit;
?>