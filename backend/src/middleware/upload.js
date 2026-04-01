const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../config/env");
const httpError = require("../utils/httpError");

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, env.uploadDir);
  },
  filename: (_req, file, callback) => {
    const safeExtension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${safeExtension}`);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeBytes,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        httpError(
          400,
          "Only JPG, PNG, WEBP, and GIF images are allowed for posts",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

module.exports = upload;

