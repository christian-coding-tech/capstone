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
    <title>Admin Login</title>
</head>
<body>
    <div class="background-shape shape1"></div>
    <div class="background-shape shape2"></div>

    <div class="page-shell">
        <header class="page-header">
            <div>
                <h1 class="login-title">ACLC Fatima Campus</h1>
                <p class="login-subtitle">Admin portal login</p>
            </div>
            <a href="index.php" class="admin-link" aria-label="Back to Home"><i class="fa-solid fa-house"></i></a>
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
                    <h2 class="welcome-title">welcome bac</h2>

                    <form class="admin-login-form" method="POST" action="">
                        <label class="input-label" for="user_id">User ID</label>
                        <input class="admin-input" id="user_id" name="user_id" type="text" required autocomplete="username">

                        <label class="input-label" for="password">Password</label>
                        <input class="admin-input" id="password" name="password" type="password" required autocomplete="current-password">

                        <button class="login-btn" type="submit">
                            <i class="fa-solid fa-right-to-bracket"></i>
                            Enter
                        </button>

                        <div class="forget-row">
                            <a class="forget-link" href="#">Forget password</a>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
</body>
</html>

