const crypto = require("crypto");
const env = require("../config/env");
const httpError = require("../utils/httpError");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const EXEMPT_PATHS = new Set([
  "/api/health",
  "/api/auth/login",
  "/api/auth/register",
]);

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  const csrfCookieToken = req.cookies?.[env.csrfCookieName];
  const csrfHeaderToken = req.get("x-csrf-token");

  if (!csrfCookieToken || !csrfHeaderToken) {
    return next(httpError(403, "CSRF token is required"));
  }

  if (!timingSafeEqual(csrfCookieToken, csrfHeaderToken)) {
    return next(httpError(403, "Invalid CSRF token"));
  }

  return next();
}

module.exports = csrfProtection;
