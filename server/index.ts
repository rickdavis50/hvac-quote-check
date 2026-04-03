import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT || '5178', 10);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
