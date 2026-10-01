# ACLC Fatima Campus Portal

The ACLC Fatima Campus Portal is a PHP and MySQL/MariaDB web application for campus navigation, reservations, schedules, feedback, and user management.

## System Description

The system provides these main features:

- Campus navigation with an AI-assisted conversation flow.
- Campus map previews, route markers, landmark selection, zooming, panning, and facility previews.
- Interactive 3D campus model on the landing page.
- Student and teacher reservation workflows.
- Course-targeted campus events, student event history, QR attendance, and host/admin attendance tracking.
- Teacher schedules and venue availability.
- Student, teacher, and administrator accounts.
- Administrator tools for reservations, users, feedback, and notification badges.
- Feedback submission through the landing page.
- Gemini API integration for navigation assistance.

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
7. Configure the database credentials in `db/connection.php` if your local credentials differ.
8. Add the Gemini API key to the project configuration used by `auth/nav_chatbot_handler.php`.
9. Open the application at `http://localhost/capstone/`.

### Event attendance feature

- On an existing database, run `db/event_attendance_migration.sql` once before using the event features. A fresh database imported from the updated `aclc_campus.sql` already has the required columns and table; do not run the migration on top of that schema.
- If `db/event_attendance_migration.sql` was already run before department notifications were added, run `db/department_notifications_migration.sql` once. Do not run it after importing the updated SQL dump.
- Admins should populate student `course` and all-account `department` fields (or include them in the student/teacher CSV files). Reservations can target all students, one course, or a department.
- Students find approved events under Event History. Their personal QR is used by the teacher/staff host or an admin to check them in during the scheduled event.
- Authenticated student, teacher/staff, and admin dashboards display an event-invitation bell; visitors do not receive account notifications.
- Teachers/staff can review hosted event rosters from Hosted Events. Admins can review them from Events or from an approved event on the Schedule calendar.
- QR creation and scanning use browser-loaded QR libraries; camera scanning requires HTTPS (or localhost) and camera permission.

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
- **Navigation assistant unavailable:** verify the Gemini API key and internet connection.
- **3D model missing:** confirm `ACLC3.glb` is in the project root and that Apache serves it.
- **PHP changes do not appear:** refresh the browser and confirm Apache is serving the current XAMPP directory.
- **Git rejects a push:** pull with `git pull --rebase origin main`, resolve conflicts, then push again.
