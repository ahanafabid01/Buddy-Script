const { Pool } = require("pg");
const env = require("../config/env");

const useSsl =
  process.env.DATABASE_SSL === "true" ||
  env.databaseUrl.includes("neon.tech") ||
  env.databaseUrl.includes("sslmode=require");

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

module.exports = pool;

