const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const requiredVariables = ["DATABASE_URL", "JWT_SECRET"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`,
  );
}

const maxFileSizeMb = Number.parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10);
const safeMaxFileSizeMb =
  Number.isFinite(maxFileSizeMb) && maxFileSizeMb > 0 ? maxFileSizeMb : 5;

const port = Number.parseInt(process.env.PORT || "4000", 10);

module.exports = {
  nodeEnv: NODE_ENV,
  isProduction,
  port: Number.isFinite(port) ? port : 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cookieName: process.env.COOKIE_NAME || "appifylab_token",
  csrfCookieName: process.env.CSRF_COOKIE_NAME || "appifylab_csrf",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads"),
  maxFileSizeBytes: safeMaxFileSizeMb * 1024 * 1024,
};

