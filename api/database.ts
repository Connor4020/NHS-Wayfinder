import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '10.71.197.183', // update to the host of the database
  user: process.env.DB_USER || 'TEST1', // create a user to have access to the database
  password: process.env.DB_PASS || 'Password123', // the password for the user
  database: process.env.DB_NAME || 'mysql', // the name of the database to connect to
  waitForConnections: true, 
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
