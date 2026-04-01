const multer = require("multer");
const { ZodError } = require("zod");

function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error: `Upload error: ${error.message}`,
    });
  }

  const statusCode =
    Number.isInteger(error.status) && error.status >= 400
      ? error.status
      : 500;

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return res.status(statusCode).json({
    error: error.message || "Internal server error",
  });
}

module.exports = errorHandler;

