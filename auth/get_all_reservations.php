<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$status    = trim($_GET['status']    ?? 'pending');
$date_from = trim($_GET['date_from'] ?? '');
$date_to   = trim($_GET['date_to']   ?? '');
$search    = trim($_GET['search']    ?? '');

$allowed = ['pending', 'approved', 'rejected'];
if (!in_array($status, $allowed)) $status = 'pending';

$query = "
    SELECT r.*, v.name AS venue_name, u.full_name AS teacher_name,
           a.full_name AS approved_by_name
    FROM reservations r
    JOIN venues v ON r.venue_id = v.id
    JOIN users u ON r.teacher_id = u.id
    LEFT JOIN users a ON r.approved_by = a.id
    WHERE r.status = ?
";
$params = [$status];

if ($date_from) { $query .= " AND r.date_of_use >= ?"; $params[] = $date_from; }
if ($date_to)   { $query .= " AND r.date_of_use <= ?"; $params[] = $date_to; }
if ($search)    {
    $query .= " AND (u.full_name LIKE ? OR v.name LIKE ? OR r.event_name LIKE ?)";
    $s = "%$search%";
    $params[] = $s; $params[] = $s; $params[] = $s;
}

$query .= " ORDER BY r.created_at DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);

echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
exit;
?>