<?php

$host = 'sql111.infinityfree.com';
$dbname = 'if0_43056533_aclc_campus';
$username = 'if0_43056533';
$password = 'S5lpjih6CYaqZs';
$port = 3306;

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