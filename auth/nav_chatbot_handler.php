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
$navContext = is_array($navContext) ? $navContext : [];

if (!$message) {
    echo json_encode(['success' => false, 'message' => 'No message provided.']);
    exit;
}

$locations = [
    'main building' => ['Main Building', 'The Main Building has five floors. The ground floor has Administration, Registrar, and Cashier; the 1st floor has classrooms and the Faculty Room; the 2nd floor has classrooms and Computer Labs 1 and 2; the 3rd floor has classrooms and the Library; the 4th floor has classrooms and the Admin Lounge; and the 5th floor has classrooms.'],
    'registrar' => ['Registrar', 'The Registrar is on the ground floor of the Main Building.'],
    'cashier' => ['Cashier', 'The Cashier is on the ground floor of the Main Building.'],
    'faculty room' => ['Faculty Room', 'The Faculty Room is on the 1st floor of the Main Building.'],
    'computer lab 1' => ['Computer Lab 1', 'Computer Lab 1 is on the 2nd floor of the Main Building.'],
    'computer lab 2' => ['Computer Lab 2', 'Computer Lab 2 is on the 2nd floor of the Main Building.'],
    'computer lab' => ['Computer Labs', 'Computer Labs 1 and 2 are on the 2nd floor of the Main Building.'],
    'library' => ['Library', 'The Library is on the 3rd floor of the Main Building.'],
    'admin lounge' => ['Admin Lounge', 'The Admin Lounge is on the 4th floor of the Main Building.'],
    'basketball court' => ['Basketball Court', 'The Basketball Court is an outdoor campus area near the campus entrance.'],
    'activity court' => ['Activity Court', 'The Activity Court is an outdoor campus area near the campus entrance.'],
    'cafeteria' => ['Cafeteria', 'The Cafeteria is an outdoor campus venue near the student areas.'],
    'parking lot' => ['Parking Lot', 'The Parking Lot is outside the Main Building.'],
    'gate / guardhouse' => ['Gate / Guardhouse', 'The Gate / Guardhouse is the campus entrance.'],
    'main gate' => ['Main Gate', 'The Main Gate is the campus entrance.'],
];
$demoPeople = [
    ['name' => 'Alex Demo', 'role' => 'teacher', 'location' => 'Faculty Room', 'department' => 'Information Technology'],
    ['name' => 'Jamie Demo', 'role' => 'student', 'location' => 'Main Building', 'program' => 'BSIT', 'section' => 'BSIT Demo 1A'],
];
$normalize = static function (string $value): string {
    return trim((string) preg_replace('/[^a-z0-9]+/i', ' ', strtolower($value)));
};
$contains = static function (string $value, string $part): bool {
    return $part !== '' && strpos($value, $part) !== false;
};
$normalizedMessage = $normalize($message);
$contextDestination = $normalize((string) ($navContext['destination'] ?? ''));
$contextType = strtolower((string) ($navContext['destinationType'] ?? ''));

$matchedLocation = null;
foreach ($locations as $key => $location) {
    $normalizedKey = $normalize($key);
    if ($contains($normalizedMessage, $normalizedKey) || ($contextDestination !== '' && $contains($contextDestination, $normalizedKey))) {
        $matchedLocation = $location;
        break;
    }
}

if ($matchedLocation !== null) {
    $reply = $matchedLocation[1];
    $currentLocation = trim((string) ($navContext['currentLocation'] ?? ''));
    if ($currentLocation !== '') {
        $reply = "From {$currentLocation}, head toward the Main Building entrance and follow the floor signs to {$matchedLocation[0]}. {$reply}";
    }
    echo json_encode(['success' => true, 'reply' => $reply, 'source' => 'local']);
    exit;
}

$venueRows = $pdo->query('SELECT name, description FROM venues ORDER BY name')->fetchAll(PDO::FETCH_ASSOC);
foreach ($venueRows as $venue) {
    $venueName = $normalize((string) $venue['name']);
    if ($venueName !== '' && ($contains($normalizedMessage, $venueName) || ($contextDestination !== '' && $contains($contextDestination, $venueName)))) {
        $description = trim((string) ($venue['description'] ?? ''));
        $reply = $description !== ''
            ? "{$venue['name']}: {$description}"
            : "{$venue['name']} is listed as a campus venue in the local database, but its floor or detailed directions aren't recorded.";
        echo json_encode(['success' => true, 'reply' => $reply, 'source' => 'local']);
        exit;
    }
}

$directoryRole = $contextType === 'teacher' || preg_match('/\bteacher\b/', $normalizedMessage)
    ? 'teacher'
    : ($contextType === 'student' || preg_match('/\bstudent\b/', $normalizedMessage) ? 'student' : null);
$searchName = trim((string) ($navContext['destination'] ?? ''));
if ($searchName === '' || in_array($normalize($searchName), ['teacher', 'student', 'find teacher', 'find student'], true)) {
    $searchName = preg_replace('/^.*?\b(?:teacher|student)\b\s*/i', '', $message);
}
$searchName = ltrim(trim($searchName), " \t\n\r\0\x0B?.!,:-");

if ($directoryRole !== null) {
    $demoMatches = array_values(array_filter($demoPeople, static function (array $person) use ($directoryRole, $searchName, $normalize, $contains): bool {
        return $person['role'] === $directoryRole
            && ($searchName === '' || $contains($normalize($person['name']), $normalize($searchName)));
    }));

    if ($demoMatches) {
        $person = $demoMatches[0];
        $reply = "Temporary test profile (demo data, not a real campus account): {$person['name']}, " . ($directoryRole === 'teacher'
            ? "{$person['department']}; sample location: {$person['location']}."
            : "{$person['program']}, {$person['section']}; sample campus area: {$person['location']}.");
        $profile = [
            'name' => $person['name'],
            'role' => ucfirst($directoryRole),
            'program' => $person['program'] ?? null,
            'section' => $person['section'] ?? null,
            'department' => $person['department'] ?? null,
        ];
        echo json_encode(['success' => true, 'reply' => $reply, 'source' => 'local', 'profile' => $profile]);
        exit;
    }
    if ($searchName !== '') {
        echo json_encode(['success' => true, 'reply' => "I couldn't find that {$directoryRole} in the temporary navigation test profiles. Real student and staff account details aren't exposed through this assistant.", 'source' => 'local']);
        exit;
    }
    echo json_encode(['success' => true, 'reply' => 'Temporary test profiles only: Alex Demo (teacher) and Jamie Demo (student). These are fictional examples, not real campus accounts.', 'source' => 'local']);
    exit;
}

if (preg_match('/\b(event|events|reservation|reservations|today)\b/', $normalizedMessage)) {
    $stmt = $pdo->prepare("SELECT r.event_name, r.date_of_use, r.time_start, r.time_end, v.name AS venue
        FROM reservations r JOIN venues v ON v.id = r.venue_id
        WHERE r.status = 'approved' AND r.date_of_use = ?
        ORDER BY r.time_start");
    $stmt->execute([date('Y-m-d')]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $reply = $events ? "Today's approved campus events:\\n" : 'There are no approved events listed for today in the local calendar.';
    foreach ($events as $event) {
        $reply .= "- {$event['event_name']} at {$event['venue']} ({$event['time_start']}–{$event['time_end']})\\n";
    }
    echo json_encode(['success' => true, 'reply' => trim($reply), 'source' => 'local']);
    exit;
}

$venueNames = array_column($venueRows, 'name');
$localKnowledge = "ACLC College Tacloban - Fatima Campus locations:\n";
foreach ($locations as $location) $localKnowledge .= "- {$location[0]}: {$location[1]}\n";
$localKnowledge .= 'Database venues: ' . implode(', ', $venueNames) . "\n";
$localKnowledge .= "Temporary test profiles (demo only, not real accounts): Alex Demo (teacher, Faculty Room); Jamie Demo (student, BSIT Demo 1A).\n";
$systemPrompt = "You are the ACLC Fatima Campus navigation assistant. Answer campus, room, facility, demo teacher/student profile, and direction questions using only this local campus information. If a detail is not listed, say so rather than inventing it. Give concise, practical directions. This assistant should answer known campus questions without relying on internet access.\n\n"
    . $localKnowledge . "\nCurrent location: " . ($navContext['currentLocation'] ?? 'Unknown')
    . "\nFloor: " . ($navContext['floor'] ?? 'Unknown')
    . "\nDestination type: " . ($navContext['destinationType'] ?? 'Unknown')
    . "\nDestination: " . ($navContext['destination'] ?? 'Unknown');

$configPath = dirname(__DIR__) . '/config.php';
$apiKey = '';
if (is_file($configPath)) {
    require_once $configPath;
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
}
if ($apiKey !== '' && function_exists('curl_init')) {
    $payload = json_encode([
        'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
        'contents' => [['role' => 'user', 'parts' => [['text' => $message]]]],
        'generationConfig' => ['maxOutputTokens' => 400, 'temperature' => 0.4]
    ]);
    $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' . rawurlencode($apiKey));
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
    curl_close($ch);
    if ($response !== false && $httpCode === 200) {
        $data = json_decode($response, true);
        $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if ($reply) {
            echo json_encode(['success' => true, 'reply' => $reply, 'source' => 'ai']);
            exit;
        }
    }
}

echo json_encode(['success' => true, 'reply' => 'I can answer campus questions from the local directory. Try asking where a room or facility is, how to get somewhere, which teachers are listed, or what events are scheduled today.', 'source' => 'local']);
exit;
?>