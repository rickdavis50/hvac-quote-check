import { Router } from 'express';
import multer from 'multer';
import { processQuote, recomputeQuote, getSubmission } from '../lib/pipeline.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

const router = Router();

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  try {
    const userZip = req.body?.userZip as string | undefined;
    const result = await processQuote(req.file.buffer, req.file.mimetype, req.file.originalname, userZip);
    const response = { ...result };
    if (response.paidInsights) {
      const sub = getSubmission(result.submissionId);
      if (!sub?.paid) response.paidInsights = null;
    }
    res.status(201).json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing failed';
    if (message.includes('no extractable text') || message.includes('no readable text')) {
      res.status(422).json({ error: message });
    } else {
      console.error('Upload processing error:', err);
      res.status(500).json({ error: message });
    }
  }
});

router.get('/:id', (req, res) => {
  const submission = getSubmission(req.params.id);
  if (!submission || !submission.analysisResult) {
    res.status(404).json({ error: 'Quote not found or not yet processed' });
    return;
  }
  const response = { ...submission.analysisResult };
  if (response.paidInsights && !submission.paid) response.paidInsights = null;
  res.json(response);
});

router.post('/:id/recompute', async (req, res) => {
  try {
    const result = await recomputeQuote(req.params.id, req.body);
    const response = { ...result };
    const sub = getSubmission(req.params.id);
    if (response.paidInsights && !sub?.paid) response.paidInsights = null;
    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recompute failed';
    res.status(400).json({ error: message });
  }
});

export default router;
