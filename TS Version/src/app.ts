import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import config from './config';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────

// Secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.isProduction ? ['https://yourfrontend.com'] : '*',
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

// Parse JSON body (limit size to prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded body (form data)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/v1', routes);

// ── Error Handling ────────────────────────────────────────────────────────────

// 404 — must come after all routes
app.use(notFound);

// Global error handler — must be last, must have 4 params
app.use(errorHandler);

export default app;
