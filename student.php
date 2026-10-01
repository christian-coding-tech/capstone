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
    <link rel="stylesheet" href="css/dashboard-polish.css">
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
            <div class="account-notifications" id="accountNotifications"></div>
            <a href="auth/logout.php" class="logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </a>
        </div>
    </header>

    <main class="dashboard-main">
        <section class="dashboard-hero" aria-labelledby="dashboardWelcome">
            <div class="dashboard-hero-copy">
                <span class="dashboard-eyebrow"><i class="fa-solid fa-sparkles"></i> Student portal</span>
                <h1 id="dashboardWelcome">Welcome back, <?php echo htmlspecialchars($student_name); ?></h1>
                <p>Keep track of your campus reservation requests and see the latest updates from your school.</p>
            </div>
            <div class="dashboard-hero-actions">
                <a class="dashboard-shortcut primary" href="navigation.php#campusEventsTitle"><i class="fa-solid fa-calendar-days"></i> Events calendar</a>
                <a class="dashboard-shortcut" href="index.php"><i class="fa-solid fa-house"></i> Landing page</a>
            </div>
        </section>
        <div class="tabs-wrapper" id="eventHistory">
            <div class="tabs">
                <button class="tab-btn active" data-history="upcoming"><i class="fa-solid fa-hourglass-half"></i> On-going / Pre-booked</button>
                <button class="tab-btn" data-history="attended"><i class="fa-solid fa-circle-check"></i> Attended</button>
                <button class="tab-btn" data-history="missed"><i class="fa-solid fa-clock-rotate-left"></i> Missed / Unable</button>
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

    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="js/student-events.js"></script>
    <script src="js/account-notifications.js"></script>
</body>
</html>