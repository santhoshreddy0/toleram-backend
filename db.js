const mysql = require('mysql2');

// Create a MariaDB connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'kiran',
  password: 'kiran',
  database: 'tolaram'
});

module.exports = pool.promise();