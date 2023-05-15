const mysql = require('mysql2');
const config = require('./config');

// Accessing the database configuration values
const databaseConfig = config.database;
const host = databaseConfig.host;
// const port = databaseConfig.port;
const databaseName = databaseConfig.name;
const user = databaseConfig.user;
const password = databaseConfig.password;

// Create a MariaDB connection pool
const pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: databaseName
});

module.exports = pool.promise();