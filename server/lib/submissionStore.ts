import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Redis } from '@upstash/redis';
import type { QuoteSubmission } from '../types.js';

// Persistence for results, share links, and payment state.
// Production (Vercel): a shared KV store (Upstash Redis) so submissions survive
// across serverless invocations — a webhook that marks a submission paid on one
// invocation must be visible to the insights fetch on another.
// Local / Railway: one JSON file per submission on a persistent disk.
// The store is selected automatically by the presence of KV credentials.
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = KV_URL && KV_TOKEN ? new Redis({ url: KV_URL, token: KV_TOKEN }) : null;

// 90 days: long enough for a shared result link and a paid report to stay live,
// bounded enough that the KV store doesn't grow without limit.
const TTL_SECONDS = 60 * 60 * 24 * 90;

const STORE_DIR = process.env.HVAC_SUBMISSIONS_DIR || join(process.cwd(), 'data', 'submissions');
const keyFor = (id: string) => `submission:${id}`;
const fileFor = (id: string) => join(STORE_DIR, `${id}.json`);

// In-process cache only in disk mode (one long-lived process). In KV mode we
// always read fresh so payment state set by the webhook invocation is visible.
const cache = redis ? null : new Map<string, QuoteSubmission>();

export async function saveSubmission(submission: QuoteSubmission): Promise<void> {
  if (redis) {
    await redis.set(keyFor(submission.id), submission, { ex: TTL_SECONDS });
    return;
  }
  cache!.set(submission.id, submission);
  mkdirSync(STORE_DIR, { recursive: true });
  writeFileSync(fileFor(submission.id), JSON.stringify(submission, null, 2));
}

export async function getSubmission(id: string): Promise<QuoteSubmission | undefined> {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return undefined;
  if (redis) {
    const stored = await redis.get<QuoteSubmission>(keyFor(id));
    return stored ?? undefined;
  }
  if (cache!.has(id)) return cache!.get(id);
  const path = fileFor(id);
  if (!existsSync(path)) return undefined;
  try {
    const submission: QuoteSubmission = JSON.parse(readFileSync(path, 'utf-8'));
    cache!.set(id, submission);
    return submission;
  } catch {
    return undefined;
  }
}

export async function markPaid(id: string): Promise<boolean> {
  const submission = await getSubmission(id);
  if (!submission) return false;
  submission.paid = true;
  await saveSubmission(submission);
  return true;
}
