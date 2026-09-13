const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection(
    process.env.DATABASE_URL || 'mysql://root:khhlZLpXlSjVwvlPPwVvqOxOAtExlYWp@altaria.proxy.rlwy.net:58498/railway'
  );
  console.log('Connected to Railway MySQL...');

  // 1. Drop existing profile_updates agar skema bersih dan terpisah
  await conn.query(`DROP TABLE IF EXISTS profile_updates;`);

  // 2. Buat tabel user_photos (KHUSUS Upload Foto Profil)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      photo LONGTEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_photos_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✓ Tabel user_photos (Khusus Upload Foto) berhasil dibuat!');

  // 3. Buat tabel profile_updates (KHUSUS Edit Data Profil)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS profile_updates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(100) DEFAULT NULL,
      email VARCHAR(100) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      alamat_rumah TEXT DEFAULT NULL,
      alamat_pkl TEXT DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_profile_updates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✓ Tabel profile_updates (Khusus Edit Profil) berhasil dibuat!');

  // 4. Pastikan tabel password_resets (KHUSUS Ganti Password) sudah ada
  await conn.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      action VARCHAR(50) NOT NULL DEFAULT 'change_password',
      status VARCHAR(50) NOT NULL DEFAULT 'success',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✓ Tabel password_resets (Khusus Ganti Password) siap!');

  // Masukkan data sampel ke user_photos
  await conn.query(`
    INSERT INTO user_photos (user_id, photo)
    VALUES (4, '/default-avatar.png');
  `);
  console.log('✓ Data sampel user_photos dimasukkan');

  // Masukkan data sampel ke profile_updates
  await conn.query(`
    INSERT INTO profile_updates (user_id, name, email, alamat_rumah, alamat_pkl)
    VALUES (4, 'Rakha Zuhdi Naufal', 'rakha@sekolah.sch.id', 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, Depok', 'Jasa Pembuatan Website - Naikmarketing, Depok');
  `);
  console.log('✓ Data sampel profile_updates dimasukkan');

  const [tables] = await conn.query('SHOW TABLES');
  console.log('Daftar Tabel di Railway sekarang:', tables.map(t => Object.values(t)[0]));

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
