<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$admin_id = $_SESSION['user_id'];

// Get last seen timestamps for each tab
$seenStmt = $pdo->prepare("
    SELECT tab_name, last_seen FROM admin_seen WHERE admin_id = ?
");
$seenStmt->execute([$admin_id]);
$seen = [];
foreach ($seenStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $seen[$row['tab_name']] = $row['last_seen'];
}

// Count new items since last seen for each tab
function countNewSince($pdo, $status, $lastSeen) {
    if (!$lastSeen) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE status = ?");
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM reservations
            WHERE status = ? AND created_at > ?
        ");
        $stmt->execute([$status, $lastSeen]);
    }
    return (int)$stmt->fetchColumn();
}

// For approved/rejected — count ones updated since last seen
function countUpdatedSince($pdo, $status, $lastSeen) {
    if (!$lastSeen) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE status = ?");
        $stmt->execute([$status]);
    } else {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM reservations
            WHERE status = ? AND approved_at > ?
        ");
        $stmt->execute([$status, $lastSeen]);
    }
    return (int)$stmt->fetchColumn();
}

// Feedback — count new feedback since last seen
function countNewFeedback($pdo, $lastSeen) {
    if (!$lastSeen) {
        return (int)$pdo->query("SELECT COUNT(*) FROM feedback")->fetchColumn();
    }
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM feedback WHERE created_at > ?");
    $stmt->execute([$lastSeen]);
    return (int)$stmt->fetchColumn();
}

$counts = [
    'pending'  => countNewSince($pdo, 'pending', $seen['pending'] ?? null),
    'approved' => countUpdatedSince($pdo, 'approved', $seen['approved'] ?? null),
    'rejected' => countUpdatedSince($pdo, 'rejected', $seen['rejected'] ?? null),
    'feedback' => countNewFeedback($pdo, $seen['feedback'] ?? null),
];

echo json_encode(['success' => true, 'counts' => $counts]);
exit;
?>