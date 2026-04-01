const { Pool } = require("pg");
const env = require("../config/env");

function isLocalDatabaseUrl(connectionString) {
  if (!connectionString) return true;

  try {
    const parsed = new URL(connectionString);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch (_error) {
    return false;
  }
}

if (env.isProduction && isLocalDatabaseUrl(env.databaseUrl)) {
  throw new Error(
    "Invalid DATABASE_URL for production: it points to localhost. In Render, set DATABASE_URL to your Neon or Render Postgres connection string.",
  );
}

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

