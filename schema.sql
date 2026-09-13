-- ============================================================
-- SQL Schema & Seed Database: Sistem Absensi Siswa PKL
-- Bisa dijalankan di MySQL Lokal (XAMPP/Workbench) ataupun Cloud (Railway/Aiven/PlanetScale)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `pkl_activities`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. TABEL USERS
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'siswa') NOT NULL DEFAULT 'siswa',
  `photo` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL STUDENTS
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `nis` VARCHAR(30) NOT NULL UNIQUE,
  `class` VARCHAR(50) NOT NULL,
  `major` VARCHAR(100) NOT NULL,
  `tempat_pkl` VARCHAR(150) NOT NULL,
  `alamat_rumah` TEXT DEFAULT NULL,
  `alamat_pkl` TEXT DEFAULT NULL,
  `target_lat` DECIMAL(10, 8) DEFAULT -6.404419,
  `target_lng` DECIMAL(11, 8) DEFAULT 106.791996,
  `home_lat` DECIMAL(10, 8) DEFAULT NULL,
  `home_lng` DECIMAL(11, 8) DEFAULT NULL,
  `radius_meters` INT DEFAULT 50,
  `home_radius_meters` INT DEFAULT 50,
  `profile_updated` TINYINT(1) DEFAULT 0,
  `pembimbing_id` INT DEFAULT NULL,
  `periode_mulai` DATE NOT NULL,
  `periode_selesai` DATE NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_students_pembimbing` FOREIGN KEY (`pembimbing_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL ATTENDANCE
CREATE TABLE `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `attendance_date` DATE NOT NULL,
  `attendance_time` TIME NOT NULL,
  `photo` LONGTEXT DEFAULT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `location` TEXT DEFAULT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `status` ENUM('hadir', 'izin', 'sakit') NOT NULL DEFAULT 'hadir',
  `work_mode` VARCHAR(20) DEFAULT 'wfo',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_student_date` (`student_id`, `attendance_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL PKL_ACTIVITIES
CREATE TABLE `pkl_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `activity_date` DATE NOT NULL,
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_activities_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA AWAL (USERS & STUDENTS)
-- Password Admin/SuperAdmin: password123
-- Password Siswa: 123456
-- ============================================================

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `role`, `photo`) VALUES
(1, 'Super Administrator', 'superadmin', 'superadmin@sekolah.sch.id', '$2b$10$ydZC0thaeaSFpzWJbduaQOikHP0IXtsHVULVXlHCoFZVDb6kFGbC.', 'super_admin', '/default-avatar.png'),
(2, 'Pak Ridwan', 'pak ridwan', 'pembimbing@sekolah.sch.id', '$2b$10$ydZC0thaeaSFpzWJbduaQOikHP0IXtsHVULVXlHCoFZVDb6kFGbC.', 'admin', '/default-avatar.png'),
(3, 'Narendra Bintang Ramadan', '242510072', 'narendra@sekolah.sch.id', '$2b$10$8xfNWV2RAvFh6d2z8z5vTOP5w2DDQDSjpXTCgLf8aibZ1IUe68jMK', 'siswa', '/default-avatar.png'),
(4, 'Rakha Zuhdi Naufal', '242510078', 'rakha@sekolah.sch.id', '$2b$10$8xfNWV2RAvFh6d2z8z5vTOP5w2DDQDSjpXTCgLf8aibZ1IUe68jMK', 'siswa', '/default-avatar.png'),
(5, 'Satria Arief Wibowo', '242510082', 'satria@sekolah.sch.id', '$2b$10$8xfNWV2RAvFh6d2z8z5vTOP5w2DDQDSjpXTCgLf8aibZ1IUe68jMK', 'siswa', '/default-avatar.png'),
(6, 'Nisa Amalia', '242510085', 'nisa@sekolah.sch.id', '$2b$10$8xfNWV2RAvFh6d2z8z5vTOP5w2DDQDSjpXTCgLf8aibZ1IUe68jMK', 'siswa', '/default-avatar.png'),
(7, 'Muhammad Farhan', '242510090', 'farhan@sekolah.sch.id', '$2b$10$8xfNWV2RAvFh6d2z8z5vTOP5w2DDQDSjpXTCgLf8aibZ1IUe68jMK', 'siswa', '/default-avatar.png'),
(8, 'Aulia Putri', '242510095', 'aulia@sekolah.sch.id', '$2b$10$8xfNWV2RAvFh6d2z8z5vTOP5w2DDQDSjpXTCgLf8aibZ1IUe68jMK', 'siswa', '/default-avatar.png');

INSERT INTO `students` (`id`, `user_id`, `nis`, `class`, `major`, `tempat_pkl`, `alamat_rumah`, `alamat_pkl`, `target_lat`, `target_lng`, `home_lat`, `home_lng`, `radius_meters`, `home_radius_meters`, `profile_updated`, `pembimbing_id`, `periode_mulai`, `periode_selesai`) VALUES
(1, 3, '242510072', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Naikmarketing', 'Jl. Pringgondani VII No. 29, kelurahan Sukatani, kecamatan Tapos, kota Depok - 16454', 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435', -6.40441900, 106.79199600, -6.38354200, 106.89972200, 50, 50, 0, 2, '2026-07-01', '2026-12-31'),
(2, 4, '242510078', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Naikmarketing', 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418', 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435', -6.40441900, 106.79199600, -6.38828000, 106.85436700, 50, 50, 0, 2, '2026-07-01', '2026-12-31'),
(3, 5, '242510082', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Naikmarketing', 'Jl. Arrahman V No. 191, kelurahan Sukatani, kecamatan Tapos, kota Depok - 16464', 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435', -6.40441900, 106.79199600, -6.39168900, 106.88061100, 50, 50, 0, 2, '2026-07-01', '2026-12-31'),
(4, 6, '242510085', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Naikmarketing', 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418', 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435', -6.40441900, 106.79199600, -6.39674200, 106.83922800, 50, 50, 0, 2, '2026-07-01', '2026-12-31'),
(5, 7, '242510090', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Naikmarketing', 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418', 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435', -6.40441900, 106.79199600, -6.39674200, 106.83922800, 50, 50, 0, 2, '2026-07-01', '2026-12-31'),
(6, 8, '242510095', 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Naikmarketing', 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418', 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435', -6.40441900, 106.79199600, -6.39674200, 106.83922800, 50, 50, 0, 2, '2026-07-01', '2026-12-31');
