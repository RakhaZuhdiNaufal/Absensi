const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAttendanceAndSync() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'absensi_pkl';

  console.log(`Connecting to MySQL database ${database}...`);
  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    // 1. Reset Attendance
    await conn.query('DELETE FROM attendance');
    try {
      await conn.query('ALTER TABLE attendance AUTO_INCREMENT = 1');
    } catch (_) {}
    console.log('✅ Semua data absensi (kehadiran) siswa dan pembimbing berhasil di-reset / dikosongkan.');

    // 2. Reset Kegiatan Jurnal Harian
    await conn.query('DELETE FROM pkl_activities');
    try {
      await conn.query('ALTER TABLE pkl_activities AUTO_INCREMENT = 1');
    } catch (_) {}
    console.log('✅ Semua data kegiatan/jurnal PKL berhasil dikosongkan.');

    // 3. Update Akun Pembimbing: Username = 'pak ridwan', Name = 'Pak Ridwan'
    const defaultAdminPass = await bcrypt.hash('password123', 10);
    const defaultSiswaPass = await bcrypt.hash('123456', 10);

    // Hapus akun-akun palsu/duplikat (Rdiwan, admin, pembimbing, adminadmin, 232410118)
    await conn.query(`
      DELETE FROM users 
      WHERE username IN ('Rdiwan', 'admin', 'pembimbing', 'adminadmin', '232410118')
    `);

    // Pastikan akun pembimbing memiliki username 'pak ridwan' dan name 'Pak Ridwan'
    await conn.query(`
      UPDATE users 
      SET name = 'Pak Ridwan', 
          username = 'pak ridwan', 
          email = 'pembimbing@sekolah.sch.id',
          photo = '/default-avatar.png'
      WHERE role = 'admin' OR id = 2
    `);

    const [adminCheck] = await conn.query(`SELECT id, name, username, email, role FROM users WHERE role = 'admin' LIMIT 1`);
    const pembimbingId = adminCheck[0]?.id;
    console.log('✅ Akun Pembimbing diperbarui:', adminCheck[0]);

    // 4. Pastikan 6 siswa resmi lengkap di tabel users dan students
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
        tempat: 'PT Digital Inovasi Asia',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: -6.396742,
        home_lng: 106.839228
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
        home_lat: null,
        home_lng: null
      },
      {
        nipd: '242510090',
        name: 'Muhammad Farhan',
        email: 'farhan@sekolah.sch.id',
        tempat: 'PT Solusi Data Utama',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: null,
        home_lng: null
      },
      {
        nipd: '242510095',
        name: 'Aulia Putri',
        email: 'aulia@sekolah.sch.id',
        tempat: 'PT Media Kreatif Sentosa',
        alamat_rumah: 'Cipanas 1 no 18 RT 01 RT 01 kelurahan bakti jaya, kecamatan Sukmajaya, kota Depok - 16418',
        alamat_pkl: 'SMK Taruna Bhakti, Jalan Kampung Baru, Curug, Depok, Jawa Barat, 16416, Indonesia',
        home_lat: null,
        home_lng: null
      },
    ];

    for (const st of studentList) {
      await conn.query(`
        INSERT INTO users (name, username, email, password, role, photo)
        VALUES (?, ?, ?, ?, 'siswa', '/default-avatar.png')
        ON DUPLICATE KEY UPDATE name=VALUES(name), photo='/default-avatar.png';
      `, [st.name, st.nipd, st.email, defaultSiswaPass]);

      const [uRows] = await conn.query(`SELECT id FROM users WHERE username=? LIMIT 1`, [st.nipd]);
      const userId = uRows[0]?.id;

      if (userId) {
        await conn.query(`
          INSERT INTO students (user_id, nis, class, major, tempat_pkl, alamat_rumah, alamat_pkl, target_lat, target_lng, home_lat, home_lng, radius_meters, pembimbing_id, periode_mulai, periode_selesai)
          VALUES (?, ?, 'XII RPL 1', 'Rekayasa Perangkat Lunak', ?, ?, ?, -6.384288, 106.869938, ?, ?, 10, ?, '2026-07-01', '2026-12-31')
          ON DUPLICATE KEY UPDATE tempat_pkl=VALUES(tempat_pkl), alamat_rumah=VALUES(alamat_rumah), alamat_pkl=VALUES(alamat_pkl), pembimbing_id=VALUES(pembimbing_id);
        `, [userId, st.nipd, st.tempat, st.alamat_rumah, st.alamat_pkl, st.home_lat, st.home_lng, pembimbingId]);
      }
    }
    console.log('✅ 6 Akun Siswa resmi dan pembimbing sinkron sepenuhnya.');

    // Verifikasi akhir
    const [attCount] = await conn.query('SELECT COUNT(*) as c FROM attendance');
    const [allUsers] = await conn.query('SELECT id, name, username, role FROM users ORDER BY id ASC');
    console.log('\n--- VERIFIKASI AKHIR DATABASE ---');
    console.log(`Jumlah data kehadiran (absen): ${attCount[0].c}`);
    console.log('Daftar pengguna aktif:');
    allUsers.forEach(u => console.log(`  [${u.id}] ${u.name} (username: "${u.username}", role: ${u.role})`));

  } catch (err) {
    console.error('Terjadi error:', err);
  } finally {
    await conn.end();
  }
}

resetAttendanceAndSync();
