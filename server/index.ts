import app from './app.js';

// Long-lived server entry (local dev via `tsx watch`, production via
// `node dist/server/server/index.js` on Railway). Vercel uses api/index.js instead.
const PORT = parseInt(process.env.API_PORT || process.env.PORT || '5178', 10);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
