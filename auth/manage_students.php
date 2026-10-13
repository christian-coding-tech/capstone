<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$action = trim($_POST['action'] ?? $_GET['action'] ?? '');

// ── Get all students ──
if ($action === 'get') {
    $search = trim($_GET['search'] ?? '');
    $query  = "
        SELECT id, user_id, full_name, email, course, section, adviser, id_photo, department, status, deactivation_reason, created_at
        FROM users WHERE role = 'student'
    ";
    $params = [];
    if ($search) {
        $query   .= " AND (full_name LIKE ? OR user_id LIKE ? OR email LIKE ? OR course LIKE ? OR department LIKE ?)";
        $s        = "%$search%";
        $params[] = $s; $params[] = $s; $params[] = $s; $params[] = $s; $params[] = $s;
    }
    $query .= " ORDER BY full_name ASC";
    $stmt   = $pdo->prepare($query);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── Add single student ──
if ($action === 'add') {
    $full_name = trim($_POST['full_name'] ?? '');
    $user_id   = trim($_POST['user_id']   ?? '');
    $email     = trim($_POST['email']     ?? '');
    $course    = trim($_POST['course']    ?? '');
    $section   = trim($_POST['section'] ?? '');
    $adviser   = trim($_POST['adviser'] ?? '');
    $department = trim($_POST['department'] ?? '');
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

    $photoPath = null;
    if (isset($_FILES['id_photo']) && $_FILES['id_photo']['error'] !== UPLOAD_ERR_NO_FILE) {
        $photo = $_FILES['id_photo'];
        if ($photo['error'] !== UPLOAD_ERR_OK || $photo['size'] > 5 * 1024 * 1024) {
            echo json_encode(['success' => false, 'message' => 'ID photo upload failed or exceeds 5MB.']);
            exit;
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($photo['tmp_name']);
        $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!isset($extensions[$mime])) {
            echo json_encode(['success' => false, 'message' => 'ID photo must be a JPG, PNG, or WebP image.']);
            exit;
        }
        $directory = dirname(__DIR__) . '/uploads/id_photos';
        if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
            throw new RuntimeException('Unable to create the ID photo directory.');
        }
        $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
        if (!move_uploaded_file($photo['tmp_name'], $directory . '/' . $filename)) {
            throw new RuntimeException('Unable to save the ID photo.');
        }
        $photoPath = 'uploads/id_photos/' . $filename;
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (user_id, password, full_name, role, email, course, section, adviser, id_photo, department, status)
            VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, 'inactive')
        ");
        $stmt->execute([$user_id, $password, $full_name, $email ?: null, $course ?: null, $section ?: null, $adviser ?: null, $photoPath, $department ?: null]);
        ensureUserQrCode($pdo, (int) $pdo->lastInsertId());
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        if ($photoPath !== null && is_file(dirname(__DIR__) . '/' . $photoPath)) {
            unlink(dirname(__DIR__) . '/' . $photoPath);
        }
        throw $e;
    }
    echo json_encode(['success' => true, 'message' => 'Student account created with its own QR code. Activate it to allow login.']);
    exit;
}

// ── CSV bulk upload ──
if ($action === 'csv') {
    if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Please upload a valid CSV file.']);
        exit;
    }

    $file    = fopen($_FILES['csv_file']['tmp_name'], 'r');
    $headers = array_map('trim', fgetcsv($file));

    foreach (['full_name', 'user_id', 'email'] as $col) {
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

    $defaultPassword = 'aclc1234';
    $created = 0; $skipped = 0;

    foreach ($accounts as $acc) {
        $check = $pdo->prepare("SELECT id FROM users WHERE user_id = ?");
        $check->execute([$acc['user_id']]);
        if ($check->fetch()) { $skipped++; continue; }

        $stmt = $pdo->prepare("
            INSERT INTO users (user_id, password, full_name, role, email, course, section, adviser, department, status)
                VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, 'inactive')
        ");
        $stmt->execute([$acc['user_id'], $defaultPassword, $acc['full_name'], $acc['email'] ?: null, trim($acc['course'] ?? '') ?: null, trim($acc['section'] ?? '') ?: null, trim($acc['adviser'] ?? '') ?: null, trim($acc['department'] ?? '') ?: null]);
        ensureUserQrCode($pdo, (int) $pdo->lastInsertId());
        $created++;
    }

    echo json_encode([
        'success' => true,
        'message' => "$created account(s) created with default password 'aclc1234'. $skipped skipped. Activate to allow login."
    ]);
    exit;
}

// ── Toggle status ──
if ($action === 'toggle_status') {
    $id     = trim($_POST['id']     ?? '');
    $status = trim($_POST['status'] ?? '');
    $reason = trim($_POST['reason'] ?? '');

    if (!$id || !in_array($status, ['active', 'inactive', 'deactivated'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid data.']);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE users SET status = ?, deactivation_reason = ?
        WHERE id = ? AND role = 'student'
    ");
    $stmt->execute([$status, $reason ?: null, $id]);
    echo json_encode(['success' => true, 'message' => 'Student status updated.']);
    exit;
}

if ($action === 'set_department') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $department = trim($_POST['department'] ?? '');
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Invalid student account.']);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE users SET department = ? WHERE id = ? AND role = 'student'");
    $stmt->execute([$department ?: null, $id]);
    echo json_encode(['success' => true, 'message' => 'Student department updated.']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action.']);
exit;
?>