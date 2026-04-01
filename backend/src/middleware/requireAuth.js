const env = require("../config/env");
const httpError = require("../utils/httpError");
const { verifyAuthToken } = require("../utils/authToken");

function requireAuth(req, _res, next) {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    return next(httpError(401, "Authentication required"));
  }

  try {
    const payload = verifyAuthToken(token);
    const userId = Number.parseInt(payload.sub, 10);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return next(httpError(401, "Invalid authentication token"));
    }

    req.auth = {
      userId,
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return next(httpError(401, "Invalid or expired authentication token"));
  }
}

module.exports = requireAuth;

