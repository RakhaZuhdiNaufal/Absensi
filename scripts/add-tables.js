const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection(
    process.env.DATABASE_URL || 'mysql://root:khhlZLpXlSjVwvlPPwVvqOxOAtExlYWp@altaria.proxy.rlwy.net:58498/railway'
  );
  console.log('Connected to MySQL Railway...');

  // 1. Table: profile_updates (untuk upload foto profil dan edit profil)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS profile_updates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      action_type ENUM('edit_profile', 'upload_photo') NOT NULL DEFAULT 'edit_profile',
      photo LONGTEXT DEFAULT NULL,
      name VARCHAR(100) DEFAULT NULL,
      email VARCHAR(100) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      alamat_rumah TEXT DEFAULT NULL,
      alamat_pkl TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_profile_updates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✓ Tabel profile_updates berhasil dibuat!');

  // 2. Table: password_resets (untuk log dan riwayat ganti password)
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
  console.log('✓ Tabel password_resets berhasil dibuat!');

  // Masukkan data awal agar saat dilihat di Railway ada sampel riil
  const [existingProfiles] = await conn.query('SELECT COUNT(*) as cnt FROM profile_updates');
  if (existingProfiles[0].cnt === 0) {
    await conn.query(`
      INSERT INTO profile_updates (user_id, action_type, name, email, alamat_rumah, alamat_pkl)
      VALUES (4, 'edit_profile', 'Rakha Zuhdi Naufal', 'rakha@sekolah.sch.id', 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418', 'Jasa Pembuatan Website, Agensi Pemasaran Digital - Naikmarketing, Depok');
    `);
    console.log('✓ Sample data profile_updates inserted');
  }

  const [existingPw] = await conn.query('SELECT COUNT(*) as cnt FROM password_resets');
  if (existingPw[0].cnt === 0) {
    await conn.query(`
      INSERT INTO password_resets (user_id, action, status)
      VALUES (4, 'change_password', 'success');
    `);
    console.log('✓ Sample data password_resets inserted');
  }

  const [tables] = await conn.query('SHOW TABLES');
  console.log('Daftar tabel saat ini:', tables.map(t => Object.values(t)[0]));

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
