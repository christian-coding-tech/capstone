# ACLC Fatima Campus Portal

The ACLC Fatima Campus Portal is a PHP and MySQL/MariaDB web application for campus navigation, reservations, schedules, feedback, and user management.

## System Description

The system provides these main features:

- Campus navigation with suggested assistant prompts, local answers for campus facilities and approved events, and a guided route planner.
- Campus map previews, route markers, landmark selection, zooming, panning, and facility previews.
- A local campus illustration preview and teacher/student profile placeholder for navigation testing. To replace the illustration with an approved campus photograph, place the photo at img/campus-photo.jpg (the page will use it automatically). Recommended dimensions: ~1600×900 or similar. The assistant's teacher and student profiles are clearly labeled fictional demo data.
- Interactive 3D campus model on the landing page.
- Student and teacher reservation workflows.
- Course-targeted campus events, student event history, personal student QR codes, event QR attendance, and host attendance tracking.
- Event hosts can authorize additional active teachers or student representatives to scan attendance QR codes.
- Teacher schedules and venue availability.
- Student, teacher, and administrator accounts.
- Administrator tools for reservations, users, feedback, and notification badges.
- Feedback submission through the landing page.
- Optional Gemini API integration for open-ended navigation questions; common campus questions work without internet access.

## Technology Stack

- PHP 8.2 or newer
- MySQL or MariaDB
- HTML, CSS, and JavaScript
- XAMPP Apache and MySQL
- Three.js and GLTFLoader for the 3D campus model
- Gemini API for the navigation assistant

## Project Structure

```text
index.php              Landing page and 3D campus model
navigation.php         Campus navigation page
login.php              Login and navigation assistant entry point
student.php            Student dashboard
teacher.php            Teacher dashboard
admin.php              Administrator dashboard
auth/                  Request handlers and API endpoints
db/                    Database connection
css/                   Page stylesheets
js/                    Page JavaScript
img/                   Images and campus media
ACLC3.glb              3D campus model
aclc_campus.sql        Database schema and sample data
```

## Local Setup

1. Install XAMPP with Apache, PHP, and MySQL/MariaDB.
2. Copy or clone this project into `C:\xampp\htdocs\capstone`.
3. Start Apache and MySQL from the XAMPP Control Panel.
4. Open phpMyAdmin at `http://localhost/phpmyadmin`.
5. Create a database named `aclc_campus`.
6. Import `aclc_campus.sql` into that database.
7. Local requests to `localhost` use the XAMPP defaults (`127.0.0.1`, database `aclc_campus`, user `root`, and a blank password). If your local MySQL settings differ, configure the `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and optional `DB_PORT` environment variables for Apache/PHP.
8. Optionally add the Gemini API key to the project configuration used by `auth/nav_chatbot_handler.php`. Campus facility and event answers use the local database and do not require the Gemini key or internet access.
9. Open the application at `http://localhost/capstone/`.

### Event attendance feature

- On an existing database, run `db/event_attendance_migration.sql` once before using the event features, followed by `db/event_qr_authorization_migration.sql` to add personal QR codes, student identity fields, and event scanner authorizations. A fresh database imported from `aclc_campus.sql` already has these tables; do not run either migration on top of that schema.
- If `db/event_attendance_migration.sql` was already run before department notifications were added, run `db/department_notifications_migration.sql` once. Do not run it after importing the updated SQL dump.
- Admins should populate student `course`, `section`, `adviser`, ID photo, and all-account `department` fields (or include the available fields in student CSV files). Reservations can target all students, one course, or a department.
- Student accounts receive a personal QR code when created. The QR itself contains only a private random token; scanning it for an approved event returns the student's full name, USN, section, program, adviser, ID photo, and the event validity period.
- Event-specific student QR passes remain visible as read-only records in Event History after the event; scans are rejected outside the event's valid check-in period.
- Only the event's submitting teacher, an additional authorized active teacher, or an authorized student representative can scan QR codes. Hosts manage additional scanners on their event card. Camera scanning requires HTTPS (or localhost) and camera permission.
- Authenticated student, teacher/staff, and admin dashboards display an event-invitation bell; visitors do not receive account notifications.
- Event hosts and their authorized scanners can review attendance rosters from the event card. Admins can review rosters from Events or an approved event on the Schedule calendar but cannot scan attendance.
- QR image generation and camera scanning use browser-loaded QR libraries; camera scanning requires HTTPS (or localhost) and camera permission.
- A dedicated loading indicator appears only while signing in or out; regular page navigation does not show a system-wide blocking loader.

Do not copy SQL statements into the database without reviewing them first. The SQL dump contains schema definitions and sample records.

## Configuration and Secrets

Never commit API keys, passwords, or private environment values. Keep local configuration files out of Git, for example:

```gitignore
config.php
imo_config.php
```

If a configuration file is ignored, create it locally after cloning and add the required constants, such as `GEMINI_API_KEY`.

## Git Workflow

### Check the current state

```bash
git status
git branch --show-current
git remote -v
```

### Pull the latest changes

Save or commit your local work first, then update your branch:

```bash
git pull --rebase origin main
```

If Git reports conflicts, resolve the marked files, stage the resolutions, and continue:

```bash
git add <resolved-file>
git rebase --continue
```

To cancel the rebase:

```bash
git rebase --abort
```

### Push your changes

```bash
git status
git add .
git commit -m "Describe the change"
git pull --rebase origin main
git push origin main
```

Only use `git add .` after checking `git status` to make sure private files, uploads, logs, and unrelated changes are not included.

### First-time remote setup

If no remote exists yet:

```bash
git remote add origin <repository-url>
git branch -M main
git push -u origin main
```

## Troubleshooting

- **Database connection failed:** confirm MySQL is running, the database exists, and `db/connection.php` matches your credentials.
- **Navigation assistant:** facility, event, and demo-profile prompts use local data. Gemini is optional and is only used for questions that need an open-ended answer.
- **3D model missing:** confirm `ACLC3.glb` is in the project root and that Apache serves it.
- **PHP changes do not appear:** refresh the browser and confirm Apache is serving the current XAMPP directory.
- **Git rejects a push:** pull with `git pull --rebase origin main`, resolve conflicts, then push again.
