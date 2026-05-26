<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$teacher_id = $_SESSION['user_id'];

$stmt = $pdo->prepare("
    SELECT status, COUNT(*) as count
    FROM reservations
    WHERE teacher_id = ? AND is_read = 0
    GROUP BY status
");
$stmt->execute([$teacher_id]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$counts = ['pending' => 0, 'approved' => 0, 'rejected' => 0];
foreach ($rows as $row) {
    $counts[$row['status']] = (int)$row['count'];
}

echo json_encode(['success' => true, 'counts' => $counts]);
exit;
?>