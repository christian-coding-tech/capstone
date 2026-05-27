<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: index.php');
    exit;
}
$admin_name = $_SESSION['user_name'];
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
    <link rel="stylesheet" href="css/admin.css">
    <title>Admin Dashboard — ACLC Fatima</title>
</head>
<body>

    <header class="dashboard-header">
        <div class="header-left">
            <div class="school-logo"><i class="fa-solid fa-school"></i></div>
            <div class="header-titles">
                <span class="school-name">ACLC College Tacloban - Fatima Campus</span>
                <span class="page-label">Admin Dashboard</span>
            </div>
        </div>
        <div class="header-right">
            <div class="admin-info">
                <i class="fa-solid fa-circle-user"></i>
                <span><?php echo htmlspecialchars($admin_name); ?></span>
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
                <button class="tab-btn active" data-tab="pending">
                    <i class="fa-solid fa-clock"></i> Pending
                    <span class="badge" id="badge-pending"></span>
                </button>
                <button class="tab-btn" data-tab="approved">
                    <i class="fa-solid fa-circle-check"></i> Approved
                    <span class="badge badge-green" id="badge-approved"></span>
                </button>
                <button class="tab-btn" data-tab="rejected">
                    <i class="fa-solid fa-circle-xmark"></i> Rejected
                    <span class="badge badge-red" id="badge-rejected"></span>
                </button>
                <button class="tab-btn" data-tab="schedule">
                    <i class="fa-solid fa-calendar-days"></i> Schedule
                </button>
                <button class="tab-btn" data-tab="teachers">
                    <i class="fa-solid fa-chalkboard-user"></i> Teachers
                </button>
                <button class="tab-btn" data-tab="students">
                    <i class="fa-solid fa-user-graduate"></i> Students
                </button>
                <button class="tab-btn" data-tab="feedback">
                    <i class="fa-solid fa-comments"></i> Feedback
                    <span class="badge badge-yellow" id="badge-feedback"></span>
                </button>
            </div>
            <div class="date-filter" id="dateFilterWrap">
                <label>From</label>
                <input type="date" id="dateFrom">
                <label>To</label>
                <input type="date" id="dateTo">
                <button class="filter-btn" id="applyFilter"><i class="fa-solid fa-filter"></i> Filter</button>
                <button class="filter-btn clear-btn" id="clearFilter"><i class="fa-solid fa-xmark"></i> Clear</button>
            </div>
        </div>

        <div class="tab-content" id="tabContent">
            <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading...</span>
            </div>
        </div>
    </main>

    <!-- Reject Modal -->
    <div class="modal-overlay" id="rejectModal">
        <div class="modal-box">
            <button class="modal-close" id="rejectClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Reject Reservation</h2>
            <p class="modal-subtitle">Please provide a reason for rejection</p>
            <div class="modal-error" id="rejectError"></div>
            <form id="rejectForm" class="modal-form">
                <input type="hidden" id="rejectReservationId">
                <div class="form-group">
                    <label>Reason</label>
                    <textarea id="rejectionReason" rows="4" placeholder="Explain why this request is being rejected..." required></textarea>
                </div>
                <button type="submit" class="submit-btn" id="rejectSubmit">
                    <span>Confirm Rejection</span>
                    <i class="fa-solid fa-circle-xmark"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- View Proposal Modal -->
    <div class="modal-overlay" id="proposalModal">
        <div class="modal-box modal-box-wide">
            <button class="modal-close" id="proposalClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Reservation Details</h2>
            <div id="proposalContent"></div>
        </div>
    </div>

    <!-- Add Teacher Modal -->
    <div class="modal-overlay" id="addTeacherModal">
        <div class="modal-box">
            <button class="modal-close" id="addTeacherClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Add Teacher Account</h2>
            <p class="modal-subtitle">Account will be inactive until you activate it</p>
            <div class="modal-error"   id="addTeacherError"></div>
            <div class="modal-success" id="addTeacherSuccess"></div>
            <form id="addTeacherForm" class="modal-form">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="full_name" placeholder="e.g. Juan dela Cruz" required>
                </div>
                <div class="form-group">
                    <label>User ID</label>
                    <input type="text" name="user_id" placeholder="e.g. TCH002" required>
                </div>
                <div class="form-group">
                    <label>Email <span class="optional">(optional)</span></label>
                    <input type="email" name="email" placeholder="teacher@aclc.edu">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="text" name="password" placeholder="Temporary password" required>
                </div>
                <button type="submit" class="submit-btn" id="addTeacherSubmit">
                    <span>Create Account</span>
                    <i class="fa-solid fa-user-plus"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- Teacher CSV Modal -->
    <div class="modal-overlay" id="csvModal">
        <div class="modal-box modal-box-wide">
            <button class="modal-close" id="csvClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Bulk Upload Teachers</h2>
            <p class="modal-subtitle">Upload a CSV with columns: full_name, user_id, email</p>
            <div class="modal-error"   id="csvError"></div>
            <div class="modal-success" id="csvSuccess"></div>
            <div class="csv-template">
                <a href="downloads/teacher_template.csv" download class="template-link">
                    <i class="fa-solid fa-download"></i> Download Teacher CSV Template
                </a>
            </div>
            <form id="csvForm" class="modal-form">
                <div class="form-group">
                    <label>CSV File</label>
                    <div class="file-upload-wrap" id="csvFileWrap">
                        <i class="fa-solid fa-file-csv"></i>
                        <span id="csvFileLabel">Click to upload CSV file</span>
                        <input type="file" id="csvFile" accept=".csv">
                    </div>
                </div>
                <button type="submit" class="submit-btn" id="csvSubmit">
                    <span>Preview Accounts</span>
                    <i class="fa-solid fa-eye"></i>
                </button>
            </form>
            <div id="csvPreview"></div>
        </div>
    </div>

    <!-- Add Student Modal -->
    <div class="modal-overlay" id="addStudentModal">
        <div class="modal-box">
            <button class="modal-close" id="addStudentClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Add Student Account</h2>
            <p class="modal-subtitle">Account will be inactive until you activate it</p>
            <div class="modal-error"   id="addStudentError"></div>
            <div class="modal-success" id="addStudentSuccess"></div>
            <form id="addStudentForm" class="modal-form">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="full_name" placeholder="e.g. Pedro Reyes" required>
                </div>
                <div class="form-group">
                    <label>User ID</label>
                    <input type="text" name="user_id" placeholder="e.g. STU002" required>
                </div>
                <div class="form-group">
                    <label>Email <span class="optional">(optional)</span></label>
                    <input type="email" name="email" placeholder="student@aclc.edu">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="text" name="password" placeholder="Temporary password" required>
                </div>
                <button type="submit" class="submit-btn" id="addStudentSubmit">
                    <span>Create Account</span>
                    <i class="fa-solid fa-user-plus"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- Student CSV Modal -->
    <div class="modal-overlay" id="studentCsvModal">
        <div class="modal-box modal-box-wide">
            <button class="modal-close" id="studentCsvClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Bulk Upload Students</h2>
            <p class="modal-subtitle">Upload a CSV with columns: full_name, user_id, email</p>
            <div class="modal-error"   id="studentCsvError"></div>
            <div class="modal-success" id="studentCsvSuccess"></div>
            <div class="csv-template">
                <a href="downloads/student_template.csv" download class="template-link">
                    <i class="fa-solid fa-download"></i> Download Student CSV Template
                </a>
            </div>
            <form id="studentCsvForm" class="modal-form">
                <div class="form-group">
                    <label>CSV File</label>
                    <div class="file-upload-wrap" id="studentCsvFileWrap">
                        <i class="fa-solid fa-file-csv"></i>
                        <span id="studentCsvFileLabel">Click to upload CSV file</span>
                        <input type="file" id="studentCsvFile" accept=".csv">
                    </div>
                </div>
                <button type="submit" class="submit-btn" id="studentCsvSubmit">
                    <span>Preview Accounts</span>
                    <i class="fa-solid fa-eye"></i>
                </button>
            </form>
            <div id="studentCsvPreview"></div>
        </div>
    </div>

    <!-- Reset Password Modal -->
    <div class="modal-overlay" id="resetPwModal">
        <div class="modal-box">
            <button class="modal-close" id="resetPwClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Reset Password</h2>
            <p class="modal-subtitle">Set a new password for this account</p>
            <div class="modal-error"   id="resetPwError"></div>
            <div class="modal-success" id="resetPwSuccess"></div>
            <form id="resetPwForm" class="modal-form">
                <input type="hidden" id="resetPwTeacherId">
                <div class="form-group">
                    <label>New Password</label>
                    <input type="text" id="resetPwInput" placeholder="Enter new password" required>
                </div>
                <button type="submit" class="submit-btn" id="resetPwSubmit">
                    <span>Reset Password</span>
                    <i class="fa-solid fa-key"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- Deactivate Student Modal -->
    <div class="modal-overlay" id="deactivateStudentModal">
        <div class="modal-box">
            <button class="modal-close" id="deactivateStudentClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title">Deactivate Student</h2>
            <p class="modal-subtitle">Select the reason for deactivation</p>
            <div class="modal-error" id="deactivateStudentError"></div>
            <form id="deactivateStudentForm" class="modal-form">
                <input type="hidden" id="deactivateStudentId">
                <div class="form-group">
                    <label>Reason</label>
                    <select id="deactivateReason" required>
                        <option value="">Select reason</option>
                        <option value="graduated">Graduated</option>
                        <option value="transferred">Transferred</option>
                        <option value="deactivated">Other</option>
                    </select>
                </div>
                <button type="submit" class="submit-btn" id="deactivateStudentSubmit">
                    <span>Confirm Deactivation</span>
                    <i class="fa-solid fa-ban"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- Day Reservations Modal -->
    <div class="modal-overlay" id="dayModal">
        <div class="modal-box modal-box-wide">
            <button class="modal-close" id="dayClose"><i class="fa-solid fa-xmark"></i></button>
            <h2 class="modal-title" id="dayModalTitle">Reservations</h2>
            <div id="dayModalContent"></div>
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
                    Hi! I'm your Campus Assistant. I can check facility availability, answer reservation questions, and help with campus information. How can I help you?
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

    <script src="js/admin.js"></script>
</body>
</html>