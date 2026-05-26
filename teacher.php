<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    header('Location: index.php');
    exit;
}
$teacher_name = $_SESSION['user_name'];
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
    <title>Teacher Dashboard — ACLC Fatima</title>
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
                <span class="page-label">Teacher Dashboard</span>
            </div>
        </div>
        <div class="header-right">
            <div class="teacher-info">
                <i class="fa-solid fa-circle-user"></i>
                <span><?php echo htmlspecialchars($teacher_name); ?></span>
            </div>
            <a href="auth/logout.php" class="logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Logout</span>
            </a>
        </div>
    </header>

    <!-- Main -->
    <main class="dashboard-main">

        <!-- Tabs -->
        <div class="tabs-wrapper">
            <div class="tabs">
                <button class="tab-btn active" data-tab="pending">
                    <i class="fa-solid fa-clock"></i>
                    Pending
                    <span class="badge" id="badge-pending"></span>
                </button>
                <button class="tab-btn" data-tab="approved">
                    <i class="fa-solid fa-circle-check"></i>
                    Approved
                    <span class="badge badge-green" id="badge-approved"></span>
                </button>
                <button class="tab-btn" data-tab="rejected">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Rejected
                    <span class="badge badge-red" id="badge-rejected"></span>
                </button>
            </div>

            <!-- Date Filter -->
            <div class="date-filter">
                <label>From</label>
                <input type="date" id="dateFrom">
                <label>To</label>
                <input type="date" id="dateTo">
                <button class="filter-btn" id="applyFilter">
                    <i class="fa-solid fa-filter"></i> Filter
                </button>
                <button class="filter-btn clear-btn" id="clearFilter">
                    <i class="fa-solid fa-xmark"></i> Clear
                </button>
            </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content" id="tabContent">
            <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading...</span>
            </div>
        </div>

    </main>

    <!-- Floating + Button -->
    <button class="fab-btn" id="fabBtn" title="New Reservation">
        <i class="fa-solid fa-plus"></i>
    </button>

    <!-- Reservation Form Modal -->
    <div class="modal-overlay" id="reservationModal">
        <div class="modal-box">
            <button class="modal-close" id="reservationClose">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <h2 class="modal-title">New Reservation Request</h2>
            <p class="modal-subtitle">Fill in the details below to submit your request</p>
            <div class="modal-error" id="reservationError"></div>
            <div class="modal-success" id="reservationSuccess"></div>
            <form id="reservationForm" class="modal-form" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Proposal PDF <span class="optional">(optional, max 5MB)</span></label>
                    <div class="file-upload-wrap" id="fileUploadWrap">
                        <i class="fa-solid fa-file-pdf"></i>
                        <span id="fileLabel">Click to upload or drag & drop</span>
                        <input type="file" id="proposalPdf" name="proposal_pdf" accept=".pdf">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="dateOfUse">Date of Usage</label>
                        <input type="date" id="dateOfUse" name="date_of_use" required>
                    </div>
                <div class="form-group">
                    <label for="venueSelect">Venue</label>
                    <select id="venueSelect" name="venue_id" required>
                        <option value="">Select a venue</option>
                    </select>
                </div>
                <div class="form-group" id="roomFieldWrap" style="display:none;">
                    <label for="roomNumber">Room Number / Name</label>
                    <input type="text" id="roomNumber" name="room_number" placeholder="e.g. Room 101, Room 203...">
                </div>
                </div>
                <div class="form-group">
                    <label for="eventName">Event</label>
                    <input type="text" id="eventName" name="event_name" placeholder="e.g. Leadership Seminar, Club Meeting..." required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="timeStart">Time Start</label>
                        <input type="time" id="timeStart" name="time_start" required>
                    </div>
                    <div class="form-group">
                        <label for="timeEnd">Time End</label>
                        <input type="time" id="timeEnd" name="time_end" required>
                    </div>
                </div>
                <button type="submit" class="submit-btn" id="reservationSubmit">
                    <span>Submit Request</span>
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- Print Modal -->
    <div class="modal-overlay" id="printModal">
        <div class="modal-box modal-box-wide">
            <button class="modal-close" id="printClose">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div id="printContent">
                <!-- filled by JS -->
            </div>
            <div class="print-actions">
                <button class="submit-btn" onclick="window.print()">
                    <i class="fa-solid fa-print"></i>
                    <span>Print</span>
                </button>
            </div>
        </div>
    </div>

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