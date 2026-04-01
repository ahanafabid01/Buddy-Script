const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.clientOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(path.resolve(env.uploadDir), {
    maxAge: "7d",
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication requests. Please try again later." },
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/feed", feedRoutes);

app.use((_req, _res, next) => {
  next(Object.assign(new Error("Route not found"), { status: 404 }));
});

app.use(errorHandler);

module.exports = app;

