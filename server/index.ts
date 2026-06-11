import 'dotenv/config';
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import quotesRouter from './routes/quotes.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';
import metaRouter from './routes/meta.js';
import mcpRouter from './routes/mcp.js';
import { getKbStats } from './lib/knowledgeBase.js';
import { METHODOLOGY_VERSION } from './lib/pricingEngine.js';
import { EXTRACTION_MODEL } from './lib/llmExtraction.js';
import { mcpLimiter } from './lib/rateLimit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Behind a hosting proxy (e.g. Railway): trust the first hop so express-rate-limit
// and req.ip see the real client IP. 1 = one known proxy — safe; `true` would let
// clients spoof X-Forwarded-For to dodge the limiter.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));

// Payment routes go first (webhook needs raw body)
app.use('/api', paymentsRouter);

// JSON parsing for everything else
app.use(express.json({ limit: '1mb' }));

app.use('/api/quotes', quotesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/mcp', mcpLimiter, mcpRouter);
app.use('/api', metaRouter);

const PORT = parseInt(process.env.API_PORT || process.env.PORT || '5178', 10);

app.get('/api/health', (_req, res) => {
  const kbStats = getKbStats();
  res.json({
    ok: true,
    methodologyVersion: METHODOLOGY_VERSION,
    model: EXTRACTION_MODEL,
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
    kb: kbStats,
  });
});

// Agent-facing usage doc on the API origin (Vite serves the same file in dev)
app.get('/llms.txt', (_req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'llms.txt'));
});

// Serve built frontend in production
const distPath = join(__dirname, '..', '..', 'client');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
