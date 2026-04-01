const jwt = require("jsonwebtoken");
const env = require("../config/env");

function parseDurationToMs(duration) {
  if (!duration) return 7 * 24 * 60 * 60 * 1000;

  if (/^\d+$/.test(duration)) {
    return Number.parseInt(duration, 10) * 1000;
  }

  const match = duration.match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

function createAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: parseDurationToMs(env.jwtExpiresIn),
  };
}

function getCsrfCookieOptions() {
  return {
    ...getCookieOptions(),
    httpOnly: false,
  };
}

module.exports = {
  createAuthToken,
  verifyAuthToken,
  getCookieOptions,
  getCsrfCookieOptions,
};

