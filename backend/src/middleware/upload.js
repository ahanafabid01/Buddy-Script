const multer = require("multer");
const env = require("../config/env");
const httpError = require("../utils/httpError");

const storage = multer.memoryStorage();

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

