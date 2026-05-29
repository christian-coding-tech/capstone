<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    header('Location: index.php');
    exit;
}
$student_name = $_SESSION['user_name'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://kit.fontawesome.com/8e3a2f28fd.js" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/teacher.css">
    <title>Student Dashboard — ACLC Fatima</title>
</head>
<body>

    <!-- Header -->
    <header class="dashboard-header">
        <div class="header-left">
            <div class="school-logo">
                <i class="fa-solid fa-school"></i>
            </div>
            <div class="header-titles">
                <span class="school-name">ACLC College Tacloban - Fatima Campus</span>
                <span class="page-label">Student Dashboard</span>
            </div>
        </div>
        <div class="header-right">
            <div class="teacher-info">
                <i class="fa-solid fa-circle-user"></i>
                <span><?php echo htmlspecialchars($student_name); ?></span>
            </div>
            <a href="auth/logout.php" class="logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </a>
        </div>
    </header>

    <main class="dashboard-main">
        <div class="tabs-wrapper">
            <div class="tabs">
                <button class="tab-btn active" data-tab="my-reservations">
                    <i class="fa-solid fa-clock"></i>
                    My Reservations
n                </button>
                <button class="tab-btn" data-tab="approved">
                    <i class="fa-solid fa-circle-check"></i>
                    Approved
                </button>
                <button class="tab-btn" data-tab="rejected">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Rejected
                </button>
            </div>
        </div>

        <div class="tab-content" id="tabContent">
            <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading...</span>
            </div>
        </div>

    </main>

    <!-- AI Chatbot -->
    <button class="chatbot-fab" id="chatbotToggle" title="Campus Assistant">
        <i class="fa-solid fa-robot"></i>
    </button>

    <div class="chatbot-panel" id="chatbotPanel">
        <div class="chatbot-header">
            <div class="chatbot-title">
                <i class="fa-solid fa-robot"></i>
                <span>Campus Assistant</span>
            </div>
            <button class="chatbot-close" id="chatbotClose">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="chatbot-messages" id="chatbotMessages">
            <div class="chat-msg bot">
                <div class="chat-bubble">
                    Hi! I'm your Campus Assistant. I can help you with navigation, reservations, and schedules. How can I help you today?
                </div>
            </div>
        </div>
        <div class="chatbot-input-wrap">
            <input type="text" id="chatbotInput" placeholder="Ask me anything...">
            <button class="chatbot-send" id="chatbotSend">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        </div>
    </div>

    <script src="js/teacher.js"></script>
</body>
</html>