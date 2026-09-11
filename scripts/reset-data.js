const mysql = require('mysql2/promise');

async function resetAll() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'absensi_pkl'
    });
    console.log('Connected to MySQL!');

    const [delAtt] = await conn.query('DELETE FROM attendance');
    console.log('Deleted attendance rows:', delAtt.affectedRows);

    const [delAct] = await conn.query('DELETE FROM pkl_activities');
    console.log('Deleted pkl_activities rows:', delAct.affectedRows);

    const [updBio] = await conn.query("UPDATE students SET bio = ''");
    console.log('Updated students bio to empty, affected rows:', updBio.affectedRows);

    const [attCount] = await conn.query('SELECT COUNT(*) as c FROM attendance');
    console.log('Remaining attendance in DB:', attCount[0].c);

    const [actCount] = await conn.query('SELECT COUNT(*) as c FROM pkl_activities');
    console.log('Remaining activities in DB:', actCount[0].c);

    const [students] = await conn.query('SELECT s.id, s.nis, s.bio, u.name FROM students s JOIN users u ON s.user_id = u.id');
    console.log('Students status:');
    students.forEach(s => console.log(` - ${s.name} (${s.nis}): bio="${s.bio}"`));

    await conn.end();
    console.log('RESET ALL COMPLETED SUCCESSFULLY IN MYSQL DATABASE!');
  } catch (e) {
    console.error('Error during reset:', e);
  }
}

resetAll();
