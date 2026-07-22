import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { QuoteSubmission } from '../types.js';

// Persistence for results, share links, and payment state.
// Production (Vercel): Supabase Postgres, so submissions survive across
// serverless invocations — a webhook that marks a submission paid on one
// invocation must be visible to the insights fetch on another. The service-role
// key is used server-side only (RLS stays on; the browser never sees this store).
// Local / Railway: one JSON file per submission on a persistent disk.
// The store is selected automatically by the presence of Supabase credentials.
const SB_URL = process.env.SUPABASE_URL;
// Accept either name: SUPABASE_SERVICE_ROLE_KEY (legacy service_role JWT) or
// SUPABASE_SECRET_KEY (the modern `sb_secret_…` API key). Both go in the same
// createClient slot and are server-side-only secrets — RLS stays on and the
// browser never sees this store.
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const supabase: SupabaseClient | null =
  SB_URL && SB_KEY
    ? createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

// True when the store is Supabase-backed (URL + a key present), false in disk
// mode. Exposed so /api/health can report the active persistence backend —
// disk mode on read-only serverless is a misconfiguration that otherwise only
// surfaces as a 500 on the first write.
export const isSupabaseStore = supabase !== null;

// Table name is overridable so the store can live in a shared project (namespaced,
// e.g. hvac_submissions) or a dedicated one (submissions).
const TABLE = process.env.HVAC_SUBMISSIONS_TABLE || 'submissions';

const STORE_DIR = process.env.HVAC_SUBMISSIONS_DIR || join(process.cwd(), 'data', 'submissions');
const fileFor = (id: string) => join(STORE_DIR, `${id}.json`);

// In-process cache only in disk mode (one long-lived process). In Supabase mode
// we always read fresh so payment state set by the webhook invocation is visible.
const cache = supabase ? null : new Map<string, QuoteSubmission>();

export async function saveSubmission(submission: QuoteSubmission): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ id: submission.id, data: submission }, { onConflict: 'id' });
    if (error) throw new Error(`Failed to save submission: ${error.message}`);
    return;
  }
  cache!.set(submission.id, submission);
  mkdirSync(STORE_DIR, { recursive: true });
  writeFileSync(fileFor(submission.id), JSON.stringify(submission, null, 2));
}

export async function getSubmission(id: string): Promise<QuoteSubmission | undefined> {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return undefined;
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).select('data').eq('id', id).maybeSingle();
    if (error || !data) return undefined;
    return data.data as QuoteSubmission;
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
