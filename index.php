<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://kit.fontawesome.com/8e3a2f28fd.js" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/login.css">
    <title>login</title>
</head>
<body>
    <div class="background-shape shape1"></div>
    <div class="background-shape shape2"></div>

    <div class="page-shell">
        <header class="page-header">
            <div>
                <h1 class="login-title">ACLC Fatima Campus</h1>
                <p class="login-subtitle">A modern portal for campus navigation and student feedback.</p>
            </div>
            <a href="admin.php" class="admin-link" aria-label="Admin login"><i class="fa-solid fa-circle-user"></i></a>
        </header>

        <main class="login-card">
            <div class="content-wrapper">
                <div class="login-image">
                    <div class="model-frame">
                        <div class="model-glow"></div>
                        <img src="img/3d pic.png" alt="3D model preview" class="model-preview">
                        <div class="model-label">3D model ready</div>
                    </div>
                </div>

                <div class="login-container">
                    <button class="login-btn nav-btn"><i class="fa-solid fa-location-dot"></i>Navigation</button>
                    <button class="login-btn feedback-btn"><i class="fa-solid fa-clipboard-check"></i>Feedback</button>
                </div>
            </div>
        </main>
    </div>

    <script src="js/login.js"></script>
</body>
</html>