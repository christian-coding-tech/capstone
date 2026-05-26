<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$teacher_id  = $_SESSION['user_id'];
$venue_id    = trim($_POST['venue_id']    ?? '');
$room_number = trim($_POST['room_number'] ?? '');
$event_name  = trim($_POST['event_name']  ?? '');
$date_of_use = trim($_POST['date_of_use'] ?? '');
$time_start  = trim($_POST['time_start']  ?? '');
$time_end    = trim($_POST['time_end']    ?? '');

if (!$venue_id || !$event_name || !$date_of_use || !$time_start || !$time_end) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
    exit;
}

$proposal_pdf = null;

if (isset($_FILES['proposal_pdf']) && $_FILES['proposal_pdf']['error'] === UPLOAD_ERR_OK) {
    $file     = $_FILES['proposal_pdf'];
    $maxSize  = 5 * 1024 * 1024;
    $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if ($ext !== 'pdf') {
        echo json_encode(['success' => false, 'message' => 'Only PDF files are allowed.']);
        exit;
    }

    if ($file['size'] > $maxSize) {
        echo json_encode(['success' => false, 'message' => 'File size must not exceed 5MB.']);
        exit;
    }

    $filename     = uniqid('proposal_', true) . '.pdf';
    $uploadPath   = '../uploads/proposals/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file.']);
        exit;
    }

    $proposal_pdf = $filename;
}

// ── Check for conflicts ──
$conflict = $pdo->prepare("
    SELECT id FROM reservations
    WHERE venue_id = ?
    AND date_of_use = ?
    AND status = 'approved'
    AND (
        (time_start < ? AND time_end > ?)
    )
");
$conflict->execute([$venue_id, $date_of_use, $time_end, $time_start]);

if ($conflict->fetch()) {
    echo json_encode([
        'success' => false,
        'message' => 'This venue is already booked and approved for that date and time. Please choose a different date, time, or venue.'
    ]);
    exit;
}

$full_event = $room_number ? $event_name . ' — ' . $room_number : $event_name;

$stmt = $pdo->prepare("
    INSERT INTO reservations (teacher_id, venue_id, event_name, date_of_use, time_start, time_end, proposal_pdf)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([$teacher_id, $venue_id, $full_event, $date_of_use, $time_start, $time_end, $proposal_pdf]);

echo json_encode(['success' => true, 'message' => 'Reservation request submitted successfully.']);
exit;
?>