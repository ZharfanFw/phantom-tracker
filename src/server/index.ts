import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initDb } from './db/index.ts';
import { habitsRouter } from './routes/habits.ts';
import { checkinsRouter } from './routes/checkins.ts';
import { todosRouter } from './routes/todos.ts';
import { widgetsRouter } from './routes/widgets.ts';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'Habit & Routine Tracker API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/habits', habitsRouter);
app.route('/api/habits', checkinsRouter);
app.route('/api/todos', todosRouter);
app.route('/api/widgets', widgetsRouter);

// Serve static frontend in production if dist exists
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', serveStatic({ path: './dist/index.html' }));
}

// Initialize DB schema & Start server
const PORT = parseInt(process.env.PORT || '5050', 10);

async function start() {
  await initDb();

  console.log(`[SERVER] Phantom Habit Server running at http://0.0.0.0:${PORT}`);
  serve({
    fetch: app.fetch,
    port: PORT,
  });
}

start().catch((err) => {
  console.error('[SERVER ERROR] Failed to start server:', err);
});
