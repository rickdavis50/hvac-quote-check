import 'dotenv/config';
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import quotesRouter from './routes/quotes.js';
import fairPriceRouter from './routes/fairPrice.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';
import metaRouter from './routes/meta.js';
import mcpRouter from './routes/mcp.js';
import seoRouter from './routes/seo.js';
import { getKbStats } from './lib/knowledgeBase.js';
import { METHODOLOGY_VERSION } from './lib/pricingEngine.js';
import { EXECUTOR_MODEL, ADVISOR_MODEL } from './lib/llmExtraction.js';
import { isSupabaseStore } from './lib/submissionStore.js';
import { mcpLimiter } from './lib/rateLimit.js';

// The Express app, with no network binding — so it runs both as a long-lived
// server (server/index.ts, used locally and on Railway) and as a single Vercel
// serverless function (api/index.js, which re-exports this app).
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Behind a hosting proxy (Railway/Vercel): trust the first hop so express-rate-limit
// and req.ip see the real client IP. 1 = one known proxy — safe; `true` would let
// clients spoof X-Forwarded-For to dodge the limiter.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));

// Payment routes go first (the Stripe webhook needs the raw, unparsed body).
app.use('/api', paymentsRouter);

// JSON parsing for everything else
app.use(express.json({ limit: '1mb' }));

app.use('/api/quotes', quotesRouter);
app.use('/api/fair-price', fairPriceRouter);
app.use('/api/admin', adminRouter);
app.use('/api/mcp', mcpLimiter, mcpRouter);
app.use('/api', metaRouter);

app.get('/api/health', (_req, res) => {
  const kbStats = getKbStats();
  res.json({
    ok: true,
    methodologyVersion: METHODOLOGY_VERSION,
    model: EXECUTOR_MODEL,
    models: { executor: EXECUTOR_MODEL, advisor: ADVISOR_MODEL },
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      supabase: isSupabaseStore,
    },
    kb: kbStats,
  });
});

// Agent-facing usage doc on the API origin (Vite serves the same file in dev;
// on Vercel the built copy in dist/client is served statically by the CDN).
app.get('/llms.txt', (_req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'llms.txt'));
});

// Programmatic SEO pages + sitemap/robots (server-rendered; before the SPA fallback).
app.use(seoRouter);

// Serve the built frontend when this app IS the whole service (local/Railway).
// On Vercel the CDN serves dist/client and this function is only invoked for
// /api/* — so this block is inert there (the bundle has no ../../client dir).
const distPath = join(__dirname, '..', '..', 'client');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

export default app;
