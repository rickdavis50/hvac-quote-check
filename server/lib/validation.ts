import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { RawQuote, ValidationResult } from '../types.js';
import { COMPONENT_RANGES } from '../../data/baselines.js';

const KB_RAW_DIR = join(process.env.HVAC_KNOWLEDGE_DIR || join(process.cwd(), 'knowledge'), 'raw');

export function validateForKnowledgeBase(quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>): ValidationResult {
  const failures: string[] = [];

  if (quote.extractionConfidence < 0.6) {
    failures.push(`Extraction confidence too low: ${quote.extractionConfidence} (min 0.6)`);
  }

  if (quote.quotedTotal < 2000 || quote.quotedTotal > 80000) {
    failures.push(`Total price out of plausible range: $${quote.quotedTotal} (expected $2,000-$80,000)`);
  }
  for (const item of quote.lineItems) {
    const range = COMPONENT_RANGES[item.category];
    if (range && item.amount > range.high * 3) {
      failures.push(`Line item "${item.description}" amount $${item.amount} exceeds 3x typical high for ${item.category}`);
    }
  }

  if (!quote.quotedTotal || quote.quotedTotal === 0) {
    failures.push('Missing quoted total');
  }
  if (quote.systemType === 'other') {
    failures.push('System type could not be determined');
  }
  if (!quote.zipCode || quote.zipCode === '00000') {
    failures.push('Missing ZIP code');
  }

  if (isDuplicate(quote)) {
    failures.push('Duplicate quote detected (same contractor, similar total, same ZIP within 7 days)');
  }

  return { passed: failures.length === 0, failures };
}

function isDuplicate(quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>): boolean {
  if (!quote.contractorName || !existsSync(KB_RAW_DIR)) return false;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  try {
    const years = readdirSync(KB_RAW_DIR).filter((d) => /^\d{4}$/.test(d));
    for (const year of years) {
      const months = readdirSync(join(KB_RAW_DIR, year)).filter((d) => /^\d{2}$/.test(d));
      for (const month of months) {
        const files = readdirSync(join(KB_RAW_DIR, year, month)).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          const raw = readFileSync(join(KB_RAW_DIR, year, month, file), 'utf-8');
          const existing: RawQuote = JSON.parse(raw);
          const existingTime = new Date(existing.timestamp).getTime();
          if (existingTime < sevenDaysAgo) continue;
          if (existing.zipCode !== quote.zipCode) continue;
          if (!existing.contractorName) continue;
          if (existing.contractorName.toLowerCase() !== quote.contractorName.toLowerCase()) continue;
          const priceDiff = Math.abs(existing.quotedTotal - quote.quotedTotal) / existing.quotedTotal;
          if (priceDiff <= 0.05) return true;
        }
      }
    }
  } catch { /* KB doesn't exist yet */ }
  return false;
}
