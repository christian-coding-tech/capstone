<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$user_id  = trim($_POST['user_id']  ?? '');
$password = trim($_POST['password'] ?? '');

if (!$user_id || !$password) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid User ID or password.']);
    exit;
}

if ($user['status'] === 'inactive') {
    echo json_encode(['success' => false, 'message' => 'Your account has not been activated yet. Please contact the admin.']);
    exit;
}

if ($user['status'] === 'deactivated') {
    echo json_encode(['success' => false, 'message' => 'Your account has been deactivated. Please contact the admin.']);
    exit;
}

$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['full_name'];
$_SESSION['role']      = $user['role'];

$log = $pdo->prepare("INSERT INTO login_logs (user_id, action) VALUES (?, 'login')");
$log->execute([$user['id']]);

$redirects = [
    'admin'   => '/capstone/admin.php',
    'teacher' => '/capstone/teacher.php',
    'student' => '/capstone/student.php',
];

echo json_encode(['success' => true, 'redirect' => $redirects[$user['role']]]);
exit;
?>