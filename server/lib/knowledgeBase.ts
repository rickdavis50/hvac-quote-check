import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import type { RawQuote } from '../types.js';
import { v4 as uuid } from 'uuid';

// Benchmark knowledge base. Point HVAC_KNOWLEDGE_DIR at a mounted volume in
// production so accumulated user quotes survive redeploys (seed data ships in
// the image at the default path).
const KB_DIR = process.env.HVAC_KNOWLEDGE_DIR || join(process.cwd(), 'knowledge');
const RAW_DIR = join(KB_DIR, 'raw');
const COMPILED_DIR = join(KB_DIR, 'compiled');

export function storeRawQuote(
  quoteData: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>,
  source: 'user' | 'seed' = 'user',
  trust: 'extracted' | 'user_verified' = 'extracted'
): RawQuote {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const id = uuid();
  const quote: RawQuote = { ...quoteData, id, timestamp: now.toISOString(), source, trust };
  // KB accumulation is best-effort: on a serverless read-only filesystem the
  // write throws, and that must never fail the user's analysis. Callers already
  // gate on validation + HVAC_DISABLE_KB_WRITES; here we just never propagate an
  // I/O error out of the request path.
  try {
    const dir = join(RAW_DIR, year, month);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${day}-${id}.json`), JSON.stringify(quote, null, 2));
  } catch (err) {
    console.warn('KB write skipped (read-only filesystem?):', err instanceof Error ? err.message : err);
  }
  return quote;
}

export function countRawQuotes(filters?: { state?: string; metro?: string; climateRegion?: string; systemType?: string }): number {
  return loadRawQuotes(filters).length;
}

export function loadRawQuotes(filters?: { state?: string; metro?: string; climateRegion?: string; systemType?: string; zipCode?: string; maxAgeDays?: number }): RawQuote[] {
  const quotes: RawQuote[] = [];
  if (!existsSync(RAW_DIR)) return quotes;
  const cutoff = filters?.maxAgeDays ? Date.now() - filters.maxAgeDays * 24 * 60 * 60 * 1000 : 0;
  const years = readdirSync(RAW_DIR).filter((d) => /^\d{4}$/.test(d));
  for (const year of years) {
    const yearPath = join(RAW_DIR, year);
    const months = readdirSync(yearPath).filter((d) => /^\d{2}$/.test(d));
    for (const month of months) {
      const monthPath = join(yearPath, month);
      const files = readdirSync(monthPath).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const raw = readFileSync(join(monthPath, file), 'utf-8');
          const quote: RawQuote = JSON.parse(raw);
          if (cutoff && new Date(quote.timestamp).getTime() < cutoff) continue;
          if (filters?.state && quote.state !== filters.state) continue;
          if (filters?.metro && quote.metro !== filters.metro) continue;
          if (filters?.climateRegion && quote.climateRegion !== filters.climateRegion) continue;
          if (filters?.systemType && quote.systemType !== filters.systemType) continue;
          if (filters?.zipCode && quote.zipCode !== filters.zipCode) continue;
          quotes.push(quote);
        } catch { /* skip malformed */ }
      }
    }
  }
  return quotes;
}

export function readCompiledArticle(relativePath: string): string | null {
  const fullPath = join(COMPILED_DIR, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf-8');
}

export function writeCompiledArticle(relativePath: string, content: string): void {
  const fullPath = join(COMPILED_DIR, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content);
}

export function readIndex(): string | null {
  const indexPath = join(KB_DIR, 'index.md');
  if (!existsSync(indexPath)) return null;
  return readFileSync(indexPath, 'utf-8');
}

export function writeIndex(content: string): void {
  writeFileSync(join(KB_DIR, 'index.md'), content);
}

export function readConfidenceMap(): string | null {
  const mapPath = join(KB_DIR, 'confidence-map.md');
  if (!existsSync(mapPath)) return null;
  return readFileSync(mapPath, 'utf-8');
}

export function writeConfidenceMap(content: string): void {
  writeFileSync(join(KB_DIR, 'confidence-map.md'), content);
}

export function getKbStats(): { totalQuotes: number; lastCompiled: string | null } {
  const total = loadRawQuotes().length;
  const indexContent = readIndex();
  let lastCompiled: string | null = null;
  if (indexContent) {
    const match = indexContent.match(/lastCompiled:\s*"([^"]+)"/);
    if (match) lastCompiled = match[1];
  }
  return { totalQuotes: total, lastCompiled };
}
