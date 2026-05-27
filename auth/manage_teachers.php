<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$action = trim($_POST['action'] ?? $_GET['action'] ?? '');

// ── Get all teachers ──
if ($action === 'get') {
    $search = trim($_GET['search'] ?? '');
    $query  = "
        SELECT id, user_id, full_name, email, status, pending_email, created_at
        FROM users WHERE role = 'teacher'
    ";
    $params = [];
    if ($search) {
        $query   .= " AND (full_name LIKE ? OR user_id LIKE ? OR email LIKE ?)";
        $s        = "%$search%";
        $params[] = $s; $params[] = $s; $params[] = $s;
    }
    $query .= " ORDER BY full_name ASC";
    $stmt   = $pdo->prepare($query);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── Add single teacher ──
if ($action === 'add') {
    $full_name = trim($_POST['full_name'] ?? '');
    $user_id   = trim($_POST['user_id']   ?? '');
    $email     = trim($_POST['email']     ?? '');
    $password  = trim($_POST['password']  ?? '');

    if (!$full_name || !$user_id || !$password) {
        echo json_encode(['success' => false, 'message' => 'Full name, User ID, and password are required.']);
        exit;
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE user_id = ?");
    $check->execute([$user_id]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'message' => 'User ID already exists.']);
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("
        INSERT INTO users (user_id, password, full_name, role, email, status)
        VALUES (?, ?, ?, 'teacher', ?, 'inactive')
    ");
    $stmt->execute([$user_id, $hashed, $full_name, $email ?: null]);
    echo json_encode(['success' => true, 'message' => 'Teacher account created. Activate it to allow login.']);
    exit;
}

// ── CSV bulk upload ──
if ($action === 'csv') {
    if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Please upload a valid CSV file.']);
        exit;
    }

    $file    = fopen($_FILES['csv_file']['tmp_name'], 'r');
    $headers = fgetcsv($file);
    $headers = array_map('trim', $headers);

    $required = ['full_name', 'user_id', 'email'];
    foreach ($required as $col) {
        if (!in_array($col, $headers)) {
            echo json_encode(['success' => false, 'message' => "CSV missing required column: $col"]);
            fclose($file);
            exit;
        }
    }

    $preview = [];
    while (($row = fgetcsv($file)) !== false) {
        $data = array_combine($headers, array_map('trim', $row));
        if (!$data['full_name'] || !$data['user_id']) continue;
        $preview[] = $data;
    }
    fclose($file);

    echo json_encode(['success' => true, 'preview' => $preview]);
    exit;
}

// ── Confirm CSV bulk create ──
if ($action === 'csv_confirm') {
    $accounts = json_decode($_POST['accounts'] ?? '[]', true);
    if (!$accounts) {
        echo json_encode(['success' => false, 'message' => 'No accounts to create.']);
        exit;
    }

    $defaultPassword = password_hash('aclc1234', PASSWORD_DEFAULT);
    $created = 0;
    $skipped = 0;

    foreach ($accounts as $acc) {
        $check = $pdo->prepare("SELECT id FROM users WHERE user_id = ?");
        $check->execute([$acc['user_id']]);
        if ($check->fetch()) { $skipped++; continue; }

        $stmt = $pdo->prepare("
            INSERT INTO users (user_id, password, full_name, role, email, status)
            VALUES (?, ?, ?, 'teacher', ?, 'inactive')
        ");
        $stmt->execute([$acc['user_id'], $defaultPassword, $acc['full_name'], $acc['email'] ?: null]);
        $created++;
    }

    echo json_encode([
        'success' => true,
        'message' => "$created account(s) created with default password 'aclc1234'. $skipped skipped (duplicate IDs). Activate accounts to allow login."
    ]);
    exit;
}

// ── Toggle status ──
if ($action === 'toggle_status') {
    $id         = trim($_POST['id']     ?? '');
    $new_status = trim($_POST['status'] ?? '');

    if (!$id || !in_array($new_status, ['active', 'inactive', 'deactivated'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid data.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ? AND role = 'teacher'");
    $stmt->execute([$new_status, $id]);
    echo json_encode(['success' => true, 'message' => 'Account status updated.']);
    exit;
}

// ── Approve email change ──
if ($action === 'approve_email') {
    $id = trim($_POST['id'] ?? '');
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Invalid data.']);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE users SET email = pending_email, pending_email = NULL
        WHERE id = ? AND pending_email IS NOT NULL
    ");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Email change approved.']);
    exit;
}

// ── Reject email change ──
if ($action === 'reject_email') {
    $id = trim($_POST['id'] ?? '');
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Invalid data.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE users SET pending_email = NULL WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Email change rejected.']);
    exit;
}

// ── Reset teacher password ──
if ($action === 'reset_password') {
    $id           = trim($_POST['id']           ?? '');
    $new_password = trim($_POST['new_password'] ?? '');

    if (!$id || !$new_password) {
        echo json_encode(['success' => false, 'message' => 'Invalid data.']);
        exit;
    }

    if (strlen($new_password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        exit;
    }

    $hashed = password_hash($new_password, PASSWORD_DEFAULT);
    $stmt   = $pdo->prepare("UPDATE users SET password = ? WHERE id = ? AND role = 'teacher'");
    $stmt->execute([$hashed, $id]);
    echo json_encode(['success' => true, 'message' => 'Password reset successfully.']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);
exit;
?>