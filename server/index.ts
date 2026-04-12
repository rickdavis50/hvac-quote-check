import 'dotenv/config';
import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import quotesRouter from './routes/quotes.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';
import { getKbStats } from './lib/knowledgeBase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Payment routes go first (webhook needs raw body)
app.use('/api', paymentsRouter);

// JSON parsing for everything else
app.use(express.json());

app.use('/api/quotes', quotesRouter);
app.use('/api/admin', adminRouter);

const PORT = parseInt(process.env.PORT || '5178', 10);

app.get('/api/health', (_req, res) => {
  const kbStats = getKbStats();
  res.json({
    ok: true,
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
    kb: kbStats,
  });
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
