<?php
require_once '../db/connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$message = trim($_POST['message'] ?? '');

if (!$message) {
    echo json_encode(['success' => false, 'message' => 'Message cannot be empty.']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)");
$stmt->execute([$name ?: null, $email ?: null, $message]);

echo json_encode(['success' => true]);
exit;
?>