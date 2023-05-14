const mysql = require('mysql2');

// Create a MariaDB connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'toleram'
});

module.exports = pool.promise();