const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const uri = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;
  const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306');
  const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE || 'absensi_pkl';

  try {
    let connection;
    if (uri) {
      console.log(`Connecting to MySQL via connection URI...`);
      connection = await mysql.createConnection(uri);
    } else {
      console.log(`Connecting to MySQL at ${host}:${port}...`);
      connection = await mysql.createConnection({ host, port, user, password });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.query(`USE \`${database}\`;`);
    }

    console.log('Creating database tables...');

    await connection.query(`
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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`students\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`nis\` VARCHAR(30) NOT NULL UNIQUE,
        \`class\` VARCHAR(50) NOT NULL,
        \`major\` VARCHAR(100) NOT NULL,
        \`tempat_pkl\` VARCHAR(150) NOT NULL,
        \`alamat_rumah\` TEXT DEFAULT NULL,
        \`alamat_pkl\` TEXT DEFAULT NULL,
        \`target_lat\` DECIMAL(10, 8) DEFAULT -6.384288,
        \`target_lng\` DECIMAL(11, 8) DEFAULT 106.869938,
        \`home_lat\` DECIMAL(10, 8) DEFAULT NULL,
        \`home_lng\` DECIMAL(11, 8) DEFAULT NULL,
        \`radius_meters\` INT DEFAULT 50,
        \`home_radius_meters\` INT DEFAULT 50,
        \`pembimbing_id\` INT DEFAULT NULL,
        \`periode_mulai\` DATE NOT NULL,
        \`periode_selesai\` DATE NOT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_students_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_students_pembimbing\` FOREIGN KEY (\`pembimbing_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
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
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_attendance_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE,
        UNIQUE KEY \`unique_student_date\` (\`student_id\`, \`attendance_date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
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

    console.log('Seeding initial users...');

    const defaultAdminPass = await bcrypt.hash('password123', 10);
    const defaultSiswaPass = await bcrypt.hash('123456', 10);

    await connection.query(`
      INSERT INTO users (name, username, email, password, role, photo)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `, ['Super Administrator', 'superadmin', 'superadmin@sekolah.sch.id', defaultAdminPass, 'super_admin', '/default-avatar.png']);

    await connection.query(`
      INSERT INTO users (name, username, email, password, role, photo)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name), username=VALUES(username);
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
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: -6.383542,
        home_lng: 106.899722
      },
      {
        nipd: '242510078',
        name: 'Rakha Zuhdi Naufal',
        email: 'rakha@sekolah.sch.id',
        tempat: 'Sekolah',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: -6.388280,
        home_lng: 106.854367,
        home_radius_meters: 50
      },
      {
        nipd: '242510082',
        name: 'Satria Arief Wibowo',
        email: 'satria@sekolah.sch.id',
        tempat: 'PT Cyber Media Solusindo',
        alamat_rumah: 'Jl. Arrahman V No. 191, kelurahan Sukatani, kecamatan Tapos, kota Depok - 16464',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: -6.391689,
        home_lng: 106.880611
      },
      {
        nipd: '242510085',
        name: 'Nisa Amalia',
        email: 'nisa@sekolah.sch.id',
        tempat: 'PT Teknologi Nusantara',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: -6.396742,
        home_lng: 106.839228
      },
      {
        nipd: '242510090',
        name: 'Muhammad Farhan',
        email: 'farhan@sekolah.sch.id',
        tempat: 'PT Solusi Data Utama',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: -6.396742,
        home_lng: 106.839228
      },
      {
        nipd: '242510095',
        name: 'Aulia Putri',
        email: 'aulia@sekolah.sch.id',
        tempat: 'PT Media Kreatif Sentosa',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: -6.396742,
        home_lng: 106.839228
      },
    ];

    for (const st of studentList) {
      await connection.query(`
        INSERT INTO users (name, username, email, password, role, photo)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name);
      `, [st.name, st.nipd, st.email, defaultSiswaPass, 'siswa', '/default-avatar.png']);

      const [uRows] = await connection.query(`SELECT id FROM users WHERE username=? LIMIT 1`, [st.nipd]);
      const userId = uRows[0]?.id;

      if (userId) {
        await connection.query(`
          INSERT INTO students (user_id, nis, class, major, tempat_pkl, alamat_rumah, alamat_pkl, target_lat, target_lng, home_lat, home_lng, radius_meters, home_radius_meters, pembimbing_id, periode_mulai, periode_selesai)
          VALUES (?, ?, ?, ?, ?, ?, ?, -6.384288, 106.869938, ?, ?, 50, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE tempat_pkl=VALUES(tempat_pkl), alamat_rumah=VALUES(alamat_rumah), alamat_pkl=VALUES(alamat_pkl), target_lat=VALUES(target_lat), target_lng=VALUES(target_lng), home_lat=VALUES(home_lat), home_lng=VALUES(home_lng), radius_meters=VALUES(radius_meters), home_radius_meters=VALUES(home_radius_meters);
        `, [userId, st.nipd, 'XII RPL 1', 'Rekayasa Perangkat Lunak', st.tempat, st.alamat_rumah, st.alamat_pkl, st.home_lat || null, st.home_lng || null, st.home_radius_meters || 50, pembimbingId, '2026-07-01', '2026-12-31']);
      }
    }

    console.log('Database seeded clean successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}

seedDatabase();
