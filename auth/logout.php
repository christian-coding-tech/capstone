<?php
session_start();
require_once '../db/connection.php';

if (isset($_SESSION['user_id'])) {
    $log = $pdo->prepare("INSERT INTO login_logs (user_id, action) VALUES (?, 'logout')");
    $log->execute([$_SESSION['user_id']]);
}

session_destroy();
header('Location: ../index.php');
exit;
?>