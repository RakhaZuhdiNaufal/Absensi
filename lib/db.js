import mysql from 'mysql2/promise';

let pool = global._mysqlPool;

if (!pool) {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'absensi_pkl',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });
    global._mysqlPool = pool;
  } catch (err) {
    console.warn('MySQL pool initialization warning:', err.message);
  }
}

export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database pool connection not initialized');
  }
  const [rows, fields] = await pool.query(sql, params);
  return rows;
}

export default pool;
