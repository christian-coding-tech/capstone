-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2026 at 09:04 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aclc_campus`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_seen`
--

CREATE TABLE `admin_seen` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `tab_name` varchar(50) NOT NULL,
  `last_seen` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_seen`
--

INSERT INTO `admin_seen` (`id`, `admin_id`, `tab_name`, `last_seen`) VALUES
(1, 1, 'pending', '2026-05-28 18:57:40'),
(2, 1, 'approved', '2026-05-28 18:55:42'),
(3, 1, 'rejected', '2026-05-28 18:15:18'),
(4, 1, 'feedback', '2026-05-28 18:15:18');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(1, NULL, NULL, 'I eat shit', '2026-05-26 08:57:57'),
(2, NULL, NULL, 'hi, how are ya?', '2026-05-26 09:28:22'),
(3, NULL, NULL, 'duquwdiq', '2026-05-26 10:16:58');

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` enum('login','logout') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_id`, `action`, `timestamp`) VALUES
(1, 1, 'login', '2026-05-26 15:51:27'),
(2, 1, 'logout', '2026-05-26 16:05:45'),
(3, 4, 'login', '2026-05-26 16:05:58'),
(4, 4, 'logout', '2026-05-26 16:07:38'),
(5, 2, 'login', '2026-05-26 16:07:47'),
(6, 2, 'logout', '2026-05-26 16:08:17'),
(7, 1, 'login', '2026-05-26 16:08:25'),
(8, 1, 'logout', '2026-05-26 16:09:23'),
(9, 2, 'login', '2026-05-26 16:11:17'),
(10, 2, 'logout', '2026-05-26 16:11:55'),
(11, 1, 'login', '2026-05-26 16:12:03'),
(12, 1, 'logout', '2026-05-26 16:14:01'),
(13, 1, 'login', '2026-05-27 08:39:58'),
(14, 1, 'logout', '2026-05-27 08:47:09'),
(15, 2, 'login', '2026-05-27 08:47:17'),
(16, 2, 'logout', '2026-05-27 14:36:09'),
(17, 1, 'login', '2026-05-27 14:36:25'),
(18, 1, 'logout', '2026-05-27 14:46:43'),
(19, 1, 'login', '2026-05-28 09:18:23'),
(20, 1, 'logout', '2026-05-28 09:21:55'),
(21, 2, 'login', '2026-05-28 09:22:01'),
(22, 2, 'logout', '2026-05-28 09:22:10'),
(23, 1, 'login', '2026-05-28 09:22:15'),
(24, 1, 'logout', '2026-05-28 09:31:51'),
(25, 1, 'login', '2026-05-28 09:31:58'),
(26, 1, 'logout', '2026-05-28 09:32:02'),
(27, 2, 'login', '2026-05-28 09:32:12'),
(28, 2, 'logout', '2026-05-28 09:35:05'),
(29, 1, 'login', '2026-05-28 09:35:14'),
(30, 1, 'logout', '2026-05-28 10:00:54'),
(31, 2, 'login', '2026-05-28 10:01:14'),
(32, 2, 'logout', '2026-05-28 10:09:00'),
(33, 1, 'login', '2026-05-28 10:09:07'),
(34, 1, 'logout', '2026-05-28 10:17:46'),
(35, 1, 'login', '2026-05-28 10:18:03'),
(36, 1, 'logout', '2026-05-28 10:18:44'),
(37, 2, 'login', '2026-05-28 10:18:50'),
(38, 2, 'logout', '2026-05-28 10:19:30'),
(39, 1, 'login', '2026-05-28 10:19:36'),
(40, 1, 'logout', '2026-05-28 10:57:31'),
(41, 1, 'login', '2026-05-28 10:57:39'),
(42, 1, 'logout', '2026-05-28 10:57:49'),
(43, 2, 'login', '2026-05-28 10:57:56'),
(44, 2, 'logout', '2026-05-28 12:14:18');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `venue_id` int(11) NOT NULL,
  `event_name` varchar(100) NOT NULL,
  `date_of_use` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `proposal_pdf` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `teacher_id`, `venue_id`, `event_name`, `date_of_use`, `time_start`, `time_end`, `proposal_pdf`, `status`, `rejection_reason`, `created_at`, `is_read`, `approved_by`, `approved_at`) VALUES
(1, 2, 6, 'Meeting for Upcoming events — 203', '2026-05-27', '17:00:00', '18:00:00', 'proposal_6a156d245fd5c2.90759712.pdf', 'rejected', 'kase I don\'t want', '2026-05-26 09:51:32', 1, NULL, NULL),
(2, 2, 3, 'gwgwe', '2026-05-27', '09:19:00', '18:22:00', 'proposal_6a15734fd85a13.98467481.pdf', 'approved', NULL, '2026-05-26 10:17:51', 1, NULL, NULL),
(3, 4, 1, 'basketball competition', '2026-05-27', '13:00:00', '17:00:00', NULL, 'approved', NULL, '2026-05-26 16:07:33', 0, NULL, NULL),
(4, 2, 4, 'Meeting for Upcoming events', '2026-05-27', '18:11:00', '20:11:00', NULL, 'approved', NULL, '2026-05-26 16:11:47', 1, NULL, NULL),
(5, 2, 3, 'Meeting for Upcoming events', '2026-05-30', '10:30:00', '11:30:00', NULL, 'pending', NULL, '2026-05-28 09:32:38', 1, NULL, NULL),
(6, 2, 6, 'Meeting for Upcoming events — 203', '2026-05-29', '09:00:00', '10:00:00', NULL, 'pending', NULL, '2026-05-28 10:02:42', 1, NULL, NULL),
(7, 2, 6, 'basketball competition meeting — 203', '2026-06-02', '18:19:00', '19:20:00', NULL, 'pending', NULL, '2026-05-28 10:19:26', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `room` varchar(100) NOT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','teacher','student') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('inactive','active','deactivated') DEFAULT 'active',
  `pending_email` varchar(100) DEFAULT NULL,
  `deactivation_reason` enum('graduated','transferred','deactivated') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_id`, `password`, `full_name`, `role`, `email`, `created_at`, `status`, `pending_email`, `deactivation_reason`) VALUES
(1, 'ADMIN001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Admin', 'admin', 'admin@aclc.edu', '2026-05-26 08:02:27', 'active', NULL, NULL),
(2, 'TCH001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan dela Cruz', 'teacher', 'teacher@aclc.edu', '2026-05-26 08:02:27', 'active', NULL, NULL),
(3, 'STU001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria Santos', 'student', 'student@aclc.edu', '2026-05-26 08:02:27', 'active', NULL, NULL),
(4, 'STAFF001', '$2y$10$Fyc6bT3gNjbpd0qJ/E626OHb3btZgZVtkPpJ6Pi1ouuupDIlZeEjS', 'Mei', 'teacher', NULL, '2026-05-26 15:59:30', 'active', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `venues`
--

CREATE TABLE `venues` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venues`
--

INSERT INTO `venues` (`id`, `name`, `description`) VALUES
(1, 'Basketball Court', NULL),
(2, 'Library', NULL),
(3, 'Admin Lounge', NULL),
(4, 'Computer Lab 1', NULL),
(5, 'Computer Lab 2', NULL),
(6, 'Classroom', NULL),
(7, 'Function Hall', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_seen`
--
ALTER TABLE `admin_seen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_admin_tab` (`admin_id`,`tab_name`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `venue_id` (`venue_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `venues`
--
ALTER TABLE `venues`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_seen`
--
ALTER TABLE `admin_seen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `venues`
--
ALTER TABLE `venues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_seen`
--
ALTER TABLE `admin_seen`
  ADD CONSTRAINT `admin_seen_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`),
  ADD CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
