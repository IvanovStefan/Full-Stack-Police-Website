const sql = require('mssql');

// SQL Server configuration
const sqlConfig = {
    user: 'police', // Replace with your SQL Server username
    password: 'police', // Replace with your SQL Server password
    server: 'STEFANPC', // Replace with your server name or IP
    database: 'DatabasePolitie',
    options: {
        encrypt: false, // Use true if you're on Azure
        trustServerCertificate: true, // Change to true if you're using self-signed certificates
        instance: 'SQLEXPRESS'
    }
};

// Create a function to connect and query the database
async function connectToDb() {
  try {
    const pool = await sql.connect(sqlConfig);
    console.log('Connected to MSSQL');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

module.exports = {
  sql,
  connectToDb,
};