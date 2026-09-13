import pool from './db.js';
import bcrypt from 'bcryptjs';

let mockUsers = [
  {
    id: 1,
    name: 'Super Administrator',
    username: 'superadmin',
    email: 'superadmin@sekolah.sch.id',
    password: '$2b$10$OzjlPhuNDmMsYlvN/eMr5u94FYrrvN/lX/u1Lw2LFxjJ/cPDrLmi.',
    role: 'super_admin',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Pak Ridwan',
    username: 'pak ridwan',
    email: 'pembimbing@sekolah.sch.id',
    password: '$2b$10$OzjlPhuNDmMsYlvN/eMr5u94FYrrvN/lX/u1Lw2LFxjJ/cPDrLmi.',
    role: 'admin',
    photo: '/default-avatar.png',
    bio: 'Pembimbing Praktik Kerja Lapangan (PKL) yang bertugas memantau kedisiplinan presensi, meninjau laporan jurnal aktivitas harian, serta memberikan penilaian dan bimbingan teknis berkala kepada siswa PKL di instansi mitra.',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Narendra Bintang Ramadan',
    username: '242510072',
    email: 'narendra@sekolah.sch.id',
    password: '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y',
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Rakha Zuhdi Naufal',
    username: '242510078',
    email: 'rakha@sekolah.sch.id',
    password: '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y',
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Satria Arief Wibowo',
    username: '242510082',
    email: 'satria@sekolah.sch.id',
    password: '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y',
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Nisa Amalia',
    username: '242510085',
    email: 'nisa@sekolah.sch.id',
    password: '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y',
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    name: 'Muhammad Farhan',
    username: '242510090',
    email: 'farhan@sekolah.sch.id',
    password: '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y',
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    name: 'Aulia Putri',
    username: '242510095',
    email: 'aulia@sekolah.sch.id',
    password: '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y',
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  }
];

export function getJakartaDateStr(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(date);
}

export function getJakartaTimeStr(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

let mockStudents = [
  {
    id: 1,
    user_id: 3,
    nis: '242510072',
    class: 'XII RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: 'PT Naikmarketing',
    pembimbing_id: 2,
    pembimbing_name: 'Pak Ridwan',
    status: 'Aktif PKL',
    periode_mulai: '2026-07-01',
    periode_selesai: '2026-12-31',
    name: 'Narendra Bintang Ramadan',
    email: 'narendra@sekolah.sch.id',
    photo: '/default-avatar.png',
    bio: '',
    alamat_rumah: 'Jl. Pringgondani VII No. 29, kelurahan Sukatani, kecamatan Tapos, kota Depok - 16454',
    alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
    target_lat: -6.404419,
    target_lng: 106.791996,
    radius_meters: 50,
    home_lat: -6.383542,
    home_lng: 106.899722,
    home_radius_meters: 50
  },
  {
    id: 2,
    user_id: 4,
    nis: '242510078',
    class: 'XII RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: 'PT Naikmarketing',
    pembimbing_id: 2,
    pembimbing_name: 'Pak Ridwan',
    status: 'Aktif PKL',
    periode_mulai: '2026-07-01',
    periode_selesai: '2026-12-31',
    name: 'Rakha Zuhdi Naufal',
    email: 'rakha@sekolah.sch.id',
    photo: '/default-avatar.png',
    bio: '',
    alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
    alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
    target_lat: -6.404419,
    target_lng: 106.791996,
    radius_meters: 50,
    home_lat: -6.388280,
    home_lng: 106.854367,
    home_radius_meters: 50
  },
  {
    id: 3,
    user_id: 5,
    nis: '242510082',
    class: 'XII RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: 'PT Naikmarketing',
    pembimbing_id: 2,
    pembimbing_name: 'Pak Ridwan',
    status: 'Aktif PKL',
    periode_mulai: '2026-07-01',
    periode_selesai: '2026-12-31',
    name: 'Satria Arief Wibowo',
    email: 'satria@sekolah.sch.id',
    photo: '/default-avatar.png',
    bio: '',
    alamat_rumah: 'Jl. Arrahman V No. 191, kelurahan Sukatani, kecamatan Tapos, kota Depok - 16464',
    alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
    target_lat: -6.404419,
    target_lng: 106.791996,
    radius_meters: 50,
    home_lat: -6.391689,
    home_lng: 106.880611,
    home_radius_meters: 50
  },
  {
    id: 4,
    user_id: 6,
    nis: '242510085',
    class: 'XII RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: 'PT Naikmarketing',
    pembimbing_id: 2,
    pembimbing_name: 'Pak Ridwan',
    status: 'Aktif PKL',
    periode_mulai: '2026-07-01',
    periode_selesai: '2026-12-31',
    name: 'Nisa Amalia',
    email: 'nisa@sekolah.sch.id',
    photo: '/default-avatar.png',
    bio: '',
    alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
    alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
    target_lat: -6.404419,
    target_lng: 106.791996,
    radius_meters: 50,
    home_lat: -6.396742,
    home_lng: 106.839228,
    home_radius_meters: 50
  },
  {
    id: 5,
    user_id: 7,
    nis: '242510090',
    class: 'XII RPL 2',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: 'PT Naikmarketing',
    pembimbing_id: 2,
    pembimbing_name: 'Pak Ridwan',
    status: 'Aktif PKL',
    periode_mulai: '2026-07-01',
    periode_selesai: '2026-12-31',
    name: 'Muhammad Farhan',
    email: 'farhan@sekolah.sch.id',
    photo: '/default-avatar.png',
    bio: '',
    alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
    alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
    target_lat: -6.404419,
    target_lng: 106.791996,
    radius_meters: 50,
    home_lat: -6.396742,
    home_lng: 106.839228,
    home_radius_meters: 50
  },
  {
    id: 6,
    user_id: 8,
    nis: '242510095',
    class: 'XII RPL 2',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: 'PT Naikmarketing',
    pembimbing_id: 2,
    pembimbing_name: 'Pak Ridwan',
    status: 'Aktif PKL',
    periode_mulai: '2026-07-01',
    periode_selesai: '2026-12-31',
    name: 'Aulia Putri',
    email: 'aulia@sekolah.sch.id',
    photo: '/default-avatar.png',
    bio: '',
    alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
    alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
    target_lat: -6.404419,
    target_lng: 106.791996,
    radius_meters: 50,
    home_lat: -6.396742,
    home_lng: 106.839228,
    home_radius_meters: 50
  }
];

let mockAttendance = [];
let mockActivities = [];

let dbConnectionStatus = null;
let lastDbCheckTime = 0;

let isInitializingDb = false;

async function ensureDatabaseInitialized() {
  if (!pool || isInitializingDb) return;
  isInitializingDb = true;
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'users'");
    if (!tables || tables.length === 0) {
      console.log('Database tables not found. Auto-initializing schema & seed data...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(100) NOT NULL,
          \`username\` VARCHAR(50) NOT NULL UNIQUE,
          \`email\` VARCHAR(100) NOT NULL UNIQUE,
          \`password\` VARCHAR(255) NOT NULL,
          \`role\` ENUM('super_admin', 'admin', 'siswa') NOT NULL DEFAULT 'siswa',
          \`photo\` TEXT DEFAULT NULL,
          \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`students\` (
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

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`attendance\` (
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

      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`pkl_activities\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`student_id\` INT NOT NULL,
          \`title\` VARCHAR(150) NOT NULL,
          \`description\` TEXT NOT NULL,
          \`activity_date\` DATE NOT NULL,
          \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT \`fk_activities_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const bcrypt = (await import('bcryptjs')).default;
      const defaultAdminPass = await bcrypt.hash('password123', 10);
      const defaultSiswaPass = await bcrypt.hash('123456', 10);

      await pool.query(`
        INSERT INTO users (name, username, email, password, role, photo)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name);
      `, ['Super Administrator', 'superadmin', 'superadmin@sekolah.sch.id', defaultAdminPass, 'super_admin', '/default-avatar.png']);

      await pool.query(`
        INSERT INTO users (name, username, email, password, role, photo)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), username=VALUES(username);
      `, ['Pak Ridwan', 'pak ridwan', 'pembimbing@sekolah.sch.id', defaultAdminPass, 'admin', '/default-avatar.png']);

      const [adminRows] = await pool.query(`SELECT id FROM users WHERE role='admin' LIMIT 1`);
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
        await pool.query(`
          INSERT INTO users (name, username, email, password, role, photo)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name);
        `, [st.name, st.nipd, st.email, defaultSiswaPass, 'siswa', '/default-avatar.png']);

        const [uRows] = await pool.query(`SELECT id FROM users WHERE username=? LIMIT 1`, [st.nipd]);
        const userId = uRows[0]?.id;

        if (userId) {
          await pool.query(`
            INSERT INTO students (user_id, nis, class, major, tempat_pkl, alamat_rumah, alamat_pkl, target_lat, target_lng, home_lat, home_lng, radius_meters, home_radius_meters, pembimbing_id, periode_mulai, periode_selesai)
            VALUES (?, ?, 'XII RPL 1', 'Rekayasa Perangkat Lunak', ?, ?, ?, -6.404419, 106.791996, ?, ?, 50, ?, ?, '2026-07-01', '2026-12-31')
            ON DUPLICATE KEY UPDATE tempat_pkl=VALUES(tempat_pkl), alamat_rumah=VALUES(alamat_rumah), alamat_pkl=VALUES(alamat_pkl), target_lat=VALUES(target_lat), target_lng=VALUES(target_lng), home_lat=VALUES(home_lat), home_lng=VALUES(home_lng), radius_meters=VALUES(radius_meters), home_radius_meters=VALUES(home_radius_meters);
          `, [userId, st.nipd, st.tempat, st.alamat_rumah, st.alamat_pkl, st.home_lat || null, st.home_lng || null, st.home_radius_meters || 50, pembimbingId]);
        }
      }
      console.log('Database tables & seed data initialized successfully!');
    }
  } catch (err) {
    console.error('ensureDatabaseInitialized warning:', err.message);
  } finally {
    isInitializingDb = false;
  }
}

async function isMySQLConnected() {
  if (!pool) return false;
  const now = Date.now();
  if (dbConnectionStatus !== null && (now - lastDbCheckTime < 10000)) {
    return dbConnectionStatus;
  }

  try {
    const conn = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    conn.release();
    if (dbConnectionStatus !== true) {
      await ensureDatabaseInitialized();

      try {
        await pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_updated TINYINT(1) DEFAULT 0`);
      } catch (colErr) {
        // Abaikan jika sudah ada atau sintaks ALTER IF NOT EXISTS tidak didukung MySQL versi lama
        try {
          const [chk] = await pool.query(`SHOW COLUMNS FROM students LIKE 'profile_updated'`);
          if (!chk || chk.length === 0) {
            await pool.query(`ALTER TABLE students ADD COLUMN profile_updated TINYINT(1) DEFAULT 0`);
          }
        } catch (_) {}
      }

      try {
        await pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS home_radius_meters INT DEFAULT 50`);
      } catch (colErr) {
        try {
          const [chk] = await pool.query(`SHOW COLUMNS FROM students LIKE 'home_radius_meters'`);
          if (!chk || chk.length === 0) {
            await pool.query(`ALTER TABLE students ADD COLUMN home_radius_meters INT DEFAULT 50`);
          }
        } catch (_) {}
      }

      try {
        await pool.query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS device_id VARCHAR(100) DEFAULT NULL`);
      } catch (colErr) {
        try {
          const [chk] = await pool.query(`SHOW COLUMNS FROM attendance LIKE 'device_id'`);
          if (!chk || chk.length === 0) {
            await pool.query(`ALTER TABLE attendance ADD COLUMN device_id VARCHAR(100) DEFAULT NULL`);
          }
        } catch (_) {}
      }
    }
    dbConnectionStatus = true;
    lastDbCheckTime = Date.now();
    return true;
  } catch (e) {
    dbConnectionStatus = false;
    lastDbCheckTime = Date.now();
    return false;
  }
}

export async function findUserById(id) {
  if (await isMySQLConnected()) {
    try {
      const [rows] = await pool.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [id]);
      if (rows && rows.length > 0) {
        const u = { ...rows[0] };
        if (u.role === 'admin') {
          if (!u.name) u.name = 'Pak Ridwan';
          if (!u.username) u.username = 'pak ridwan';
          if (!u.bio) {
            u.bio = 'Pembimbing Praktik Kerja Lapangan (PKL) yang bertugas memantau kedisiplinan presensi, meninjau laporan jurnal aktivitas harian, serta memberikan penilaian dan bimbingan teknis berkala kepada siswa PKL di instansi mitra.';
          }
          if (!u.jabatan) u.jabatan = 'Pembimbing PKL Siswa';
          if (!u.instansi) u.instansi = 'Naikmarket';
          if (!u.siswa_bimbingan) u.siswa_bimbingan = '6 Siswa PKL';
        }
        return u;
      }
    } catch (e) {
      console.warn('MySQL Query Error findUserById:', e.message);
    }
  }

  const u = mockUsers.find(user => user.id === id);
  if (u) {
    const userCopy = { ...u };
    if (userCopy.role === 'admin') {
      if (!userCopy.name) userCopy.name = 'Pak Ridwan';
      if (!userCopy.username) userCopy.username = 'pak ridwan';
      if (!userCopy.bio) {
        userCopy.bio = 'Pembimbing Praktik Kerja Lapangan (PKL) yang bertugas memantau kedisiplinan presensi, meninjau laporan jurnal aktivitas harian, serta memberikan penilaian dan bimbingan teknis berkala kepada siswa PKL di instansi mitra.';
      }
      if (!userCopy.jabatan) userCopy.jabatan = 'Pembimbing PKL Siswa';
      if (!userCopy.instansi) userCopy.instansi = 'Naikmarket';
      if (!userCopy.siswa_bimbingan) userCopy.siswa_bimbingan = '6 Siswa PKL';
    }
    return userCopy;
  }
  return null;
}

export async function findUserByCredential(credential) {
  const cleanCred = (credential || '').toLowerCase().trim();
  const noSpace = cleanCred.replace(/\s+/g, '');
  const isAdminLogin = ['pak ridwan', 'pakridwan', 'ridwan', 'rdiwan', 'pembimbing', 'pembimbing1'].includes(cleanCred) || ['pakridwan', 'ridwan'].includes(noSpace);

  if (await isMySQLConnected()) {
    try {
      let rows;
      if (isAdminLogin) {
        [rows] = await pool.query(
          `SELECT u.* FROM users u WHERE u.role = 'admin' LIMIT 1`
        );
      } else {
        [rows] = await pool.query(
          `SELECT u.* FROM users u
           LEFT JOIN students s ON u.id = s.user_id
           WHERE u.username = ? OR u.email = ? OR s.nis = ? LIMIT 1`,
          [credential.trim(), credential.trim(), credential.trim()]
        );
      }

      if (rows && rows.length > 0) {
        const u = { ...rows[0] };
        if (u.role === 'admin') {
          u.name = 'Pak Ridwan';
          u.username = 'pak ridwan';
        }
        return u;
      }
    } catch (e) {
      console.warn('MySQL Query Error:', e.message);
    }
  }

  const user = mockUsers.find(u =>
    u.username.toLowerCase() === cleanCred ||
    u.email.toLowerCase() === cleanCred ||
    (isAdminLogin && u.role === 'admin')
  );

  if (user) {
    const userCopy = { ...user };
    if (userCopy.role === 'admin') {
      userCopy.name = 'Pak Ridwan';
      userCopy.username = 'pak ridwan';
    }
    return userCopy;
  }

  const st = mockStudents.find(s => s.nis.toLowerCase() === cleanCred);
  if (st) {
    const u = mockUsers.find(u => u.id === st.user_id);
    if (u) {
      const userCopy = { ...u };
      if (userCopy.role === 'admin') {
        userCopy.name = 'Pak Ridwan';
        userCopy.username = 'pak ridwan';
      }
      return userCopy;
    }
  }

  return null;
}

export async function createDynamicUserForNipd(credential) {
  const cleanNipd = (credential || '').trim();
  const lowerNipd = cleanNipd.toLowerCase();
  if (['admin', 'rdiwan', 'ridwan', 'pak ridwan', 'pakridwan', 'pembimbing', 'superadmin'].includes(lowerNipd)) {
    return await findUserByCredential(cleanNipd);
  }
  const userName = `Siswa (${cleanNipd})`;
  const email = `siswa_${cleanNipd}@sekolah.sch.id`;

  if (await isMySQLConnected()) {
    try {
      const [adminRows] = await pool.query(`SELECT id FROM users WHERE role='admin' LIMIT 1`);
      const pembimbingId = adminRows[0]?.id || null;

      const [resUser] = await pool.query(
        `INSERT INTO users (name, username, email, password, role, photo)
         VALUES (?, ?, ?, ?, 'siswa', ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [userName, cleanNipd, email, '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y', '/default-avatar.png']
      );

      const [uRows] = await pool.query(`SELECT * FROM users WHERE username = ? LIMIT 1`, [cleanNipd]);
      const userObj = uRows[0];

      if (userObj) {
        await pool.query(
          `INSERT INTO students (user_id, nis, class, major, tempat_pkl, pembimbing_id, periode_mulai, periode_selesai)
           VALUES (?, ?, 'XII RPL 1', 'Rekayasa Perangkat Lunak', 'PT Naikmarketing', ?, '2026-07-01', '2026-12-31')
           ON DUPLICATE KEY UPDATE nis=VALUES(nis)`,
          [userObj.id, cleanNipd, pembimbingId]
        );
        return userObj;
      }
    } catch (e) {
      console.warn('MySQL Error createDynamicUserForNipd:', e.message);
    }
  }

  const existingU = mockUsers.find(u => u.username.toLowerCase() === cleanNipd.toLowerCase());
  if (existingU) return existingU;

  const newId = mockUsers.length + 100;
  const mockU = {
    id: newId,
    name: userName,
    username: cleanNipd,
    email: email,
    password: '$2b$10$BSekZ/wyrQ6r7lqwYyIFvur/BSkHICVuYwdEBZ8L2iaJaHonyqI5y',
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  };
  mockUsers.push(mockU);

  mockStudents.push({
    id: mockStudents.length + 100,
    user_id: newId,
    nis: cleanNipd,
    class: 'XII RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    tempat_pkl: 'PT Naikmarketing',
    pembimbing_id: 2,
    periode_mulai: '2026-07-01',
    periode_selesai: '2026-12-31',
    name: userName,
    email: email,
    photo: '/default-avatar.png'
  });

  return mockU;
}

export async function updateUserPassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  if (await isMySQLConnected()) {
    try {
      await pool.query(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashedPassword, userId]
      );
      const user = mockUsers.find(u => u.id === Number(userId));
      if (user) {
        user.password = hashedPassword;
      }
      return true;
    } catch (e) {
      console.error('MySQL Error updateUserPassword:', e.message);
      throw new Error('Gagal memperbarui password di database: ' + e.message);
    }
  }

  const user = mockUsers.find(u => u.id === Number(userId));
  if (user) {
    user.password = hashedPassword;
  }
  return true;
}

export async function updateUserPhoto(userId, photo) {
  if (await isMySQLConnected()) {
    try {
      await pool.query(
        `UPDATE users SET photo = ? WHERE id = ?`,
        [photo, userId]
      );
      return true;
    } catch (e) {
      console.warn('MySQL Error updateUserPhoto:', e.message);
    }
  }

  const user = mockUsers.find(u => u.id === Number(userId));
  if (user) {
    user.photo = photo;
  }
  return true;
}

export async function getStudentByUserId(userId) {
  if (await isMySQLConnected()) {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, u.name, u.email, u.photo,
                COALESCE(NULLIF(s.pembimbing_name, ''), p.name, '') as pembimbing_name
         FROM students s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN users p ON s.pembimbing_id = p.id
         WHERE s.user_id = ? LIMIT 1`,
        [userId]
      );
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          ...row,
          target_lat: row.target_lat !== null && row.target_lat !== undefined ? Number(row.target_lat) : -6.404419,
          target_lng: row.target_lng !== null && row.target_lng !== undefined ? Number(row.target_lng) : 106.791996,
          radius_meters: row.radius_meters ? Number(row.radius_meters) : 50,
          home_lat: row.home_lat !== null && row.home_lat !== undefined ? Number(row.home_lat) : -6.388280,
          home_lng: row.home_lng !== null && row.home_lng !== undefined ? Number(row.home_lng) : 106.854367,
          home_radius_meters: row.home_radius_meters ? Number(row.home_radius_meters) : (row.radius_meters ? Number(row.radius_meters) : 50)
        };
      }
    } catch (e) {
      console.warn('MySQL Error getStudentByUserId:', e.message);
    }
  }

  const student = mockStudents.find(s => s.user_id === Number(userId));
  if (!student) {
    const user = mockUsers.find(u => u.id === Number(userId));
    return {
      id: Number(userId),
      user_id: Number(userId),
      nis: user ? user.username : '242510072',
      class: 'XII RPL 1',
      major: 'Rekayasa Perangkat Lunak',
      tempat_pkl: 'PT Naikmarketing',
      pembimbing_id: 2,
      periode_mulai: '2026-07-01',
      periode_selesai: '2026-12-31',
      name: user ? user.name : 'Siswa PKL',
      email: user ? user.email : 'siswa@sekolah.sch.id',
      photo: '/default-avatar.png',
      pembimbing_name: '',
      alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
      alamat_pkl: 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Rangkapan Jaya, Pancoran Mas, Kota Depok, Jawa Barat 16435',
      target_lat: -6.404419,
      target_lng: 106.791996,
      home_lat: -6.388280,
      home_lng: 106.854367,
      radius_meters: 50,
      home_radius_meters: 50
    };
  }
  const pembimbing = mockUsers.find(u => u.id === student.pembimbing_id);
  return {
    target_lat: -6.404419,
    target_lng: 106.791996,
    radius_meters: 50,
    home_lat: -6.388280,
    home_lng: 106.854367,
    home_radius_meters: 50,
    ...student,
    radius_meters: student.radius_meters ? Number(student.radius_meters) : 50,
    home_radius_meters: student.home_radius_meters ? Number(student.home_radius_meters) : (student.radius_meters ? Number(student.radius_meters) : 50),
    pembimbing_name: student.pembimbing_name || (pembimbing ? pembimbing.name : '')
  };
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = (nLat1 * Math.PI) / 180;
  const φ2 = (nLat2 * Math.PI) / 180;
  const Δφ = ((nLat2 - nLat1) * Math.PI) / 180;
  const Δλ = ((nLon2 - nLon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Dalam meter
}

export async function getTodayAttendance(studentId) {
  const todayStr = getJakartaDateStr();
  if (await isMySQLConnected()) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM attendance 
         WHERE student_id = ? AND (attendance_date = ? OR attendance_date = CURDATE() OR DATE(created_at) = ?) 
         LIMIT 1`,
        [studentId, todayStr, todayStr]
      );
      if (rows && rows.length > 0) return rows[0];
      return null;
    } catch (e) {
      console.warn('MySQL Error getTodayAttendance:', e.message);
    }
  }

  return mockAttendance.find(a => a.student_id === Number(studentId) && (a.attendance_date === todayStr || a.attendance_date?.split('T')[0] === todayStr)) || null;
}

export async function deleteTodayAttendance(studentId = null) {
  const todayStr = getJakartaDateStr();
  if (await isMySQLConnected()) {
    try {
      if (studentId) {
        await pool.query(
          `DELETE FROM attendance WHERE student_id = ? AND (attendance_date = ? OR attendance_date = CURDATE() OR DATE(created_at) = ?)`,
          [studentId, todayStr, todayStr]
        );
      } else {
        await pool.query(
          `DELETE FROM attendance WHERE attendance_date = ? OR attendance_date = CURDATE() OR DATE(created_at) = ?`,
          [todayStr, todayStr]
        );
      }
    } catch (e) {
      console.warn('MySQL Error deleteTodayAttendance:', e.message);
    }
  }

  if (studentId) {
    mockAttendance = mockAttendance.filter(a => !(a.student_id === Number(studentId) && (a.attendance_date === todayStr || a.attendance_date?.split('T')[0] === todayStr)));
  } else {
    mockAttendance = mockAttendance.filter(a => a.attendance_date !== todayStr);
  }
  return true;
}

export async function bindStudentDevice(studentId, deviceId, deviceName, deviceType = 'web') {
  const isMobile = deviceType === 'mobile';
  if (await isMySQLConnected()) {
    try {
      if (isMobile) {
        await pool.query(
          `UPDATE students SET device_mobile_id = ?, device_mobile_name = ? WHERE id = ?`,
          [deviceId, deviceName || 'Mobile Device', studentId]
        );
      } else {
        await pool.query(
          `UPDATE students SET device_web_id = ?, device_web_name = ? WHERE id = ?`,
          [deviceId, deviceName || 'Web Device', studentId]
        );
      }
      return true;
    } catch (e) {
      console.warn('MySQL Error bindStudentDevice:', e.message);
    }
  }

  const student = mockStudents.find(s => Number(s.id) === Number(studentId) || Number(s.user_id) === Number(studentId));
  if (student) {
    if (isMobile) {
      student.device_mobile_id = deviceId;
      student.device_mobile_name = deviceName || 'Mobile Device';
    } else {
      student.device_web_id = deviceId;
      student.device_web_name = deviceName || 'Web Device';
    }
  }
  return true;
}

export async function resetStudentDevice(studentId, deviceType = null) {
  if (await isMySQLConnected()) {
    try {
      if (deviceType === 'mobile') {
        await pool.query(
          `UPDATE students SET device_mobile_id = NULL, device_mobile_name = NULL WHERE id = ?`,
          [studentId]
        );
      } else if (deviceType === 'web') {
        await pool.query(
          `UPDATE students SET device_web_id = NULL, device_web_name = NULL WHERE id = ?`,
          [studentId]
        );
      } else {
        await pool.query(
          `UPDATE students SET device_mobile_id = NULL, device_mobile_name = NULL, device_web_id = NULL, device_web_name = NULL, device_id = NULL, device_name = NULL WHERE id = ?`,
          [studentId]
        );
      }
      return true;
    } catch (e) {
      console.warn('MySQL Error resetStudentDevice:', e.message);
    }
  }

  const student = mockStudents.find(s => Number(s.id) === Number(studentId) || Number(s.user_id) === Number(studentId));
  if (student) {
    if (deviceType === 'mobile') {
      student.device_mobile_id = null;
      student.device_mobile_name = null;
    } else if (deviceType === 'web') {
      student.device_web_id = null;
      student.device_web_name = null;
    } else {
      student.device_mobile_id = null;
      student.device_mobile_name = null;
      student.device_web_id = null;
      student.device_web_name = null;
      student.device_id = null;
      student.device_name = null;
    }
  }
  return true;
}

export async function createAttendance({ student_id, attendance_date, attendance_time, photo, latitude, longitude, location, reason, note, status, work_mode, device_id }) {
  const cleanStatus = (status || 'hadir').toLowerCase();
  const cleanWorkMode = cleanStatus === 'hadir' ? (work_mode || 'wfo').toLowerCase() : null;
  const cleanDate = (attendance_date || getJakartaDateStr()).split('T')[0];
  const cleanTime = attendance_time || getJakartaTimeStr();

  if (await isMySQLConnected()) {
    try {
      const [result] = await pool.query(
        `INSERT INTO attendance (student_id, attendance_date, attendance_time, photo, latitude, longitude, location, reason, note, status, work_mode, device_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           attendance_time = VALUES(attendance_time),
           photo = VALUES(photo),
           latitude = VALUES(latitude),
           longitude = VALUES(longitude),
           location = VALUES(location),
           reason = VALUES(reason),
           note = VALUES(note),
           status = VALUES(status),
           work_mode = VALUES(work_mode),
           device_id = VALUES(device_id)`,
        [student_id, cleanDate, cleanTime, photo, latitude, longitude, location, reason, note, cleanStatus, cleanWorkMode, device_id || null]
      );
      return { id: result.insertId || result.affectedRows, student_id, attendance_date: cleanDate, attendance_time: cleanTime, photo, latitude, longitude, location, reason, note, status: cleanStatus, work_mode: cleanWorkMode, device_id };
    } catch (e) {
      console.warn('MySQL Error createAttendance:', e.message);
    }
  }

  const student = mockStudents.find(s => Number(s.id) === Number(student_id) || Number(s.user_id) === Number(student_id));
  const newRecord = {
    id: mockAttendance.length + 1,
    student_id: Number(student_id),
    attendance_date,
    attendance_time,
    photo,
    latitude: Number(latitude),
    longitude: Number(longitude),
    location: location || 'Lokasi Terverifikasi GPS',
    reason: reason || '',
    note: note || '',
    status: cleanStatus,
    work_mode: cleanWorkMode,
    device_id: device_id || null,
    student_name: student ? student.name : 'Siswa',
    nis: student ? (student.nis || student.username) : '',
    class: student ? student.class : '',
    tempat_pkl: student ? student.tempat_pkl : '',
    created_at: new Date().toISOString()
  };
  mockAttendance.unshift(newRecord);
  return newRecord;
}

export async function getStudentAttendanceHistory(studentId, filter = 'all') {
  if (await isMySQLConnected()) {
    try {
      let query = `SELECT * FROM attendance WHERE student_id = ?`;
      const params = [studentId];

      if (filter === 'day') {
        query += ` AND attendance_date = CURDATE()`;
      } else if (filter === 'week') {
        query += ` AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
      } else if (filter === 'month') {
        query += ` AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
      }

      query += ` ORDER BY attendance_date DESC, attendance_time DESC`;
      const [rows] = await pool.query(query, params);
      return rows || [];
    } catch (e) {
      console.warn('MySQL Error getStudentAttendanceHistory:', e.message);
    }
  }

  let list = mockAttendance.filter(a => a.student_id === Number(studentId));
  const now = new Date();
  if (filter === 'day') {
    const todayStr = now.toISOString().split('T')[0];
    list = list.filter(a => a.attendance_date === todayStr);
  } else if (filter === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    list = list.filter(a => new Date(a.attendance_date) >= weekAgo);
  } else if (filter === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    list = list.filter(a => new Date(a.attendance_date) >= monthAgo);
  }

  return list.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
}

export async function getAdminDashboard(pembimbingUserId) {
  const todayStr = getJakartaDateStr();

  if (await isMySQLConnected()) {
    try {
      const [students] = await pool.query(
        `SELECT s.*, u.name, u.email, u.photo
         FROM students s
         JOIN users u ON s.user_id = u.id
         WHERE (s.pembimbing_id = ? OR s.pembimbing_id IS NULL OR ? = 1)`,
        [pembimbingUserId, pembimbingUserId]
      );

      const studentIds = (students || []).map(s => s.id);

      let attendanceToday = [];
      let allAttendance = [];
      if (studentIds.length > 0) {
        const [rowsToday] = await pool.query(
          `SELECT a.*, u.name as student_name, s.nis, s.class, s.tempat_pkl, u.photo as student_photo
           FROM attendance a
           JOIN students s ON a.student_id = s.id
           JOIN users u ON s.user_id = u.id
           WHERE (a.attendance_date = ? OR a.attendance_date = CURDATE() OR DATE(a.created_at) = ?)
             AND a.student_id IN (?)
           ORDER BY a.created_at DESC`,
          [todayStr, todayStr, studentIds]
        );
        attendanceToday = (rowsToday || []).map(r => ({
          ...r,
          attendance_date: typeof r.attendance_date === 'string' ? r.attendance_date.split('T')[0] : (r.attendance_date ? getJakartaDateStr(new Date(r.attendance_date)) : todayStr)
        }));

        const [rowsAll] = await pool.query(
          `SELECT a.*, u.name as student_name, s.nis, s.class, s.tempat_pkl, u.photo as student_photo
           FROM attendance a
           JOIN students s ON a.student_id = s.id
           JOIN users u ON s.user_id = u.id
           WHERE a.student_id IN (?)
           ORDER BY a.attendance_date DESC, a.attendance_time DESC`,
          [studentIds]
        );
        allAttendance = (rowsAll || []).map(r => ({
          ...r,
          attendance_date: typeof r.attendance_date === 'string' ? r.attendance_date.split('T')[0] : (r.attendance_date ? getJakartaDateStr(new Date(r.attendance_date)) : todayStr)
        }));
      }

      const [activitiesCount] = await pool.query(
        `SELECT COUNT(act.id) as count
         FROM pkl_activities act
         JOIN students s ON act.student_id = s.id
         WHERE (s.pembimbing_id = ? OR s.pembimbing_id IS NULL OR ? = 1)`,
        [pembimbingUserId, pembimbingUserId]
      );

      const hadirCount = allAttendance.filter(a => a.status === 'hadir').length;
      const izinCount = allAttendance.filter(a => a.status === 'izin').length;
      const sakitCount = allAttendance.filter(a => a.status === 'sakit').length;

      const validStudents = (students || []).filter(s =>
        !s.name?.startsWith('Siswa (') &&
        !['admin', 'rdiwan', 'ridwan'].includes((s.nis || '').toLowerCase())
      );

      return {
        students: validStudents,
        attendanceToday,
        allAttendance,
        totalStudents: validStudents.length,
        alreadyAttendedCount: attendanceToday.length,
        notAttendedCount: Math.max(0, validStudents.length - attendanceToday.length),
        hadirCount,
        izinCount,
        sakitCount,
        totalActivities: activitiesCount[0]?.count || 0
      };
    } catch (e) {
      console.warn('MySQL Error getAdminDashboard:', e.message);
    }
  }

  const students = mockStudents.filter(s =>
    !s.name?.startsWith('Siswa (') &&
    !['admin', 'rdiwan', 'ridwan'].includes((s.nis || '').toLowerCase())
  );
  const attendanceToday = mockAttendance.filter(a => a.attendance_date === todayStr || a.attendance_date?.split('T')[0] === todayStr);
  const allAttendance = mockAttendance.map(a => ({
    ...a,
    attendance_date: typeof a.attendance_date === 'string' ? a.attendance_date.split('T')[0] : todayStr
  }));

  const hadirCount = allAttendance.filter(a => (a.status || '').toLowerCase() === 'hadir').length;
  const izinCount = allAttendance.filter(a => (a.status || '').toLowerCase() === 'izin').length;
  const sakitCount = allAttendance.filter(a => (a.status || '').toLowerCase() === 'sakit').length;

  return {
    students,
    attendanceToday,
    allAttendance,
    totalStudents: students.length,
    alreadyAttendedCount: attendanceToday.length,
    notAttendedCount: Math.max(0, students.length - attendanceToday.length),
    hadirCount,
    izinCount,
    sakitCount,
    totalActivities: mockActivities.length
  };
}

export async function getSuperAdminDashboard() {
  if (await isMySQLConnected()) {
    try {
      const [userCounts] = await pool.query(
        `SELECT role, COUNT(id) as count FROM users GROUP BY role`
      );
      const [studentCount] = await pool.query(`SELECT COUNT(id) as count FROM students`);
      const [attendanceCount] = await pool.query(`SELECT COUNT(id) as count FROM attendance`);
      const todayStr = getJakartaDateStr();
      const [todayCount] = await pool.query(`SELECT COUNT(id) as count FROM attendance WHERE attendance_date = ?`, [todayStr]);

      const [recentAttendance] = await pool.query(
        `SELECT a.*, u.name as student_name, s.nis, s.class, s.tempat_pkl, u.photo as student_photo
         FROM attendance a
         JOIN students s ON a.student_id = s.id
         JOIN users u ON s.user_id = u.id
         ORDER BY a.created_at DESC LIMIT 10`
      );

      const [allStudents] = await pool.query(
        `SELECT s.*, u.name, u.email, u.photo,
                COALESCE(NULLIF(s.pembimbing_name, ''), p.name, 'Pak Ridwan') as pembimbing_name
         FROM students s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN users p ON s.pembimbing_id = p.id`
      );

      const [allAdmins] = await pool.query(
        `SELECT id, name, username, email, role, created_at FROM users WHERE role = 'admin'`
      );

      const roleMap = {};
      (userCounts || []).forEach(r => roleMap[r.role] = r.count);

      return {
        totalStudents: studentCount[0]?.count || 0,
        totalAdmins: roleMap['admin'] || 0,
        totalSuperAdmins: roleMap['super_admin'] || 0,
        totalAttendance: attendanceCount[0]?.count || 0,
        todayAttendance: todayCount[0]?.count || 0,
        recentAttendance: recentAttendance || [],
        allStudents: allStudents || [],
        allAdmins: allAdmins || []
      };
    } catch (e) {
      console.warn('MySQL Error getSuperAdminDashboard:', e.message);
    }
  }

  const todayStr = getJakartaDateStr();
  const todayAtt = mockAttendance.filter(a => a.attendance_date === todayStr);

  return {
    totalStudents: mockStudents.length,
    totalAdmins: mockUsers.filter(u => u.role === 'admin').length,
    totalSuperAdmins: mockUsers.filter(u => u.role === 'super_admin').length,
    totalAttendance: mockAttendance.length,
    todayAttendance: todayAtt.length,
    recentAttendance: mockAttendance,
    allStudents: mockStudents,
    allAdmins: mockUsers.filter(u => u.role === 'admin')
  };
}

export async function getStudentActivities(studentId) {
  if (await isMySQLConnected()) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM pkl_activities WHERE student_id = ? ORDER BY activity_date DESC, created_at DESC`,
        [studentId]
      );
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.warn('MySQL Error getStudentActivities:', e.message);
    }
  }

  return mockActivities.filter(act => act.student_id === Number(studentId));
}

export async function createActivity({ student_id, title, description, activity_date, start_time, end_time }) {
  if (await isMySQLConnected()) {
    try {
      try {
        const [result] = await pool.query(
          `INSERT INTO pkl_activities (student_id, title, description, activity_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)`,
          [student_id, title, description, activity_date, start_time || null, end_time || null]
        );
        const newAct = { id: result.insertId, student_id, title, description, activity_date, start_time, end_time, created_at: new Date().toISOString() };
        mockActivities.unshift(newAct);
        return newAct;
      } catch (insertErr) {
        const [result] = await pool.query(
          `INSERT INTO pkl_activities (student_id, title, description, activity_date) VALUES (?, ?, ?, ?)`,
          [student_id, title, description, activity_date]
        );
        const newAct = { id: result.insertId, student_id, title, description, activity_date, start_time, end_time, created_at: new Date().toISOString() };
        mockActivities.unshift(newAct);
        return newAct;
      }
    } catch (e) {
      console.warn('MySQL Error createActivity:', e.message);
    }
  }

  const newActivity = {
    id: mockActivities.length + 1,
    student_id: Number(student_id),
    title,
    description,
    activity_date,
    start_time: start_time || null,
    end_time: end_time || null,
    created_at: new Date().toISOString()
  };
  mockActivities.unshift(newActivity);
  return newActivity;
}

export async function updateActivity(activityId, { title, description, activity_date, start_time, end_time }) {
  if (await isMySQLConnected()) {
    try {
      await pool.query(
        `UPDATE pkl_activities SET title = ?, description = ?, activity_date = ?, start_time = ?, end_time = ? WHERE id = ?`,
        [title, description, activity_date, start_time || null, end_time || null, activityId]
      );
    } catch (e) {
      console.warn('MySQL Error updateActivity:', e.message);
    }
  }

  const act = mockActivities.find(a => a.id === Number(activityId));
  if (act) {
    act.title = title;
    act.description = description;
    act.activity_date = activity_date;
    act.start_time = start_time || null;
    act.end_time = end_time || null;
    return act;
  }
  return null;
}

export async function deleteActivityById(activityId) {
  if (await isMySQLConnected()) {
    try {
      await pool.query(`DELETE FROM pkl_activities WHERE id = ?`, [activityId]);
    } catch (e) {
      console.warn('MySQL Error deleteActivityById:', e.message);
    }
  }

  mockActivities = mockActivities.filter(a => a.id !== Number(activityId));
  return true;
}

export async function clearStudentActivities(studentId) {
  if (await isMySQLConnected()) {
    try {
      if (studentId) {
        await pool.query(`DELETE FROM pkl_activities WHERE student_id = ?`, [studentId]);
      } else {
        await pool.query(`DELETE FROM pkl_activities`);
      }
    } catch (e) {
      console.warn('MySQL Error clearStudentActivities:', e.message);
    }
  }

  if (studentId) {
    mockActivities = mockActivities.filter(a => a.student_id !== Number(studentId));
  } else {
    mockActivities = [];
  }
  return true;
}

export async function updateStudentProfile(userId, { name, username, email, status, tempat_pkl, pembimbing_name, bio, jabatan, instansi, siswa_bimbingan, alamat_rumah, alamat_pkl, class: studentClass, nis, major, target_lat, target_lng, radius_meters, home_lat, home_lng, home_radius_meters }) {
  if (await isMySQLConnected()) {
    try {
      if (name) {
        await pool.query(`UPDATE users SET name = ? WHERE id = ?`, [name, userId]);
      }
      if (username) {
        await pool.query(`UPDATE users SET username = ? WHERE id = ?`, [username, userId]);
      }
      if (email) {
        await pool.query(`UPDATE users SET email = ? WHERE id = ?`, [email, userId]);
      }
      if (bio !== undefined) {
        await pool.query(`UPDATE users SET bio = ? WHERE id = ?`, [bio, userId]);
      }
      if (jabatan !== undefined) {
        await pool.query(`UPDATE users SET jabatan = ? WHERE id = ?`, [jabatan, userId]);
      }
      if (instansi !== undefined) {
        await pool.query(`UPDATE users SET instansi = ? WHERE id = ?`, [instansi, userId]);
      }
      if (siswa_bimbingan !== undefined) {
        await pool.query(`UPDATE users SET siswa_bimbingan = ? WHERE id = ?`, [siswa_bimbingan, userId]);
      }
      await pool.query(
        `UPDATE students SET
          status = COALESCE(?, status),
          tempat_pkl = COALESCE(?, tempat_pkl),
          pembimbing_name = COALESCE(?, pembimbing_name),
          bio = COALESCE(?, bio),
          alamat_rumah = COALESCE(?, alamat_rumah),
          alamat_pkl = COALESCE(?, alamat_pkl),
          class = COALESCE(?, class),
          nis = COALESCE(?, nis),
          major = COALESCE(?, major),
          target_lat = COALESCE(?, target_lat),
          target_lng = COALESCE(?, target_lng),
          radius_meters = COALESCE(?, radius_meters),
          home_lat = COALESCE(?, home_lat),
          home_lng = COALESCE(?, home_lng),
          home_radius_meters = COALESCE(?, home_radius_meters),
          profile_updated = 1
         WHERE user_id = ?`,
        [
          status !== undefined ? status : null,
          tempat_pkl !== undefined ? tempat_pkl : null,
          pembimbing_name !== undefined ? pembimbing_name : null,
          bio !== undefined ? bio : null,
          alamat_rumah !== undefined ? alamat_rumah : null,
          alamat_pkl !== undefined ? alamat_pkl : null,
          studentClass !== undefined ? studentClass : null,
          nis !== undefined ? nis : null,
          major !== undefined ? major : null,
          target_lat !== undefined ? target_lat : null,
          target_lng !== undefined ? target_lng : null,
          radius_meters !== undefined ? radius_meters : null,
          home_lat !== undefined ? home_lat : null,
          home_lng !== undefined ? home_lng : null,
          home_radius_meters !== undefined ? home_radius_meters : null,
          userId
        ]
      );
      return true;
    } catch (e) {
      console.warn('MySQL Error updateStudentProfile:', e.message);
    }
  }

  const u = mockUsers.find(user => user.id === Number(userId));
  if (u) {
    if (name) u.name = name;
    if (username) u.username = username;
    if (email) u.email = email;
    if (bio !== undefined) u.bio = bio;
    if (jabatan !== undefined) u.jabatan = jabatan;
    if (instansi !== undefined) u.instansi = instansi;
    if (siswa_bimbingan !== undefined) u.siswa_bimbingan = siswa_bimbingan;
  }
  const s = mockStudents.find(student => student.user_id === Number(userId));
  if (s) {
    if (tempat_pkl !== undefined) s.tempat_pkl = tempat_pkl;
    if (status !== undefined) s.status = status;
    if (pembimbing_name !== undefined) s.pembimbing_name = pembimbing_name;
    if (bio !== undefined) s.bio = bio;
    if (email !== undefined) s.email = email;
    if (alamat_rumah !== undefined) s.alamat_rumah = alamat_rumah;
    if (alamat_pkl !== undefined) s.alamat_pkl = alamat_pkl;
    if (studentClass !== undefined) s.class = studentClass;
    if (nis !== undefined) s.nis = nis;
    if (major !== undefined) s.major = major;
    if (target_lat !== undefined) s.target_lat = target_lat;
    if (target_lng !== undefined) s.target_lng = target_lng;
    if (radius_meters !== undefined) s.radius_meters = radius_meters;
    if (home_lat !== undefined) s.home_lat = home_lat;
    if (home_lng !== undefined) s.home_lng = home_lng;
    if (home_radius_meters !== undefined) s.home_radius_meters = home_radius_meters;
    s.profile_updated = 1;
  }
  return true;
}

export async function getAllStudentsDetailed({ search = '', classFilter = '' } = {}) {
  if (await isMySQLConnected()) {
    try {
      let query = `
        SELECT s.*, u.name, u.email, u.photo, u.username,
               COALESCE(NULLIF(s.pembimbing_name, ''), p.name, 'Pak Ridwan') as pembimbing_name,
               (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id) as total_attendance,
               (SELECT COUNT(*) FROM pkl_activities act WHERE act.student_id = s.id) as total_activities
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN users p ON s.pembimbing_id = p.id
        WHERE 1=1
      `;
      const params = [];
      if (search) {
        query += ` AND (u.name LIKE ? OR s.nis LIKE ? OR s.tempat_pkl LIKE ? OR u.email LIKE ?)`;
        const q = `%${search}%`;
        params.push(q, q, q, q);
      }
      if (classFilter && classFilter !== 'all') {
        query += ` AND s.class = ?`;
        params.push(classFilter);
      }
      query += ` ORDER BY s.id ASC`;

      const [rows] = await pool.query(query, params);
      return rows || [];
    } catch (e) {
      console.warn('MySQL Error getAllStudentsDetailed:', e.message);
    }
  }

  let list = mockStudents.map(s => {
    const u = mockUsers.find(user => user.id === s.user_id) || {};
    const pembimbing = mockUsers.find(m => m.id === s.pembimbing_id);
    const totalAtt = mockAttendance.filter(a => a.student_id === s.id).length;
    const totalAct = mockActivities.filter(act => act.student_id === s.id).length;
    return {
      ...s,
      name: u.name || s.name || '',
      email: u.email || s.email || '',
      username: u.username || s.nis || '',
      photo: u.photo || s.photo || '/default-avatar.png',
      pembimbing_name: s.pembimbing_name || (pembimbing ? pembimbing.name : 'Pak Ridwan'),
      total_attendance: totalAtt,
      total_activities: totalAct
    };
  });

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.nis || '').toLowerCase().includes(q) ||
      (s.tempat_pkl || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  }
  if (classFilter && classFilter !== 'all') {
    list = list.filter(s => s.class === classFilter);
  }

  return list;
}

export async function createStudentBySuperAdmin({
  name,
  username,
  email,
  password = 'password123',
  class: studentClass = 'XII RPL 1',
  major = 'Rekayasa Perangkat Lunak',
  tempat_pkl = '',
  alamat_rumah = '',
  alamat_pkl = '',
  pembimbing_id = null,
  target_lat = -6.404419,
  target_lng = 106.791996,
  radius_meters = 50,
  home_lat = -6.388280,
  home_lng = 106.854367,
  home_radius_meters = 50,
  periode_mulai = '2026-07-01',
  periode_selesai = '2026-12-31'
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const cleanUsername = (username || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (await isMySQLConnected()) {
    try {
      const [userRes] = await pool.query(
        `INSERT INTO users (name, username, email, password, role, photo) VALUES (?, ?, ?, ?, 'siswa', '/default-avatar.png')`,
        [name, cleanUsername, cleanEmail, hashedPassword]
      );
      const newUserId = userRes.insertId;

      const [studentRes] = await pool.query(
        `INSERT INTO students (
          user_id, nis, class, major, tempat_pkl, alamat_rumah, alamat_pkl,
          target_lat, target_lng, radius_meters, home_lat, home_lng, home_radius_meters, pembimbing_id, periode_mulai, periode_selesai
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUserId, cleanUsername, studentClass, major, tempat_pkl, alamat_rumah, alamat_pkl,
          target_lat || -6.404419, target_lng || 106.791996, radius_meters || 50,
          home_lat || -6.388280, home_lng || 106.854367, home_radius_meters || 50,
          pembimbing_id || null, periode_mulai, periode_selesai
        ]
      );

      return { id: studentRes.insertId, user_id: newUserId, name, username: cleanUsername, email: cleanEmail };
    } catch (e) {
      console.warn('MySQL Error createStudentBySuperAdmin:', e.message);
      throw e;
    }
  }

  const existingU = mockUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase() || u.email.toLowerCase() === cleanEmail.toLowerCase());
  if (existingU) {
    throw new Error('Username atau Email sudah terdaftar!');
  }

  const newUserId = (mockUsers.reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
  const newStudentId = (mockStudents.reduce((max, s) => Math.max(max, s.id), 0) || 0) + 1;

  const mockU = {
    id: newUserId,
    name,
    username: cleanUsername,
    email: cleanEmail,
    password: hashedPassword,
    role: 'siswa',
    photo: '/default-avatar.png',
    created_at: new Date().toISOString()
  };
  mockUsers.push(mockU);

  const mockS = {
    id: newStudentId,
    user_id: newUserId,
    nis: cleanUsername,
    class: studentClass,
    major,
    tempat_pkl,
    alamat_rumah,
    alamat_pkl,
    target_lat: target_lat || -6.404419,
    target_lng: target_lng || 106.791996,
    radius_meters: radius_meters || 50,
    home_lat: home_lat || -6.388280,
    home_lng: home_lng || 106.854367,
    home_radius_meters: home_radius_meters || 50,
    pembimbing_id: pembimbing_id ? Number(pembimbing_id) : null,
    periode_mulai,
    periode_selesai,
    name,
    email: cleanEmail,
    photo: '/default-avatar.png'
  };
  mockStudents.push(mockS);

  return { id: newStudentId, user_id: newUserId, name, username: cleanUsername, email: cleanEmail };
}

export async function updateStudentBySuperAdmin(studentId, {
  name,
  username,
  email,
  password,
  class: studentClass,
  major,
  tempat_pkl,
  alamat_rumah,
  alamat_pkl,
  pembimbing_id,
  target_lat,
  target_lng,
  radius_meters,
  home_lat,
  home_lng,
  home_radius_meters
}) {
  if (await isMySQLConnected()) {
    try {
      const [stRows] = await pool.query(`SELECT user_id FROM students WHERE id = ? LIMIT 1`, [studentId]);
      if (!stRows || stRows.length === 0) {
        throw new Error('Data siswa tidak ditemukan');
      }
      const userId = stRows[0].user_id;

      if (name) await pool.query(`UPDATE users SET name = ? WHERE id = ?`, [name, userId]);
      if (username) await pool.query(`UPDATE users SET username = ? WHERE id = ?`, [username, userId]);
      if (email) await pool.query(`UPDATE users SET email = ? WHERE id = ?`, [email, userId]);
      if (password && password.trim()) {
        const hash = await bcrypt.hash(password.trim(), 10);
        await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hash, userId]);
      }

      await pool.query(
        `UPDATE students SET
          nis = COALESCE(?, nis),
          class = COALESCE(?, class),
          major = COALESCE(?, major),
          tempat_pkl = COALESCE(?, tempat_pkl),
          alamat_rumah = COALESCE(?, alamat_rumah),
          alamat_pkl = COALESCE(?, alamat_pkl),
          pembimbing_id = ?,
          target_lat = COALESCE(?, target_lat),
          target_lng = COALESCE(?, target_lng),
          radius_meters = COALESCE(?, radius_meters),
          home_lat = COALESCE(?, home_lat),
          home_lng = COALESCE(?, home_lng),
          home_radius_meters = COALESCE(?, home_radius_meters)
         WHERE id = ?`,
        [
          username || null,
          studentClass || null,
          major || null,
          tempat_pkl !== undefined ? tempat_pkl : null,
          alamat_rumah !== undefined ? alamat_rumah : null,
          alamat_pkl !== undefined ? alamat_pkl : null,
          pembimbing_id ? Number(pembimbing_id) : null,
          target_lat || null,
          target_lng || null,
          radius_meters || null,
          home_lat || null,
          home_lng || null,
          home_radius_meters || null,
          studentId
        ]
      );
      return true;
    } catch (e) {
      console.warn('MySQL Error updateStudentBySuperAdmin:', e.message);
      throw e;
    }
  }

  const s = mockStudents.find(st => st.id === Number(studentId));
  if (!s) throw new Error('Data siswa tidak ditemukan');

  const u = mockUsers.find(user => user.id === s.user_id);
  if (u) {
    if (name) u.name = name;
    if (username) u.username = username;
    if (email) u.email = email;
    if (password && password.trim()) {
      u.password = await bcrypt.hash(password.trim(), 10);
    }
  }

  if (username) s.nis = username;
  if (name) s.name = name;
  if (email) s.email = email;
  if (studentClass) s.class = studentClass;
  if (major) s.major = major;
  if (tempat_pkl !== undefined) s.tempat_pkl = tempat_pkl;
  if (alamat_rumah !== undefined) s.alamat_rumah = alamat_rumah;
  if (alamat_pkl !== undefined) s.alamat_pkl = alamat_pkl;
  if (pembimbing_id !== undefined) s.pembimbing_id = pembimbing_id ? Number(pembimbing_id) : null;
  if (target_lat !== undefined) s.target_lat = target_lat;
  if (target_lng !== undefined) s.target_lng = target_lng;
  if (radius_meters !== undefined) s.radius_meters = radius_meters;
  if (home_lat !== undefined) s.home_lat = home_lat;
  if (home_lng !== undefined) s.home_lng = home_lng;
  if (home_radius_meters !== undefined) s.home_radius_meters = home_radius_meters;

  return true;
}

export async function deleteStudentBySuperAdmin(studentId) {
  if (await isMySQLConnected()) {
    try {
      const [stRows] = await pool.query(`SELECT user_id FROM students WHERE id = ? LIMIT 1`, [studentId]);
      if (stRows && stRows.length > 0) {
        const userId = stRows[0].user_id;
        await pool.query(`DELETE FROM attendance WHERE student_id = ?`, [studentId]);
        await pool.query(`DELETE FROM pkl_activities WHERE student_id = ?`, [studentId]);
        await pool.query(`DELETE FROM students WHERE id = ?`, [studentId]);
        await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
      }
      return true;
    } catch (e) {
      console.warn('MySQL Error deleteStudentBySuperAdmin:', e.message);
      throw e;
    }
  }

  const sIndex = mockStudents.findIndex(st => st.id === Number(studentId));
  if (sIndex !== -1) {
    const s = mockStudents[sIndex];
    mockStudents.splice(sIndex, 1);
    const uIndex = mockUsers.findIndex(u => u.id === s.user_id);
    if (uIndex !== -1) {
      mockUsers.splice(uIndex, 1);
    }
    mockAttendance = mockAttendance.filter(a => a.student_id !== Number(studentId));
    mockActivities = mockActivities.filter(act => act.student_id !== Number(studentId));
  }
  return true;
}

export async function getAllMentorsDetailed({ search = '' } = {}) {
  if (await isMySQLConnected()) {
    try {
      let query = `
        SELECT u.id, u.name, u.username, u.email, u.role, u.photo, u.created_at,
               COALESCE(u.bio, '') as bio,
               COALESCE(u.jabatan, 'Pembimbing PKL') as jabatan,
               COALESCE(u.instansi, 'Sekolah / Mitra') as instansi,
               (SELECT COUNT(*) FROM students s WHERE s.pembimbing_id = u.id) as total_bimbingan
        FROM users u
        WHERE u.role = 'admin'
      `;
      const params = [];
      if (search) {
        query += ` AND (u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)`;
        const q = `%${search}%`;
        params.push(q, q, q);
      }
      query += ` ORDER BY u.id ASC`;

      const [rows] = await pool.query(query, params);
      return rows || [];
    } catch (e) {
      console.warn('MySQL Error getAllMentorsDetailed:', e.message);
    }
  }

  let list = mockUsers.filter(u => u.role === 'admin').map(u => {
    const count = mockStudents.filter(s => s.pembimbing_id === u.id).length;
    return {
      id: u.id,
      name: u.name || 'Pak Ridwan',
      username: u.username || 'pak ridwan',
      email: u.email || 'pembimbing@sekolah.sch.id',
      role: u.role,
      photo: u.photo || '/default-avatar.png',
      bio: u.bio || 'Pembimbing Praktik Kerja Lapangan (PKL)',
      jabatan: u.jabatan || 'Pembimbing PKL Siswa',
      instansi: u.instansi || 'Naikmarket',
      total_bimbingan: count || 6,
      created_at: u.created_at || new Date().toISOString()
    };
  });

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(m =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.username || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.instansi || '').toLowerCase().includes(q)
    );
  }

  return list;
}

export async function createMentorBySuperAdmin({
  name,
  username,
  email,
  password = 'password123',
  instansi = 'Sekolah / Mitra PKL',
  jabatan = 'Pembimbing PKL',
  bio = ''
}) {
  const cleanUsername = (username || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  if (await isMySQLConnected()) {
    try {
      const [res] = await pool.query(
        `INSERT INTO users (name, username, email, password, role, photo, bio, jabatan, instansi)
         VALUES (?, ?, ?, ?, 'admin', '/default-avatar.png', ?, ?, ?)`,
        [name, cleanUsername, cleanEmail, hashedPassword, bio, jabatan, instansi]
      );
      return { id: res.insertId, name, username: cleanUsername, email: cleanEmail, role: 'admin' };
    } catch (e) {
      // If columns bio/jabatan/instansi don't exist in users table yet, try basic insert
      try {
        const [res] = await pool.query(
          `INSERT INTO users (name, username, email, password, role, photo)
           VALUES (?, ?, ?, ?, 'admin', '/default-avatar.png')`,
          [name, cleanUsername, cleanEmail, hashedPassword]
        );
        return { id: res.insertId, name, username: cleanUsername, email: cleanEmail, role: 'admin' };
      } catch (err2) {
        console.warn('MySQL Error createMentorBySuperAdmin:', err2.message);
        throw err2;
      }
    }
  }

  const existingU = mockUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase() || u.email.toLowerCase() === cleanEmail.toLowerCase());
  if (existingU) {
    throw new Error('Username atau Email sudah terdaftar!');
  }

  const newId = (mockUsers.reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
  const newMentor = {
    id: newId,
    name,
    username: cleanUsername,
    email: cleanEmail,
    password: hashedPassword,
    role: 'admin',
    photo: '/default-avatar.png',
    instansi,
    jabatan,
    bio,
    created_at: new Date().toISOString()
  };
  mockUsers.push(newMentor);

  return newMentor;
}

export async function updateMentorBySuperAdmin(mentorId, {
  name,
  username,
  email,
  password,
  instansi,
  jabatan,
  bio
}) {
  if (await isMySQLConnected()) {
    try {
      if (name) await pool.query(`UPDATE users SET name = ? WHERE id = ?`, [name, mentorId]);
      if (username) await pool.query(`UPDATE users SET username = ? WHERE id = ?`, [username, mentorId]);
      if (email) await pool.query(`UPDATE users SET email = ? WHERE id = ?`, [email, mentorId]);
      if (password && password.trim()) {
        const hash = await bcrypt.hash(password.trim(), 10);
        await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hash, mentorId]);
      }
      try {
        if (instansi !== undefined) await pool.query(`UPDATE users SET instansi = ? WHERE id = ?`, [instansi, mentorId]);
        if (jabatan !== undefined) await pool.query(`UPDATE users SET jabatan = ? WHERE id = ?`, [jabatan, mentorId]);
        if (bio !== undefined) await pool.query(`UPDATE users SET bio = ? WHERE id = ?`, [bio, mentorId]);
      } catch (ignoredCol) {}
      return true;
    } catch (e) {
      console.warn('MySQL Error updateMentorBySuperAdmin:', e.message);
      throw e;
    }
  }

  const m = mockUsers.find(u => u.id === Number(mentorId));
  if (!m) throw new Error('Data pembimbing tidak ditemukan');
  if (name) m.name = name;
  if (username) m.username = username;
  if (email) m.email = email;
  if (instansi !== undefined) m.instansi = instansi;
  if (jabatan !== undefined) m.jabatan = jabatan;
  if (bio !== undefined) m.bio = bio;
  if (password && password.trim()) {
    m.password = await bcrypt.hash(password.trim(), 10);
  }
  return true;
}

export async function deleteMentorBySuperAdmin(mentorId) {
  if (await isMySQLConnected()) {
    try {
      await pool.query(`UPDATE students SET pembimbing_id = NULL WHERE pembimbing_id = ?`, [mentorId]);
      await pool.query(`DELETE FROM users WHERE id = ? AND role = 'admin'`, [mentorId]);
      return true;
    } catch (e) {
      console.warn('MySQL Error deleteMentorBySuperAdmin:', e.message);
      throw e;
    }
  }

  const idx = mockUsers.findIndex(u => u.id === Number(mentorId) && u.role === 'admin');
  if (idx !== -1) {
    mockUsers.splice(idx, 1);
    mockStudents.forEach(s => {
      if (s.pembimbing_id === Number(mentorId)) s.pembimbing_id = null;
    });
  }
  return true;
}

export async function getAllActivitiesDetailed({ search = '', studentId = '', date = '' } = {}) {
  if (await isMySQLConnected()) {
    try {
      let query = `
        SELECT act.*, u.name as student_name, s.nis, s.class, s.tempat_pkl, u.photo as student_photo
        FROM pkl_activities act
        JOIN students s ON act.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      if (studentId) {
        query += ` AND act.student_id = ?`;
        params.push(studentId);
      }
      if (date) {
        query += ` AND act.activity_date = ?`;
        params.push(date);
      }
      if (search) {
        query += ` AND (act.title LIKE ? OR act.description LIKE ? OR u.name LIKE ? OR s.nis LIKE ?)`;
        const q = `%${search}%`;
        params.push(q, q, q, q);
      }
      query += ` ORDER BY act.activity_date DESC, act.created_at DESC`;

      const [rows] = await pool.query(query, params);
      return rows || [];
    } catch (e) {
      console.warn('MySQL Error getAllActivitiesDetailed:', e.message);
    }
  }

  let list = mockActivities.map(act => {
    const s = mockStudents.find(st => st.id === act.student_id) || {};
    const u = mockUsers.find(usr => usr.id === s.user_id) || {};
    return {
      ...act,
      student_name: u.name || s.name || 'Siswa PKL',
      nis: s.nis || '-',
      class: s.class || '-',
      tempat_pkl: s.tempat_pkl || '-',
      student_photo: u.photo || s.photo || '/default-avatar.png'
    };
  });

  if (studentId) {
    list = list.filter(act => String(act.student_id) === String(studentId));
  }
  if (date) {
    list = list.filter(act => act.activity_date === date);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(act =>
      (act.title || '').toLowerCase().includes(q) ||
      (act.description || '').toLowerCase().includes(q) ||
      (act.student_name || '').toLowerCase().includes(q) ||
      (act.nis || '').toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
}

export async function getAllAttendanceDetailed({ search = '', studentId = '', date = '', status = '', filterRange = '' } = {}) {
  if (await isMySQLConnected()) {
    try {
      let query = `
        SELECT a.*, u.name as student_name, s.nis, s.class, s.tempat_pkl, u.photo as student_photo
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      if (studentId) {
        query += ` AND a.student_id = ?`;
        params.push(studentId);
      }
      if (status && status !== 'all') {
        query += ` AND a.status = ?`;
        params.push(status);
      }
      if (date) {
        query += ` AND a.attendance_date = ?`;
        params.push(date);
      } else if (filterRange === 'today') {
        const todayStr = getJakartaDateStr();
        query += ` AND a.attendance_date = ?`;
        params.push(todayStr);
      } else if (filterRange === 'week') {
        query += ` AND a.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
      } else if (filterRange === 'month') {
        query += ` AND a.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
      }
      if (search) {
        query += ` AND (u.name LIKE ? OR s.nis LIKE ? OR s.tempat_pkl LIKE ? OR a.location LIKE ?)`;
        const q = `%${search}%`;
        params.push(q, q, q, q);
      }
      query += ` ORDER BY a.attendance_date DESC, a.attendance_time DESC`;

      const [rows] = await pool.query(query, params);
      return rows || [];
    } catch (e) {
      console.warn('MySQL Error getAllAttendanceDetailed:', e.message);
    }
  }

  let list = mockAttendance.map(a => {
    const s = mockStudents.find(st => st.id === a.student_id) || {};
    const u = mockUsers.find(usr => usr.id === s.user_id) || {};
    return {
      ...a,
      student_name: u.name || s.name || 'Siswa PKL',
      nis: s.nis || '-',
      class: s.class || '-',
      tempat_pkl: s.tempat_pkl || '-',
      student_photo: u.photo || s.photo || '/default-avatar.png'
    };
  });

  if (studentId) {
    list = list.filter(a => String(a.student_id) === String(studentId));
  }
  if (status && status !== 'all') {
    list = list.filter(a => a.status === status);
  }
  if (date) {
    list = list.filter(a => a.attendance_date === date);
  } else if (filterRange === 'today') {
    const todayStr = getJakartaDateStr();
    list = list.filter(a => a.attendance_date === todayStr);
  } else if (filterRange === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    list = list.filter(a => new Date(a.attendance_date) >= weekAgo);
  } else if (filterRange === 'month') {
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    list = list.filter(a => new Date(a.attendance_date) >= monthAgo);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(a =>
      (a.student_name || '').toLowerCase().includes(q) ||
      (a.nis || '').toLowerCase().includes(q) ||
      (a.tempat_pkl || '').toLowerCase().includes(q) ||
      (a.location || '').toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
}

export async function getStudentHistoryDetailed(studentId) {
  const attendance = await getAllAttendanceDetailed({ studentId });
  const activities = await getAllActivitiesDetailed({ studentId });
  let studentInfo = null;

  if (await isMySQLConnected()) {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, u.name, u.email, u.username, u.photo,
                COALESCE(NULLIF(s.pembimbing_name, ''), p.name, 'Pak Ridwan') as pembimbing_name
         FROM students s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN users p ON s.pembimbing_id = p.id
         WHERE s.id = ? LIMIT 1`,
        [studentId]
      );
      if (rows && rows.length > 0) studentInfo = rows[0];
    } catch (e) {}
  }

  if (!studentInfo) {
    const s = mockStudents.find(st => st.id === Number(studentId));
    if (s) {
      const u = mockUsers.find(usr => usr.id === s.user_id) || {};
      studentInfo = {
        ...s,
        name: u.name || s.name,
        email: u.email || s.email,
        username: u.username || s.nis,
        photo: u.photo || '/default-avatar.png',
        pembimbing_name: s.pembimbing_name || 'Pak Ridwan'
      };
    }
  }

  return {
    student: studentInfo,
    attendance,
    activities
  };
}

