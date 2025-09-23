const { Pool } = require('pg');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL || 'postgres://planner:plannerpass@localhost:5432/taskbudget';
const pool = new Pool({
  connectionString,
});
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
