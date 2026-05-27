<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$reservation_id   = trim($_POST['reservation_id']   ?? '');
$action           = trim($_POST['action']           ?? '');
$rejection_reason = trim($_POST['rejection_reason'] ?? '');
$admin_id         = $_SESSION['user_id'];

if (!$reservation_id || !in_array($action, ['approved', 'rejected'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit;
}

if ($action === 'rejected' && !$rejection_reason) {
    echo json_encode(['success' => false, 'message' => 'Please provide a reason for rejection.']);
    exit;
}

if ($action === 'approved') {
    $stmt = $pdo->prepare("
        UPDATE reservations
        SET status = 'approved',
            rejection_reason = NULL,
            is_read = 0,
            approved_by = ?,
            approved_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$admin_id, $reservation_id]);
} else {
    $stmt = $pdo->prepare("
        UPDATE reservations
        SET status = 'rejected',
            rejection_reason = ?,
            is_read = 0,
            approved_by = NULL,
            approved_at = NULL
        WHERE id = ?
    ");
    $stmt->execute([$rejection_reason, $reservation_id]);
}

echo json_encode(['success' => true, 'message' => 'Reservation ' . $action . ' successfully.']);
exit;
?>