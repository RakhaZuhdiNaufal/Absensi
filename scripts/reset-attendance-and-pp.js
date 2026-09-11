const mysql = require('mysql2/promise');

async function resetAttendanceAndPP() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'absensi_pkl';

  console.log(`Connecting to database ${database}...`);
  const conn = await mysql.createConnection({ host, port, user, password, database });

  try {
    const [attCountBefore] = await conn.query('SELECT COUNT(*) as cnt FROM attendance');
    console.log(`Jumlah data kehadiran sebelum dihapus: ${attCountBefore[0].cnt}`);

    await conn.query('DELETE FROM attendance');
    console.log('Semua data absensi/kehadiran berhasil dikosongkan.');

    const [studentsBefore] = await conn.query(
      "SELECT id, name, username, photo FROM users WHERE role = 'siswa'"
    );
    console.log(`Ditemukan ${studentsBefore.length} akun siswa.`);

    await conn.query(
      "UPDATE users SET photo = '/default-avatar.png' WHERE role = 'siswa'"
    );
    console.log("Foto profil (PP) semua siswa berhasil di-reset ke default ('/default-avatar.png').");

    const [attCountAfter] = await conn.query('SELECT COUNT(*) as cnt FROM attendance');
    const [studentsAfter] = await conn.query(
      "SELECT id, name, username, photo FROM users WHERE role = 'siswa'"
    );

    console.log('\n--- HASIL VERIFIKASI ---');
    console.log(`Total data kehadiran sekarang: ${attCountAfter[0].cnt}`);
    console.log('Daftar foto profil siswa sekarang:');
    studentsAfter.forEach(s => {
      console.log(`- [${s.username}] ${s.name}: ${s.photo}`);
    });

  } catch (err) {
    console.error('Terjadi kesalahan:', err);
  } finally {
    await conn.end();
  }
}

resetAttendanceAndPP();
