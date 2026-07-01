const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'cineflow_db',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  options: {
    instanceName: process.env.DB_INSTANCE || 'MSSQLSERVER1',
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = sql.connect(config);

module.exports = {
  sql,
  poolPromise
};