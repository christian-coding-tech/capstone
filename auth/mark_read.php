<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$teacher_id = $_SESSION['user_id'];
$status     = trim($_POST['status'] ?? '');

$allowed = ['pending', 'approved', 'rejected'];
if (!in_array($status, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status.']);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE reservations SET is_read = 1
    WHERE teacher_id = ? AND status = ? AND is_read = 0
");
$stmt->execute([$teacher_id, $status]);

echo json_encode(['success' => true]);
exit;
?>