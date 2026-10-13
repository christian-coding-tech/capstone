<?php

$host = 'sql111.infinityfree.com';
$dbname = 'if0_43056533_aclc_campus';
$username = 'if0_43056533';
$password = 'S5lpjih6CYaqZs';
$port = 3306;

$requestHost = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
if (in_array($requestHost, ['localhost', '127.0.0.1', '::1'], true)) {
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $dbname = getenv('DB_NAME') ?: 'aclc_campus';
    $username = getenv('DB_USER') ?: 'root';
    $dbPassword = getenv('DB_PASSWORD');
    $password = $dbPassword === false ? '' : $dbPassword;
    $port = getenv('DB_PORT') ?: 3306;
}

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die(json_encode([
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]));
}
?>