<?php
require_once '../db/connection.php';
header('Content-Type: application/json');

$month = filter_input(INPUT_GET, 'month', FILTER_VALIDATE_INT);
$year = filter_input(INPUT_GET, 'year', FILTER_VALIDATE_INT);
$month = $month && $month >= 1 && $month <= 12 ? $month : (int) date('n');
$year = $year && $year >= 2020 && $year <= 2100 ? $year : (int) date('Y');

$stmt = $pdo->prepare("SELECT r.id, r.event_name, r.date_of_use, r.time_start, r.time_end,
        r.target_course, r.target_department, v.name AS venue_name
    FROM reservations r JOIN venues v ON v.id = r.venue_id
    WHERE r.status = 'approved' AND MONTH(r.date_of_use) = ? AND YEAR(r.date_of_use) = ?
    ORDER BY r.date_of_use, r.time_start");
$stmt->execute([$month, $year]);
echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
