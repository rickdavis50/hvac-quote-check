import type { AnalysisResult, QuoteSubmission, SystemType } from '../types.js';
import { prepareInput, type ExtractionInput } from './extraction.js';
import { extractHeuristic } from './heuristicExtraction.js';
import { extractWithLlm } from './llmExtraction.js';
import { mergeExtractions, normalize } from './normalization.js';
import { validateForKnowledgeBase } from './validation.js';
import { storeRawQuote } from './knowledgeBase.js';
import { priceWithMarket, composeResult } from './analyzer.js';
import { saveSubmission, getSubmission } from './submissionStore.js';
import { v4 as uuid } from 'uuid';

export { getSubmission, markPaid } from './submissionStore.js';

export type PipelineStage = 'reading' | 'extracting' | 'pricing' | 'writing';

export class QuoteProcessingError extends Error {
  status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}

export interface AnalyzeRequest {
  file?: { buffer: Buffer; mimeType: string; filename: string };
  text?: string;
  userZip?: string;
}

export async function processQuote(
  request: AnalyzeRequest,
  onStage?: (stage: PipelineStage) => void
): Promise<AnalysisResult> {
  const submissionId = uuid();
  const submission: QuoteSubmission = {
    id: submissionId,
    status: 'processing',
    originalFilename: request.file?.filename ?? 'pasted-text',
    mimeType: request.file?.mimeType ?? 'text/plain',
    rawText: null,
    analysisResult: null,
    paid: false,
    createdAt: new Date().toISOString(),
  };

  onStage?.('reading');
  let input: ExtractionInput;
  if (request.file) {
    input = await prepareInput(request.file.buffer, request.file.mimeType);
  } else if (request.text?.trim()) {
    input = { text: request.text.trim(), method: 'text', document: null };
  } else {
    throw new QuoteProcessingError('Provide a quote file or pasted quote text.', 400);
  }
  submission.rawText = input.text;

  if (!input.text && !process.env.ANTHROPIC_API_KEY) {
    throw new QuoteProcessingError(
      'This document has no readable text layer and AI extraction is not configured. Paste the quote text instead.'
    );
  }

  onStage?.('extracting');
  const [heuristicResult, llmResult] = await Promise.all([
    Promise.resolve(extractHeuristic(input.text ?? '')),
    extractWithLlm(input),
  ]);

  const merged = mergeExtractions(llmResult, heuristicResult);
  if (request.userZip && (!merged.zipCode || merged.zipCode === '00000')) {
    merged.zipCode = request.userZip;
  }

  if (!merged.quotedTotal || merged.quotedTotal <= 0) {
    throw new QuoteProcessingError(
      "We couldn't find a total price in this quote. Check that the document shows the full quoted amount, or paste the quote text including the total."
    );
  }

  const normalized = normalize(merged);
  const validation = validateForKnowledgeBase(normalized);
  // HVAC_DISABLE_KB_WRITES keeps eval/test runs from polluting the benchmark data
  if (validation.passed && !process.env.HVAC_DISABLE_KB_WRITES) {
    storeRawQuote(normalized, 'user', 'extracted');
  }

  onStage?.('pricing');
  const { pricing, comparables } = priceWithMarket(normalized);

  onStage?.('writing');
  const analysis = await composeResult(normalized, pricing, comparables, submissionId);

  submission.status = 'processed';
  submission.analysisResult = analysis;
  await saveSubmission(submission);
  return analysis;
}

export async function recomputeQuote(
  submissionId: string,
  corrections: Record<string, unknown>
): Promise<AnalysisResult> {
  const submission = await getSubmission(submissionId);
  if (!submission || !submission.analysisResult) {
    throw new QuoteProcessingError('Submission not found or not yet processed', 404);
  }

  const existing = submission.analysisResult.extractedData;
  const corrected = { ...existing, ...corrections };

  const normalized = normalize({
    contractorName: corrected.contractorName as string | null,
    quotedTotal: submission.analysisResult.quotedTotal,
    jobType: corrected.jobType as string,
    systemType: corrected.systemType as SystemType,
    equipmentBrand: corrected.equipmentBrand as string | null,
    seer2: corrected.seer2 as number | null,
    tonnage: corrected.tonnage as number | null,
    qualityTierHint: corrected.qualityTier as string | null,
    zipCode: corrected.zipCode as string,
    warrantyYears: corrected.warrantyYears as number | null,
    permitsIncluded: corrected.permitsIncluded as boolean,
    ductworkIncluded: corrected.ductworkIncluded as boolean,
    electricalIncluded: corrected.electricalIncluded as boolean,
    lineItems: corrected.lineItems as Array<{ category: string; description: string; amount: number }>,
    confidence: 0.9,
  });

  const validation = validateForKnowledgeBase(normalized);
  if (validation.passed && !process.env.HVAC_DISABLE_KB_WRITES) {
    storeRawQuote(normalized, 'user', 'user_verified');
  }

  const { pricing, comparables } = priceWithMarket(normalized);
  const analysis = await composeResult(normalized, pricing, comparables, submissionId);
  submission.analysisResult = analysis;
  await saveSubmission(submission);
  return analysis;
}
