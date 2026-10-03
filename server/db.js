// server/db.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "pernNC",
  password: process.env.PGPASSWORD || "",
  port: process.env.PGPORT || 5432,
});

module.exports = pool;
