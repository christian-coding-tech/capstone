<?php
session_start();
require_once '../db/connection.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$message    = trim($_POST['message']     ?? '');
$navContext = json_decode($_POST['nav_context'] ?? '{}', true);

if (!$message) {
    echo json_encode(['success' => false, 'message' => 'No message provided.']);
    exit;
}

// ── Build campus context ──
$venues = $pdo->query("SELECT name FROM venues ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
$venueList = implode(', ', $venues);

// Get currently approved/active reservations today
$today = date('Y-m-d');
$activeToday = $pdo->prepare("
    SELECT r.time_start, r.time_end, v.name AS venue, u.full_name AS teacher, r.event_name
    FROM reservations r
    JOIN venues v ON r.venue_id = v.id
    JOIN users u ON r.teacher_id = u.id
    WHERE r.status = 'approved' AND r.date_of_use = ?
    ORDER BY r.time_start
");
$activeToday->execute([$today]);
$todayReservations = $activeToday->fetchAll(PDO::FETCH_ASSOC);

$todayContext = "";
if ($todayReservations) {
    $todayContext = "Today's approved reservations:\n";
    foreach ($todayReservations as $res) {
        $todayContext .= "- {$res['venue']}: {$res['event_name']} by {$res['teacher']} ({$res['time_start']} - {$res['time_end']})\n";
    }
} else {
    $todayContext = "No reservations today.\n";
}

// ── System prompt ──
$systemPrompt = "You are a campus navigation assistant for ACLC College Tacloban - Fatima Campus.
The 3D navigation system is currently under construction so you provide text-based directions.

Campus layout knowledge:
- The campus has a Main Building with 5 floors
- Ground floor: Administration offices, Registrar, Cashier
- 1st floor: Classrooms, Faculty Room
- 2nd floor: Classrooms, Computer Labs (Lab 1 and Lab 2)
- 3rd floor: Classrooms, Library
- 4th floor: Classrooms, Admin Lounge
- 5th floor: Classrooms
- Outside: Basketball Court, Cafeteria, Parking Lot, Gate/Guardhouse
- Available venues: $venueList

$todayContext

Navigation context for this user:
Current location: " . ($navContext['currentLocation'] ?? 'Unknown') . "
Floor: " . ($navContext['floor'] ?? 'N/A') . "
Looking for: " . ($navContext['destinationType'] ?? 'Unknown') . "
Destination: " . ($navContext['destination'] ?? 'Unknown') . "

Give clear, step-by-step text directions from their current location to their destination.
Be friendly, concise, and specific. Use landmarks when possible.
If looking for a teacher, mention they should check the Faculty Room if the teacher is not in their classroom.
Today's date is " . date('Y-m-d') . " and current time is " . date('H:i') . ".";

// ── Call Gemini ──
require_once '../config.php';
$apiKey = GEMINI_API_KEY;

$payload = json_encode([
    'system_instruction' => [
        'parts' => [['text' => $systemPrompt]]
    ],
    'contents' => [
        ['role' => 'user', 'parts' => [['text' => $message]]]
    ],
    'generationConfig' => [
        'maxOutputTokens' => 400,
        'temperature'     => 0.6
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
    echo json_encode(['success' => false, 'message' => 'AI service unavailable.']);
    exit;
}

$data  = json_decode($response, true);
$reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!$reply) {
    echo json_encode(['success' => false, 'message' => 'No response from AI.']);
    exit;
}

echo json_encode(['success' => true, 'reply' => $reply]);
exit;
?>