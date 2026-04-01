const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const pool = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const env = require("../config/env");
const httpError = require("../utils/httpError");
const { createAuthToken, getCookieOptions } = require("../utils/authToken");

const router = express.Router();

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(72),
});

function toPublicUser(row) {
  return {
    id: Number.parseInt(row.id, 10),
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(parsed.password, 12);

    const { rows } = await pool.query(
      `
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email, created_at
      `,
      [parsed.firstName, parsed.lastName, parsed.email, passwordHash],
    );

    const user = toPublicUser(rows[0]);
    const token = createAuthToken(user);

    res.cookie(env.cookieName, token, getCookieOptions());
    return res.status(201).json({ user });
  } catch (error) {
    if (error.code === "23505") {
      return next(httpError(409, "Email already registered"));
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const { rows } = await pool.query(
      `
        SELECT id, first_name, last_name, email, password_hash, created_at
        FROM users
        WHERE email = $1
      `,
      [parsed.email],
    );

    if (rows.length === 0) {
      throw httpError(401, "Invalid email or password");
    }

    const account = rows[0];
    const passwordMatches = await bcrypt.compare(parsed.password, account.password_hash);
    if (!passwordMatches) {
      throw httpError(401, "Invalid email or password");
    }

    const user = toPublicUser(account);
    const token = createAuthToken(user);

    res.cookie(env.cookieName, token, getCookieOptions());
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(env.cookieName, {
    ...getCookieOptions(),
    maxAge: undefined,
  });
  return res.status(204).send();
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT id, first_name, last_name, email, created_at
        FROM users
        WHERE id = $1
      `,
      [req.auth.userId],
    );

    if (rows.length === 0) {
      throw httpError(401, "Authenticated user no longer exists");
    }

    return res.json({ user: toPublicUser(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

