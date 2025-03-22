const mysql = require("mysql2");

// Create a MariaDB connection pool
dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    decimalNumbers: true,
    port: process.env.DB_PORT

};

const pool = mysql.createPool(dbConfig);

module.exports = pool.promise();
