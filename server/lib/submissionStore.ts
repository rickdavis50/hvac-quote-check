import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { QuoteSubmission } from '../types.js';

// Disk-backed submission store: one JSON file per submission so results,
// share links, and payment state survive server restarts.
// In production point HVAC_SUBMISSIONS_DIR at a mounted volume so paid reports
// survive redeploys (the default lives in the ephemeral app filesystem).
const STORE_DIR = process.env.HVAC_SUBMISSIONS_DIR || join(process.cwd(), 'data', 'submissions');

const cache = new Map<string, QuoteSubmission>();

function fileFor(id: string): string {
  return join(STORE_DIR, `${id}.json`);
}

export function saveSubmission(submission: QuoteSubmission): void {
  cache.set(submission.id, submission);
  mkdirSync(STORE_DIR, { recursive: true });
  writeFileSync(fileFor(submission.id), JSON.stringify(submission, null, 2));
}

export function getSubmission(id: string): QuoteSubmission | undefined {
  if (cache.has(id)) return cache.get(id);
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return undefined;
  const path = fileFor(id);
  if (!existsSync(path)) return undefined;
  try {
    const submission: QuoteSubmission = JSON.parse(readFileSync(path, 'utf-8'));
    cache.set(id, submission);
    return submission;
  } catch {
    return undefined;
  }
}

export function markPaid(id: string): boolean {
  const submission = getSubmission(id);
  if (!submission) return false;
  submission.paid = true;
  saveSubmission(submission);
  return true;
}
