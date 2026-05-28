<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false]);
    exit;
}

$tab      = trim($_POST['tab'] ?? '');
$admin_id = $_SESSION['user_id'];

$allowed = ['pending', 'approved', 'rejected', 'feedback'];
if (!in_array($tab, $allowed)) {
    echo json_encode(['success' => false]);
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO admin_seen (admin_id, tab_name, last_seen)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE last_seen = NOW()
");
$stmt->execute([$admin_id, $tab]);

echo json_encode(['success' => true]);
exit;
?>