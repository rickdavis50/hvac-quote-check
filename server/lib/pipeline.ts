import type { AnalysisResult, QuoteSubmission } from '../types.js';
import { extractText } from './extraction.js';
import { extractHeuristic } from './heuristicExtraction.js';
import { extractWithLlm } from './llmExtraction.js';
import { mergeExtractions, normalize } from './normalization.js';
import { validateForKnowledgeBase } from './validation.js';
import { storeRawQuote } from './knowledgeBase.js';
import { analyzeQuote } from './analyzer.js';
import { v4 as uuid } from 'uuid';

const submissions = new Map<string, QuoteSubmission>();

export function getSubmission(id: string): QuoteSubmission | undefined {
  return submissions.get(id);
}

export function markPaid(id: string): boolean {
  const sub = submissions.get(id);
  if (!sub) return false;
  sub.paid = true;
  return true;
}

export async function processQuote(
  buffer: Buffer,
  mimeType: string,
  originalFilename: string,
  userZip?: string
): Promise<AnalysisResult> {
  const submissionId = uuid();
  const submission: QuoteSubmission = {
    id: submissionId,
    status: 'received',
    originalFilename,
    mimeType,
    rawText: null,
    analysisResult: null,
    paid: false,
    createdAt: new Date().toISOString(),
  };
  submissions.set(submissionId, submission);

  submission.status = 'processing';
  const { text } = await extractText(buffer, mimeType);
  submission.rawText = text;

  const [heuristicResult, llmResult] = await Promise.all([
    Promise.resolve(extractHeuristic(text)),
    extractWithLlm(text),
  ]);

  const merged = mergeExtractions(llmResult, heuristicResult);
  if (userZip && (!merged.zipCode || merged.zipCode === '00000')) {
    merged.zipCode = userZip;
  }

  const normalized = normalize(merged);
  const validation = validateForKnowledgeBase(normalized);
  if (validation.passed) {
    storeRawQuote(normalized, 'user', 'extracted');
  }

  const analysis = await analyzeQuote(normalized, submissionId);
  submission.status = 'processed';
  submission.analysisResult = analysis;
  return analysis;
}

export async function recomputeQuote(
  submissionId: string,
  corrections: Record<string, unknown>
): Promise<AnalysisResult> {
  const submission = submissions.get(submissionId);
  if (!submission || !submission.analysisResult) {
    throw new Error('Submission not found or not yet processed');
  }

  const existing = submission.analysisResult.extractedData;
  const corrected = { ...existing, ...corrections };

  const normalized = normalize({
    contractorName: corrected.contractorName as string | null,
    quotedTotal: submission.analysisResult.quotedTotal,
    jobType: corrected.jobType as string,
    systemType: corrected.systemType as string,
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
  if (validation.passed) {
    storeRawQuote(normalized, 'user', 'user_verified');
  }

  const analysis = await analyzeQuote(normalized, submissionId);
  submission.analysisResult = analysis;
  return analysis;
}
