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
    <link rel="stylesheet" href="css/login.css">
    <title>ACLC Fatima Campus</title>
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
            <button class="admin-link" id="loginToggle" aria-label="Login">
                <i class="fa-solid fa-circle-user"></i>
            </button>
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
                    <button class="login-btn feedback-btn" id="feedbackToggle"><i class="fa-solid fa-clipboard-check"></i>Feedback</button>
                </div>
            </div>
        </main>

        <!-- Navigation Popup Modal -->
        <div class="modal-overlay" id="navigationModal" aria-hidden="true" role="dialog" aria-modal="true">
            <div class="modal" role="document">
                <div class="modal-header">
                    <h2 class="modal-title">Navigation</h2>
                    <button class="modal-close" type="button" aria-label="Close">&times;</button>
                </div>

                <div class="modal-body">
                    <div class="modal-3d-preview" aria-hidden="true">
                        <img src="img/3d pic.png" alt="3D model preview" class="modal-model-preview">
                        <div class="modal-3d-label">Ready 3D model</div>
                    </div>

                    <div class="modal-copy">
                        <p>Select a destination to get started.</p>
                        <div class="modal-actions">
                            <button class="modal-action" type="button">Main Gate</button>
                            <button class="modal-action" type="button">Library</button>
                            <button class="modal-action" type="button">Registrar</button>
                        </div>
                        <p class="modal-hint">(Placeholder buttons—connect these to your navigation logic later.)</p>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Login Modal -->
    <div class="modal-overlay" id="loginModal">
        <div class="modal-box">
            <button class="modal-close" id="loginClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Welcome Back</h2>
            <p class="modal-subtitle">Sign in to your campus account</p>
            <div class="modal-error" id="loginError"></div>
            <form id="loginForm" class="modal-form">
                <div class="form-group">
                    <label for="userId">User ID</label>
                    <input type="text" id="userId" name="user_id" placeholder="e.g. TCH001" required>
                </div>
                <div class="form-group">
                    <label for="userPassword">Password</label>
                    <div class="password-wrap">
                        <input type="password" id="userPassword" name="password" placeholder="Enter your password" required>
                        <button type="button" class="toggle-pw" id="togglePw"><i class="fa-solid fa-eye"></i></button>
                    </div>
                </div>
                <button type="submit" class="submit-btn" id="loginSubmit">
                    <span>Sign In</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- Feedback Modal -->
    <div class="modal-overlay" id="feedbackModal">
        <div class="modal-box">
            <button class="modal-close" id="feedbackClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Send Feedback</h2>
            <p class="modal-subtitle">We'd love to hear from you</p>
            <div class="modal-success" id="feedbackSuccess"></div>
            <div class="modal-error" id="feedbackError"></div>
            <form id="feedbackForm" class="modal-form">
                <div class="form-group">
                    <label for="fbName">Name <span class="optional">(optional)</span></label>
                    <input type="text" id="fbName" name="name" placeholder="Your name">
                </div>
                <div class="form-group">
                    <label for="fbEmail">Email <span class="optional">(optional)</span></label>
                    <input type="email" id="fbEmail" name="email" placeholder="your@email.com">
                </div>
                <div class="form-group">
                    <label for="fbMessage">Message</label>
                    <textarea id="fbMessage" name="message" rows="4" placeholder="Tell us what you think..." required></textarea>
                </div>
                <button type="submit" class="submit-btn">
                    <span>Send Feedback</span>
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
    </div>

    <script src="js/login.js"></script>
</body>
</html>

