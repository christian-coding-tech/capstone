<?php
session_start();
require_once '../db/connection.php';
require_once 'event_helpers.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only the event teacher can manage scan access.']);
    exit;
}

$eventId = filter_input(INPUT_GET, 'event_id', FILTER_VALIDATE_INT);
if (!$eventId) {
    $eventId = filter_input(INPUT_POST, 'event_id', FILTER_VALIDATE_INT);
}
if (!$eventId || !eventHostIsTeacher($pdo, $eventId, (int) $_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You can only manage scanners for events you submitted.']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $event = $pdo->prepare("SELECT status FROM reservations WHERE id = ?");
        $event->execute([$eventId]);
        if ($event->fetchColumn() !== 'approved') {
            echo json_encode(['success' => false, 'message' => 'Only approved events can have scanners.']);
            exit;
        }
        $eligible = $pdo->prepare("SELECT id, user_id, full_name, role
            FROM users
            WHERE status = 'active' AND role IN ('student', 'teacher') AND id <> ?
            ORDER BY full_name");
        $eligible->execute([(int) $_SESSION['user_id']]);
        $authorized = $pdo->prepare("SELECT u.id, u.user_id, u.full_name, u.role
            FROM event_scan_authorizations a
            JOIN users u ON u.id = a.user_id
            WHERE a.reservation_id = ?
            ORDER BY u.full_name");
        $authorized->execute([$eventId]);
        echo json_encode(['success' => true, 'eligible' => $eligible->fetchAll(), 'authorized' => $authorized->fetchAll()]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        exit;
    }

    $action = $_POST['action'] ?? '';
    $userId = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
    if (!$userId || !in_array($action, ['add', 'remove'], true)) {
        echo json_encode(['success' => false, 'message' => 'Select a valid scanner and action.']);
        exit;
    }

    if ($action === 'add') {
        $event = $pdo->prepare("SELECT status FROM reservations WHERE id = ?");
        $event->execute([$eventId]);
        if ($event->fetchColumn() !== 'approved') {
            echo json_encode(['success' => false, 'message' => 'Only approved events can have scanners.']);
            exit;
        }
        $eligible = $pdo->prepare("SELECT 1 FROM users WHERE id = ? AND status = 'active' AND role IN ('student', 'teacher')");
        $eligible->execute([$userId]);
        if (!$eligible->fetchColumn() || $userId === (int) $_SESSION['user_id']) {
            echo json_encode(['success' => false, 'message' => 'Only another active student or teacher can be authorized.']);
            exit;
        }
        $add = $pdo->prepare('INSERT IGNORE INTO event_scan_authorizations (reservation_id, user_id, granted_by) VALUES (?, ?, ?)');
        $add->execute([$eventId, $userId, (int) $_SESSION['user_id']]);
    } else {
        $remove = $pdo->prepare('DELETE FROM event_scan_authorizations WHERE reservation_id = ? AND user_id = ?');
        $remove->execute([$eventId, $userId]);
    }

    echo json_encode(['success' => true, 'message' => $action === 'add' ? 'Scanner authorized.' : 'Scanner access removed.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Unable to update event scanner access.']);
}
