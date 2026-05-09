const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────

// Set secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.isProduction
      ? ['https://yourfrontend.com'] // restrict in production
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Prevent NoSQL injection — strips $ and . from req.body, params, query
app.use(mongoSanitize());

// Global rate limiter — 100 requests per 15 min per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Try again later.' },
  })
);

// ── General Middleware ────────────────────────────────────────────────────────

// Parse incoming JSON bodies (limit size to prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging (skip in test environment)
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/v1', routes);

// ── Error Handling ────────────────────────────────────────────────────────────

// 404 — must come after all routes
app.use(notFound);

// Global error handler — must come last, must have 4 params
app.use(errorHandler);

module.exports = app;
