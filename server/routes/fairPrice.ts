import { Router } from 'express';
import { estimateFairPrice, FairPriceError } from '../lib/fairPrice.js';

const router = Router();

// GET /api/fair-price?zip=98109&systemType=central_heat_pump&tonnage=3&qualityTier=mid&ductwork=0&electrical=1&permits=1
// Pure deterministic math — no LLM call, no rate limit needed.
router.get('/', (req, res) => {
  try {
    const q = req.query;
    const bool = (v: unknown) => v === '1' || v === 'true' || v === 'yes';
    const estimate = estimateFairPrice({
      zip: String(q.zip ?? ''),
      systemType: q.systemType ? String(q.systemType) : undefined,
      tonnage: q.tonnage !== undefined ? Number(q.tonnage) : undefined,
      qualityTier: q.qualityTier ? String(q.qualityTier) : undefined,
      ductwork: q.ductwork !== undefined ? bool(q.ductwork) : undefined,
      electrical: q.electrical !== undefined ? bool(q.electrical) : undefined,
      permits: q.permits !== undefined ? bool(q.permits) : undefined,
    });
    res.json(estimate);
  } catch (err) {
    if (err instanceof FairPriceError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error('Fair price error:', err);
    res.status(500).json({ error: 'Fair price estimation failed' });
  }
});

export default router;
