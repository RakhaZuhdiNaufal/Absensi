const mysql = require('mysql2/promise');

async function sync() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'absensi_pkl'
  });

  await conn.query("UPDATE users SET name = 'Pak Ridwan' WHERE id = 2");
  const [rows] = await conn.query("SELECT id, name, role FROM users WHERE id = 2");
  console.log('User 2 is now:', rows[0]);

  const [st] = await conn.query("SELECT s.id, s.user_id, s.pembimbing_name, u.name as student_name FROM students s JOIN users u ON s.user_id = u.id");
  console.log('Students pembimbing_name:', st);

  await conn.end();
}

sync();
