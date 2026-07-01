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

async function test() {
  console.log('Connecting to database with config:', config);
  try {
    const pool = await sql.connect(config);
    console.log('Connected successfully!');
    
    // Check tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log('Tables in database:', tables.recordset);

    // Check movies
    const moviesCount = await pool.request().query('SELECT COUNT(*) AS count FROM movies');
    console.log('Movies count:', moviesCount.recordset[0].count);

    if (moviesCount.recordset[0].count > 0) {
      const movies = await pool.request().query('SELECT * FROM movies');
      console.log('Movies details:', movies.recordset);
    }
    
    await pool.close();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
