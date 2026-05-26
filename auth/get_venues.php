<?php
require_once '../db/connection.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT id, name FROM venues ORDER BY name ASC");
$venues = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'venues' => $venues]);
?>