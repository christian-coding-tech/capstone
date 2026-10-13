<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'student') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only student accounts have a personal ID QR code.']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $token = ensureUserQrCode($pdo, (int) $_SESSION['user_id']);
        $image = $pdo->prepare('SELECT image_data FROM user_qr_codes WHERE user_id = ?');
        $image->execute([(int) $_SESSION['user_id']]);
        echo json_encode(['success' => true, 'token' => $token, 'image_data' => $image->fetchColumn() ?: null]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        exit;
    }

    $imageData = $_POST['image_data'] ?? '';
    if (!is_string($imageData) || strlen($imageData) > 500000 || !preg_match('/^data:image\/png;base64,([A-Za-z0-9+\/=]+)$/', $imageData, $matches)) {
        echo json_encode(['success' => false, 'message' => 'Invalid QR image.']);
        exit;
    }
    $imageBytes = base64_decode($matches[1], true);
    if ($imageBytes === false || strlen($imageBytes) > 350000 || @getimagesizefromstring($imageBytes) === false) {
        echo json_encode(['success' => false, 'message' => 'Invalid QR image.']);
        exit;
    }

    ensureUserQrCode($pdo, (int) $_SESSION['user_id']);
    $save = $pdo->prepare('UPDATE user_qr_codes SET image_data = ? WHERE user_id = ?');
    $save->execute([$imageData, (int) $_SESSION['user_id']]);
    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to load your personal QR code. Apply the event QR authorization migration.']);
}
