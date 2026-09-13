const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Auto-load .env.local or .env if exists
['.env.local', '.env'].forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        const k = key.trim();
        const v = vals.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    });
  }
});

async function freshDatabase() {
  const uri = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;
  const host = process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306');
  const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE || 'absensi_pkl';

  console.log('====================================================');
  console.log('🔄 RESET & INISIALISASI ULANG DATABASE (FRESH)');
  console.log('====================================================');

  let connection;
  try {
    if (uri) {
      console.log('Connecting to MySQL via URI...');
      connection = await mysql.createConnection(uri);
    } else {
      console.log(`Connecting to MySQL at ${host}:${port}...`);
      connection = await mysql.createConnection({ host, port, user, password });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.query(`USE \`${database}\`;`);
    }

    console.log('🗑️  Menghapus tabel-tabel lama (DROP TABLES)...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('DROP TABLE IF EXISTS `password_resets`;');
    await connection.query('DROP TABLE IF EXISTS `profile_updates`;');
    await connection.query('DROP TABLE IF EXISTS `user_photos`;');
    await connection.query('DROP TABLE IF EXISTS `pkl_activities`;');
    await connection.query('DROP TABLE IF EXISTS `attendance`;');
    await connection.query('DROP TABLE IF EXISTS `students`;');
    await connection.query('DROP TABLE IF EXISTS `users`;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Semua tabel lama berhasil dihapus bersih.');

    console.log('🏗️  Membuat struktur tabel baru (CREATE TABLES)...');

    await connection.query(`
      CREATE TABLE \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'siswa') NOT NULL DEFAULT 'siswa',
        \`photo\` TEXT DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE \`students\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`nis\` VARCHAR(30) NOT NULL UNIQUE,
        \`class\` VARCHAR(50) NOT NULL,
        \`major\` VARCHAR(100) NOT NULL,
        \`tempat_pkl\` VARCHAR(150) NOT NULL,
        \`alamat_rumah\` TEXT DEFAULT NULL,
        \`alamat_pkl\` TEXT DEFAULT NULL,
        \`target_lat\` DECIMAL(10, 8) DEFAULT -6.404419,
        \`target_lng\` DECIMAL(11, 8) DEFAULT 106.791996,
        \`home_lat\` DECIMAL(10, 8) DEFAULT NULL,
        \`home_lng\` DECIMAL(11, 8) DEFAULT NULL,
        \`radius_meters\` INT DEFAULT 50,
        \`home_radius_meters\` INT DEFAULT 50,
        \`profile_updated\` TINYINT(1) DEFAULT 0,
        \`pembimbing_id\` INT DEFAULT NULL,
        \`periode_mulai\` DATE NOT NULL,
        \`periode_selesai\` DATE NOT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_students_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_students_pembimbing\` FOREIGN KEY (\`pembimbing_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE \`attendance\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`student_id\` INT NOT NULL,
        \`attendance_date\` DATE NOT NULL,
        \`attendance_time\` TIME NOT NULL,
        \`photo\` LONGTEXT DEFAULT NULL,
        \`latitude\` DECIMAL(10, 8) NOT NULL,
        \`longitude\` DECIMAL(11, 8) NOT NULL,
        \`location\` TEXT DEFAULT NULL,
        \`reason\` VARCHAR(255) DEFAULT NULL,
        \`note\` TEXT DEFAULT NULL,
        \`status\` ENUM('hadir', 'izin', 'sakit') NOT NULL DEFAULT 'hadir',
        \`work_mode\` VARCHAR(20) DEFAULT 'wfo',
        \`device_id\` VARCHAR(100) DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_attendance_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE,
        UNIQUE KEY \`unique_student_date\` (\`student_id\`, \`attendance_date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE \`pkl_activities\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`student_id\` INT NOT NULL,
        \`title\` VARCHAR(150) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`activity_date\` DATE NOT NULL,
        \`start_time\` TIME DEFAULT NULL,
        \`end_time\` TIME DEFAULT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_activities_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE \`user_photos\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`photo\` LONGTEXT NOT NULL,
        \`uploaded_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_user_photos_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE \`profile_updates\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`name\` VARCHAR(100) DEFAULT NULL,
        \`email\` VARCHAR(100) DEFAULT NULL,
        \`bio\` TEXT DEFAULT NULL,
        \`alamat_rumah\` TEXT DEFAULT NULL,
        \`alamat_pkl\` TEXT DEFAULT NULL,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_profile_updates_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE \`password_resets\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`action\` VARCHAR(50) NOT NULL DEFAULT 'change_password',
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'success',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_password_resets_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ 7 Tabel berhasil dibuat.');

    console.log('🌱 Melakukan seeding data awal akun...');
    const defaultAdminPass = await bcrypt.hash('password123', 10);
    const defaultSiswaPass = await bcrypt.hash('123456', 10);

    // Admin / Pembimbing
    await connection.query(`
      INSERT INTO users (name, username, email, password, role, photo)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Pak Ridwan', 'pak ridwan', 'pembimbing@sekolah.sch.id', defaultAdminPass, 'admin', '/default-avatar.png']);

    const [adminRows] = await connection.query(`SELECT id FROM users WHERE role='admin' LIMIT 1`);
    const pembimbingId = adminRows[0]?.id || null;

    const studentList = [
      {
        nipd: '242510072',
        name: 'Narendra Bintang Ramadan',
        email: 'narendra@sekolah.sch.id',
        tempat: 'PT Naikmarketing',
        alamat_rumah: 'Jl. Pringgondani VII No. 29, kelurahan Sukatani, kecamatan Tapos, kota Depok - 16454',
        alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
        home_lat: -6.383542,
        home_lng: 106.899722,
        home_radius_meters: 50
      },
      {
        nipd: '242510078',
        name: 'Rakha Zuhdi Naufal',
        email: 'rakha@sekolah.sch.id',
        tempat: 'PT Naikmarketing',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
        home_lat: -6.388280,
        home_lng: 106.854367,
        home_radius_meters: 50
      },
      {
        nipd: '242510082',
        name: 'Satria Arief Wibowo',
        email: 'satria@sekolah.sch.id',
        tempat: 'PT Naikmarketing',
        alamat_rumah: 'Jl. Arrahman V No. 191, kelurahan Sukatani, kecamatan Tapos, kota Depok - 16464',
        alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
        home_lat: -6.391689,
        home_lng: 106.880611,
        home_radius_meters: 50
      },
      {
        nipd: '242510085',
        name: 'Nisa Amalia',
        email: 'nisa@sekolah.sch.id',
        tempat: 'PT Naikmarketing',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
        home_lat: -6.396742,
        home_lng: 106.839228,
        home_radius_meters: 50
      },
      {
        nipd: '242510090',
        name: 'Muhammad Farhan',
        email: 'farhan@sekolah.sch.id',
        tempat: 'PT Naikmarketing',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
        home_lat: -6.396742,
        home_lng: 106.839228,
        home_radius_meters: 50
      },
      {
        nipd: '242510095',
        name: 'Aulia Putri',
        email: 'aulia@sekolah.sch.id',
        tempat: 'PT Naikmarketing',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
        home_lat: -6.396742,
        home_lng: 106.839228,
        home_radius_meters: 50
      }
    ];

    for (const st of studentList) {
      await connection.query(`
        INSERT INTO users (name, username, email, password, role, photo)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [st.name, st.nipd, st.email, defaultSiswaPass, 'siswa', '/default-avatar.png']);

      const [uRows] = await connection.query(`SELECT id FROM users WHERE username=? LIMIT 1`, [st.nipd]);
      const userId = uRows[0]?.id;

      if (userId) {
        await connection.query(`
          INSERT INTO students (user_id, nis, class, major, tempat_pkl, alamat_rumah, alamat_pkl, target_lat, target_lng, home_lat, home_lng, radius_meters, home_radius_meters, pembimbing_id, periode_mulai, periode_selesai)
          VALUES (?, ?, 'XII RPL 1', 'Rekayasa Perangkat Lunak', ?, ?, ?, -6.404419, 106.791996, ?, ?, 50, ?, ?, '2026-07-01', '2026-12-31')
        `, [userId, st.nipd, st.tempat, st.alamat_rumah, st.alamat_pkl, st.home_lat || null, st.home_lng || null, st.home_radius_meters || 50, pembimbingId]);
      }
    }

    console.log('✅ Data Super Admin, Pak Ridwan, dan 6 Siswa berhasil di-seed.');
    console.log('====================================================');
    console.log('🎉 DATABASE BERHASIL DIRESET & DIJALANKAN ULANG DENGAN BERSIH!');
    console.log('====================================================');
    await connection.end();
  } catch (error) {
    console.error('❌ Error fresh database:', error.message);
    process.exit(1);
  }
}

freshDatabase();
