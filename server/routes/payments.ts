import { Router, raw } from 'express';
import { createCheckoutSession, verifyWebhookSignature, isStripeConfigured } from '../lib/stripe.js';
import { getSubmission, markPaid } from '../lib/pipeline.js';

const router = Router();

router.post('/quotes/:id/unlock', async (req, res) => {
  if (!isStripeConfigured()) { res.status(503).json({ error: 'Payments not configured' }); return; }
  const submission = await getSubmission(req.params.id);
  if (!submission || !submission.analysisResult) { res.status(404).json({ error: 'Quote not found' }); return; }
  if (submission.analysisResult.rating !== 'High' || submission.analysisResult.savingsPotential < 500) {
    res.status(400).json({ error: 'No paid insights available for this quote' }); return;
  }
  if (submission.paid) { res.json({ alreadyPaid: true }); return; }
  try {
    const checkoutUrl = await createCheckoutSession(req.params.id);
    res.json({ checkoutUrl });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.get('/quotes/:id/insights', async (req, res) => {
  const submission = await getSubmission(req.params.id);
  if (!submission || !submission.analysisResult) { res.status(404).json({ error: 'Quote not found' }); return; }
  if (!submission.analysisResult.paidInsights) { res.status(404).json({ error: 'No paid insights for this quote' }); return; }
  if (!submission.paid) { res.status(402).json({ error: 'Payment required' }); return; }
  res.json(submission.analysisResult.paidInsights);
});

router.post('/webhooks/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) { res.status(400).json({ error: 'Missing stripe-signature header' }); return; }
  try {
    const event = verifyWebhookSignature(req.body, sig);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { metadata?: { submissionId?: string } };
      const submissionId = session.metadata?.submissionId;
      if (submissionId) { await markPaid(submissionId); console.log(`Payment confirmed for submission ${submissionId}`); }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

export default router;
