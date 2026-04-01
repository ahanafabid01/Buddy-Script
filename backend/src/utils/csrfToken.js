const crypto = require("crypto");
const env = require("../config/env");
const { getCsrfCookieOptions } = require("./authToken");

function issueCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(env.csrfCookieName, token, getCsrfCookieOptions());
  return token;
}

function clearCsrfCookie(res) {
  res.clearCookie(env.csrfCookieName, {
    ...getCsrfCookieOptions(),
    maxAge: undefined,
  });
}

module.exports = {
  issueCsrfCookie,
  clearCsrfCookie,
};
