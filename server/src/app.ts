import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';

import healthRouter from './routes/health.js';
import overviewRouter from './routes/overview.js';
import daosRouter from './routes/daos.js';
import delegatesRouter from './routes/delegates.js';
import proposalsRouter from './routes/proposals.js';
import scorecardsRouter from './routes/scorecards.js';
import rewardsRouter from './routes/rewards.js';
import guardianRouter from './routes/guardian.js';
import analysisRouter from './routes/analysis.js';
import forumRouter from './routes/forum.js';
import blockchainRouter from './routes/blockchain.js';

export const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow localhost or 127.0.0.1
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow configured FRONTEND_URL
      if (config.FRONTEND_URL && origin === config.FRONTEND_URL) {
        return callback(null, true);
      }

      // Allow any vercel.app domain (including preview deployments and production)
      if (/\.vercel\.app$/.test(origin) || origin === 'https://turnout-navy.vercel.app') {
        return callback(null, true);
      }

      // Default allow for web clients
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// URL Normalization Middleware: ensure requests routed via serverless or rewrites match /api routers
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 300;

app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientLimit = requestCounts.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientLimit.resetAt) {
    clientLimit.count = 1;
    clientLimit.resetAt = now + RATE_LIMIT_WINDOW_MS;
  } else {
    clientLimit.count++;
  }

  requestCounts.set(ip, clientLimit);

  if (clientLimit.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait before issuing additional requests.',
    });
  }

  next();
});

// API Routes
app.use('/api', healthRouter);
app.use('/api', overviewRouter);
app.use('/api', daosRouter);
app.use('/api', delegatesRouter);
app.use('/api', proposalsRouter);
app.use('/api', scorecardsRouter);
app.use('/api', rewardsRouter);
app.use('/api', guardianRouter);
app.use('/api', analysisRouter);
app.use('/api', forumRouter);
app.use('/api', blockchainRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error occurred',
  });
});

