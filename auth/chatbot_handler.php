<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$message = trim($_POST['message'] ?? '');
$role    = $_SESSION['role'];

if (!$message) {
    echo json_encode(['success' => false, 'message' => 'No message provided.']);
    exit;
}

// ── Build context from database ──
$context = "";

$venues = $pdo->query("SELECT name FROM venues ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
$context .= "Available venues: " . implode(', ', $venues) . ".\n";

$upcoming = $pdo->query("
    SELECT r.date_of_use, r.time_start, r.time_end, v.name AS venue, u.full_name AS teacher
    FROM reservations r
    JOIN venues v ON r.venue_id = v.id
    JOIN users u ON r.teacher_id = u.id
    WHERE r.status = 'approved'
    AND r.date_of_use BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
    ORDER BY r.date_of_use, r.time_start
    LIMIT 20
")->fetchAll(PDO::FETCH_ASSOC);

if ($upcoming) {
    $context .= "Upcoming approved reservations (next 14 days):\n";
    foreach ($upcoming as $res) {
        $context .= "- {$res['venue']} on {$res['date_of_use']} from {$res['time_start']} to {$res['time_end']} (by {$res['teacher']})\n";
    }
} else {
    $context .= "No approved reservations in the next 14 days.\n";
}

$pending = $pdo->query("SELECT COUNT(*) FROM reservations WHERE status = 'pending'")->fetchColumn();
$context .= "Currently pending reservation requests: $pending.\n";

if ($role === 'teacher') {
    $teacher_id = $_SESSION['user_id'];
    $myPending  = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE teacher_id = ? AND status = 'pending'");
    $myPending->execute([$teacher_id]);
    $context .= "This teacher's pending requests: " . $myPending->fetchColumn() . ".\n";
}

// ── System prompt ──
$systemPrompt = "You are a helpful campus assistant for ACLC College Tacloban - Fatima Campus.
You help with venue reservations, checking facility availability, campus navigation guidance, and general campus information.
For navigation questions, explain that the 3D navigation system is coming soon.
Be concise, friendly, and professional.
Today's date is " . date('Y-m-d') . ".

Current campus data:
$context

When asked about facility availability on a specific date, check the upcoming reservations list above and tell the user if the venue is free or booked during that time.";

// ── Gemini API Key ──
require_once '../config.php';
$apiKey = GEMINI_API_KEY;

// ── Call Gemini API ──
$payload = json_encode([
    'system_instruction' => [
        'parts' => [['text' => $systemPrompt]]
    ],
    'contents' => [
        ['role' => 'user', 'parts' => [['text' => $message]]]
    ],
    'generationConfig' => [
        'maxOutputTokens' => 300,
        'temperature'     => 0.7
    ]
]);

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" . $apiKey;
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json']
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo json_encode(['success' => false, 'message' => 'API error. Code: ' . $httpCode . ' — ' . $response]);
    exit;
}

$data  = json_decode($response, true);
$reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!$reply) {
    echo json_encode(['success' => false, 'message' => 'Unexpected response: ' . json_encode($data)]);
    exit;
}

echo json_encode(['success' => true, 'reply' => $reply]);
exit;
?>