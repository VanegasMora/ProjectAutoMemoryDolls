const oracledb = require('oracledb');
const dbConfig = require('../config/database');

// Simple initialization - use thin mode by default
async function initializeOracle() {
  try {
    // Skip Oracle client initialization - use thin mode
    console.log('✅ Oracle thin mode initialized (no client installation required)');
    console.log('📝 This mode works for development and testing');
  } catch (err) {
    console.error('❌ Error initializing Oracle:', err);
    throw err;
  }
}

// Get database connection
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('❌ Error getting database connection:', err);
    throw err;
  }
}

// Execute query with automatic connection management
async function executeQuery(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, { 
      autoCommit: true,
      ...options 
    });
    return result;
  } catch (err) {
    console.error('❌ Database query error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('❌ Error closing connection:', closeErr);
      }
    }
  }
}

module.exports = {
  initializeOracle,
  getConnection,
  executeQuery
};
