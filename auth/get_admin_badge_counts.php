<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$stmt = $pdo->query("
    SELECT status, COUNT(*) as count
    FROM reservations
    WHERE status = 'pending'
");

$pending = $pdo->query("
    SELECT COUNT(*) as count FROM reservations WHERE status = 'pending'
")->fetch(PDO::FETCH_ASSOC)['count'];

$approved = $pdo->query("
    SELECT COUNT(*) as count FROM reservations WHERE status = 'approved'
")->fetch(PDO::FETCH_ASSOC)['count'];

$rejected = $pdo->query("
    SELECT COUNT(*) as count FROM reservations WHERE status = 'rejected'
")->fetch(PDO::FETCH_ASSOC)['count'];

$feedback = $pdo->query("
    SELECT COUNT(*) as count FROM feedback
")->fetch(PDO::FETCH_ASSOC)['count'];

echo json_encode([
    'success'  => true,
    'counts'   => [
        'pending'  => (int)$pending,
        'approved' => (int)$approved,
        'rejected' => (int)$rejected,
        'feedback' => (int)$feedback,
    ]
]);
exit;
?>