import { Router } from 'express';
import { recompileKnowledgeBase } from '../lib/recompiler.js';

const router = Router();

router.post('/recompile', async (req, res) => {
  const adminKey = req.headers['x-admin-key'] as string;
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const scope = req.body?.scope as { climateRegion?: string; state?: string } | undefined;
    const result = await recompileKnowledgeBase(scope);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Recompilation error:', err);
    res.status(500).json({ error: 'Recompilation failed' });
  }
});

export default router;
