const fs = require("fs/promises");
const path = require("path");
const pool = require("../src/db/pool");
const env = require("../src/config/env");

function mimeTypeFromFileName(fileName) {
  const ext = path.extname(fileName).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";

  return "application/octet-stream";
}

function fileNameFromUploadPath(uploadPath) {
  return String(uploadPath || "").replace(/^\/uploads\//, "").trim();
}

async function convertUploadPathToDataUrl(uploadPath) {
  const fileName = fileNameFromUploadPath(uploadPath);
  if (!fileName) return null;

  const absolutePath = path.resolve(env.uploadDir, fileName);
  const fileBuffer = await fs.readFile(absolutePath);
  const mimeType = mimeTypeFromFileName(fileName);
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

async function migrateTable(client, tableName) {
  const { rows } = await client.query(
    `SELECT id, image_url FROM ${tableName} WHERE image_url LIKE '/uploads/%' ORDER BY id ASC`,
  );

  let migrated = 0;
  let missing = 0;

  for (const row of rows) {
    try {
      const dataUrl = await convertUploadPathToDataUrl(row.image_url);
      if (!dataUrl) {
        missing += 1;
        // eslint-disable-next-line no-console
        console.warn(`[${tableName}] Skipped empty image path for id=${row.id}`);
        continue;
      }

      await client.query(
        `UPDATE ${tableName} SET image_url = $1 WHERE id = $2`,
        [dataUrl, row.id],
      );
      migrated += 1;
    } catch (error) {
      if (error && error.code === "ENOENT") {
        missing += 1;
        // eslint-disable-next-line no-console
        console.warn(`[${tableName}] File not found for id=${row.id}: ${row.image_url}`);
        continue;
      }

      throw error;
    }
  }

  return {
    totalCandidates: rows.length,
    migrated,
    missing,
  };
}

async function getRemainingUploadPathCount(client, tableName) {
  const { rows } = await client.query(
    `SELECT COUNT(1)::int AS count FROM ${tableName} WHERE image_url LIKE '/uploads/%'`,
  );
  return rows[0].count;
}

async function run() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const postsResult = await migrateTable(client, "posts");
    const commentsResult = await migrateTable(client, "comments");

    await client.query("COMMIT");

    const postsRemaining = await getRemainingUploadPathCount(client, "posts");
    const commentsRemaining = await getRemainingUploadPathCount(client, "comments");

    // eslint-disable-next-line no-console
    console.log("Migration complete.");
    // eslint-disable-next-line no-console
    console.log({
      posts: postsResult,
      comments: commentsResult,
      remainingUploadPaths: {
        posts: postsRemaining,
        comments: commentsRemaining,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to migrate uploads to data URLs:", error);
  process.exit(1);
});
