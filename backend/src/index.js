const app = require("./app");
const env = require("./config/env");
const pool = require("./db/pool");

async function startServer() {
  await pool.query("SELECT 1");

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", error);
  process.exit(1);
});

