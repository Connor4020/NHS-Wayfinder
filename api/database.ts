import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '10.71.197.183',
  user: process.env.DB_USER || 'TEST1',
  password: process.env.DB_PASS || 'Password123',
  database: process.env.DB_NAME || 'mysql',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
