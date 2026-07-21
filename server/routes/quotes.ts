import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { processQuote, recomputeQuote, getSubmission, QuoteProcessingError, type AnalyzeRequest, type PipelineStage } from '../lib/pipeline.js';
import { analyzeLimiter } from '../lib/rateLimit.js';
import type { AnalysisResult } from '../types.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use a PDF, image, or plain text.`));
    }
  },
});

const router = Router();

const STAGE_LABELS: Record<PipelineStage, string> = {
  reading: 'Reading your document',
  extracting: 'Extracting quote details with AI',
  pricing: 'Pricing it against your local market',
  writing: 'Writing your report',
};

async function stripUnpaid(result: AnalysisResult): Promise<AnalysisResult> {
  if (!result.paidInsights) return result;
  const submission = await getSubmission(result.submissionId);
  if (submission?.paid) return result;
  return { ...result, paidInsights: null };
}

function buildAnalyzeRequest(req: Request): AnalyzeRequest {
  const userZip = (req.body?.zipCode ?? req.body?.userZip) as string | undefined;
  if (req.file) {
    return {
      file: { buffer: req.file.buffer, mimeType: req.file.mimetype, filename: req.file.originalname },
      userZip,
    };
  }
  return { text: req.body?.text as string | undefined, userZip };
}

async function handleAnalyze(req: Request, res: Response): Promise<void> {
  const wantsStream = req.headers.accept?.includes('text/event-stream') ?? false;

  if (!wantsStream) {
    try {
      const result = await processQuote(buildAnalyzeRequest(req));
      res.status(201).json(await stripUnpaid(result));
    } catch (err) {
      respondWithError(res, err);
    }
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await processQuote(buildAnalyzeRequest(req), (stage) => {
      sendEvent('stage', { stage, label: STAGE_LABELS[stage] });
    });
    sendEvent('result', await stripUnpaid(result));
  } catch (err) {
    const { status, message } = describeError(err);
    sendEvent('error', { status, error: message });
  } finally {
    res.end();
  }
}

function describeError(err: unknown): { status: number; message: string } {
  if (err instanceof QuoteProcessingError) return { status: err.status, message: err.message };
  const message = err instanceof Error ? err.message : 'Processing failed';
  if (message.includes('Unsupported file type') || message.includes('Empty text document')) {
    return { status: 400, message };
  }
  console.error('Quote processing error:', err);
  return { status: 500, message };
}

function respondWithError(res: Response, err: unknown): void {
  const { status, message } = describeError(err);
  res.status(status).json({ error: message });
}

// Primary endpoint: multipart file upload OR JSON {text, zipCode}.
// With Accept: text/event-stream, streams real pipeline stages before the result.
// Rate-limited because each call spends Claude tokens.
router.post('/analyze', analyzeLimiter, upload.single('file'), handleAnalyze);

// Back-compat alias for the original upload-only endpoint.
router.post('/upload', analyzeLimiter, upload.single('file'), handleAnalyze);

router.get('/:id', async (req, res) => {
  const submission = await getSubmission(req.params.id);
  if (!submission || !submission.analysisResult) {
    res.status(404).json({ error: 'Quote not found or not yet processed' });
    return;
  }
  res.json(await stripUnpaid(submission.analysisResult));
});

router.post('/:id/recompute', async (req, res) => {
  try {
    const result = await recomputeQuote(req.params.id, req.body);
    res.json(await stripUnpaid(result));
  } catch (err) {
    respondWithError(res, err);
  }
});

export default router;
