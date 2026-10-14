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
    <link rel="stylesheet" href="css\login.css">
    <link rel="stylesheet" href="css/action-loading.css">
    <title>ACLC Fatima Campus</title>
</head>
<body>
    <div class="background-shape shape1"></div>
    <div class="background-shape shape2"></div>

    <!-- Navigation blur overlay -->
    <div class="nav-blur-overlay" id="navBlurOverlay"></div>

    <div class="page-shell" id="pageShell">
        <header class="page-header">
            <div>
                <h1 class="login-title">ACLC Fatima Campus</h1>
                <p class="login-subtitle">Explore campus, find events, and share feedback.</p>
            </div>
            <button class="admin-link" id="loginToggle" aria-label="Sign in">
                <i class="fa-solid fa-circle-user"></i>
                <span>Sign in</span>
            </button>
        </header>

        <main class="login-card">
            <div class="content-wrapper">
                <div class="login-image" id="modelContainer">
                    <div class="model-eyebrow"><i class="fa-solid fa-cube"></i> Explore the campus</div>
                    <div class="model-frame" id="modelFrame">
                        <div class="model-glow"></div>
                        <canvas id="threeCanvas" class="model-preview"></canvas>
                        <div class="model-loading" id="modelLoading"><span></span> Loading campus model</div>
                        <div class="model-label" id="modelLabel">ACLC Fatima Campus</div>
                    </div>
                    <div class="model-caption">
                        <strong>ACLC Fatima Campus</strong>
                        <span>Interactive campus preview</span>
                    </div>
                </div>

                <div class="login-container">
                    <p class="login-kicker">Campus portal</p>
                    <h2 class="login-heading">What would you like to do?</h2>
                    <p class="login-copy">Find a place, explore campus events, or send us feedback.</p>
                    <a href="navigation.php" class="login-btn nav-btn" id="navBtn">
                        <i class="fa-solid fa-location-dot"></i>Explore campus
                    </a>
                    <button class="login-btn feedback-btn" id="feedbackToggle">
                        <i class="fa-solid fa-clipboard-check"></i>Send feedback
                    </button>
                    <div class="login-trust"><i class="fa-solid fa-shield-halved"></i><span>Built for ACLC Fatima Campus students and staff</span></div>
                </div>
            </div>
        </main>

        <section class="campus-overview" aria-labelledby="campusOverviewTitle">
            <div class="overview-heading">
                <div>
                    <p class="login-kicker">Your campus, at a glance</p>
                    <h2 id="campusOverviewTitle">Quick links</h2>
                </div>
                <span class="overview-status"><i class="fa-solid fa-circle"></i> Portal online</span>
            </div>
            <div class="overview-grid">
                <a class="overview-card" href="navigation.php">
                    <span class="overview-icon overview-blue"><i class="fa-solid fa-location-dot"></i></span>
                    <span><strong>Campus navigation</strong><small>Find buildings, rooms, facilities, and landmarks.</small></span>
                    <i class="fa-solid fa-arrow-up-right-from-square overview-arrow"></i>
                </a>
                <a class="overview-card" href="navigation.php">
                    <span class="overview-icon overview-green"><i class="fa-solid fa-compass"></i></span>
                    <span><strong>Explore key areas</strong><small>Preview the Main Building, Library, Court, and Cafeteria.</small></span>
                    <i class="fa-solid fa-arrow-up-right-from-square overview-arrow"></i>
                </a>
                <a class="overview-card" href="navigation.php#campusEventsTitle">
                    <span class="overview-icon overview-blue"><i class="fa-solid fa-calendar-days"></i></span>
                    <span><strong>Campus events</strong><small>Browse the campus calendar and upcoming activities.</small></span>
                    <i class="fa-solid fa-arrow-up-right-from-square overview-arrow"></i>
                </a>
                <button class="overview-card" type="button" id="overviewFeedback">
                    <span class="overview-icon overview-amber"><i class="fa-solid fa-message"></i></span>
                    <span><strong>Share feedback</strong><small>Help improve the campus experience for everyone.</small></span>
                    <i class="fa-solid fa-arrow-right overview-arrow"></i>
                </button>
            </div>
            <div class="overview-facts" aria-label="Campus facts">
                <span><i class="fa-solid fa-building"></i> Main Building</span>
                <span><i class="fa-solid fa-book-open"></i> Library</span>
                <span><i class="fa-solid fa-laptop"></i> Computer Labs</span>
                <span><i class="fa-solid fa-basketball"></i> Activity Court</span>
                <span><i class="fa-solid fa-utensils"></i> Cafeteria</span>
            </div>
        </section>

        <section class="update-log" aria-labelledby="updateLogTitle">
            <div class="update-log-heading">
                <div>
                    <p class="login-kicker">Latest improvements</p>
                    <h2 id="updateLogTitle">Update log</h2>
                </div>
                <span class="update-log-badge"><i class="fa-solid fa-sparkles"></i> Fresh for campus</span>
            </div>
            <ol class="update-log-list">
                <li class="update-log-item">
                    <span class="update-log-icon"><i class="fa-solid fa-mobile-screen-button"></i></span>
                    <div>
                        <h3>Better on mobile</h3>
                        <p>The landing page and sign-in form adapt to smaller screens without sideways scrolling.</p>
                    </div>
                </li>
                <li class="update-log-item">
                    <span class="update-log-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></span>
                    <div>
                        <h3>Smoother experience</h3>
                        <p>Subtle motion and clearer touch-friendly controls make the portal easier to explore.</p>
                    </div>
                </li>
                <li class="update-log-item">
                    <span class="update-log-icon"><i class="fa-solid fa-compass"></i></span>
                    <div>
                        <h3>Campus tools up front</h3>
                        <p>Jump into navigation, campus highlights, and feedback right from the home page.</p>
                    </div>
                </li>
            </ol>
        </section>
    </div>

    <!-- Navigation exit button -->
    <button class="nav-close-btn" id="navCloseBtn" style="display:none;">
        <i class="fa-solid fa-xmark"></i> Exit Navigation
    </button>

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

    <!-- Navigation Chatbot -->
    <div class="nav-chatbot-panel" id="navChatbotPanel" style="display:none;">
        <div class="nav-chatbot-header">
            <div class="nav-chatbot-title">
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

    <!-- Navigation chatbot minimized tab -->
    <button class="nav-chatbot-tab" id="navChatbotTab" style="display:none;">
        <i class="fa-solid fa-robot"></i>
        <span>Campus Assistant</span>
    </button>

    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
    <script src="js/model_viewer.js"></script>
    <div class="action-loader" id="actionLoader" role="status" aria-live="polite" aria-hidden="true">
        <div class="action-loader-card">
            <div class="action-loader-spinner" aria-hidden="true"></div>
            <div class="action-loader-copy">
                <p class="action-loader-title">Please wait</p>
                <p class="action-loader-caption" id="actionLoaderCaption">Working…</p>
            </div>
        </div>
    </div>
    <script src="js/action-loading.js"></script>
    <script src="js/login.js"></script>
</body>
</html>