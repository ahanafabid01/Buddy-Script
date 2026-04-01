const fs = require("fs/promises");
const path = require("path");
const pool = require("../src/db/pool");

async function migrate() {
  const schemaPath = path.resolve(__dirname, "../sql/schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");

  await pool.query(sql);
  // eslint-disable-next-line no-console
  console.log("Database schema applied successfully.");

  await pool.end();
}

migrate().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to apply schema:", error);
  await pool.end();
  process.exit(1);
});

