<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'teacher'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$stmt = $pdo->query("SELECT DISTINCT department FROM users WHERE role = 'student' AND status = 'active' AND department IS NOT NULL AND department <> '' ORDER BY department");
echo json_encode(['success' => true, 'departments' => $stmt->fetchAll(PDO::FETCH_COLUMN)]);
