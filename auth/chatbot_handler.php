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
Use the campus map and guided route planner for navigation questions. Do not claim that a 3D navigation system is available.
Be concise, friendly, and professional.
Today's date is " . date('Y-m-d') . ".

Current campus data:
$context

When asked about facility availability on a specific date, check the upcoming reservations list above and tell the user if the venue is free or booked during that time.";

$apiKey = '';
$configPath = dirname(__DIR__) . '/config.php';
if (is_file($configPath)) {
    require_once $configPath;
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
}

if ($apiKey !== '' && function_exists('curl_init')) {
    $payload = json_encode([
        'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
        'contents' => [['role' => 'user', 'parts' => [['text' => $message]]]],
        'generationConfig' => ['maxOutputTokens' => 300, 'temperature' => 0.7]
    ]);

    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=' . rawurlencode($apiKey);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 7
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    unset($ch);

    if ($response !== false && $httpCode === 200) {
        $data = json_decode($response, true);
        $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (is_string($reply) && $reply !== '') {
            echo json_encode(['success' => true, 'reply' => $reply, 'source' => 'ai']);
            exit;
        }
        error_log('Campus assistant API returned an invalid response.');
    } else {
        error_log('Campus assistant API request failed: ' . ($curlError ?: 'HTTP ' . $httpCode));
    }
}

$normalizedMessage = strtolower((string) preg_replace('/[^a-z0-9]+/i', ' ', $message));
$askedToday = (bool) preg_match('/\b(today|tonight)\b/', $normalizedMessage);
$askedSchedule = (bool) preg_match('/\b(event|events|reservation|reservations|schedule|availability|available|free|booked)\b/', $normalizedMessage);
$matchedVenue = null;
foreach ($venues as $venue) {
    $normalizedVenue = strtolower((string) preg_replace('/[^a-z0-9]+/i', ' ', $venue));
    if ($normalizedVenue !== '' && strpos($normalizedMessage, $normalizedVenue) !== false) {
        $matchedVenue = $venue;
        break;
    }
}

if ($matchedVenue !== null) {
    $venueEvents = array_values(array_filter($upcoming, static function ($reservation) use ($matchedVenue) {
        return strcasecmp((string) $reservation['venue'], $matchedVenue) === 0;
    }));
    $reply = $venueEvents
        ? "Approved reservations for {$matchedVenue} in the next 14 days:\n"
        : "There are no approved reservations for {$matchedVenue} in the next 14 days.";
    foreach ($venueEvents as $reservation) {
        $reply .= "- {$reservation['date_of_use']} from {$reservation['time_start']} to {$reservation['time_end']} ({$reservation['teacher']})\n";
    }
} elseif ($askedSchedule) {
    $schedule = $askedToday
        ? array_values(array_filter($upcoming, static function ($reservation) {
            return $reservation['date_of_use'] === date('Y-m-d');
        }))
        : $upcoming;
    $reply = $askedToday ? "Today's approved reservations:\n" : "Approved reservations in the next 14 days:\n";
    if (!$schedule) {
        $reply = $askedToday
            ? 'There are no approved reservations scheduled for today.'
            : 'There are no approved reservations scheduled in the next 14 days.';
    } else {
        foreach ($schedule as $reservation) {
            $reply .= "- {$reservation['venue']} on {$reservation['date_of_use']} from {$reservation['time_start']} to {$reservation['time_end']} ({$reservation['teacher']})\n";
        }
    }
} else {
    $reply = 'I can help with venue availability and approved reservation schedules using campus records. Ask me about a venue, upcoming events, or today’s schedule. For building and room directions, use the Campus Navigation page.';
}

echo json_encode(['success' => true, 'reply' => trim($reply), 'source' => 'local']);
exit;