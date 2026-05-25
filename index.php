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
    <link rel="stylesheet" href="css/modal.css">
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
            <a href="login.php" class="admin-link" aria-label="Admin login"><i class="fa-solid fa-circle-user"></i></a>
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
                    <button class="login-btn nav-btn" type="button"><i class="fa-solid fa-location-dot"></i>Navigation</button>
                    <button class="login-btn feedback-btn" type="button"><i class="fa-solid fa-clipboard-check"></i>Feedback</button>
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

    <script src="js/login.js"></script>
</body>
</html>

