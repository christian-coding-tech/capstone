<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://kit.fontawesome.com/8e3a2f28fd.js" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/navigation.css">
    <title>Campus Navigation — ACLC Fatima</title>
</head>
<body>

    <!-- Background -->
    <div class="nav-background">
        <div class="nav-bg-overlay"></div>
        <div class="nav-bg-content">
            <div class="coming-soon-badge">
                <i class="fa-solid fa-hard-hat"></i>
                Under Construction
            </div>
            <h1 class="coming-soon-title">3D Navigation</h1>
            <p class="coming-soon-subtitle">ACLC College Tacloban - Fatima Campus</p>
            <div class="coming-soon-divider"></div>
            <p class="coming-soon-desc">
                Our interactive 3D campus navigation is coming soon.<br>
                For now, our Campus Assistant will guide you with directions.
            </p>
        </div>
    </div>

    <!-- Back button -->
    <a href="index.php" class="back-btn">
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to Home</span>
    </a>

    <!-- Chatbot — fixed, not draggable here -->
    <div class="nav-chatbot-panel" id="navChatbotPanel">
        <div class="nav-chatbot-header">
            <div class="chatbot-title">
                <i class="fa-solid fa-robot"></i>
                <span>Campus Assistant</span>
            </div>
            <button class="nav-chatbot-minimize" id="navChatbotMinimize">
                <i class="fa-solid fa-minus"></i>
            </button>
        </div>
        <div class="nav-chatbot-messages" id="navChatbotMessages"></div>
        <div class="nav-quick-replies" id="navQuickReplies"></div>
        <div class="nav-chatbot-input-wrap">
            <input type="text" id="navChatbotInput" placeholder="Type your answer...">
            <button class="nav-chatbot-send" id="navChatbotSend">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        </div>
    </div>

    <!-- Minimized chatbot tab -->
    <button class="nav-chatbot-tab" id="navChatbotTab" style="display:none;">
        <i class="fa-solid fa-robot"></i>
        <span>Campus Assistant</span>
    </button>

    <script src="js/navigation.js"></script>
</body>
</html>