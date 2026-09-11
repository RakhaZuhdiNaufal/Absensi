import mysql from 'mysql2/promise';

let pool = global._mysqlPool;

if (!pool) {
  try {
    const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
    const isSslRequired = process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true';

    if (connectionUri) {
      pool = mysql.createPool({
        uri: connectionUri,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 15000,
        ssl: isSslRequired ? { rejectUnauthorized: false } : undefined
      });
    } else {
      pool = mysql.createPool({
        host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
        user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
        database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'absensi_pkl',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 15000,
        ssl: isSslRequired ? { rejectUnauthorized: false } : undefined
      });
    }
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
