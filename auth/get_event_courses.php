<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'teacher'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$stmt = $pdo->query("SELECT DISTINCT course FROM users WHERE role = 'student' AND status = 'active' AND course IS NOT NULL AND course <> '' ORDER BY course");
echo json_encode(['success' => true, 'courses' => $stmt->fetchAll(PDO::FETCH_COLUMN)]);
