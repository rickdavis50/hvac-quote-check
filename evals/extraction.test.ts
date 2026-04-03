import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { extractHeuristic } from '../server/lib/heuristicExtraction.js';
import { extractWithLlm } from '../server/lib/llmExtraction.js';
import { mergeExtractions } from '../server/lib/normalization.js';

const FIXTURES_DIR = join(process.cwd(), 'evals', 'fixtures', 'expected');

interface Fixture {
  description: string;
  inputText: string;
  expected: {
    contractorName?: string | null;
    quotedTotal: number;
    jobType?: string;
    systemType?: string;
    equipmentBrand?: string | null;
    seer2?: number | null;
    tonnage?: number | null;
    zipCode?: string;
    warrantyYears?: number | null;
    permitsIncluded?: boolean;
    ductworkIncluded?: boolean;
    electricalIncluded?: boolean;
    lineItemCount?: number;
  };
}

async function runExtractionEvals() {
  const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));
  let passed = 0;
  let failed = 0;
  const results: Array<{ fixture: string; passed: boolean; failures: string[] }> = [];

  for (const file of files) {
    const fixture: Fixture = JSON.parse(readFileSync(join(FIXTURES_DIR, file), 'utf-8'));
    const failures: string[] = [];

    // Run heuristic extraction
    const heuristic = extractHeuristic(fixture.inputText);

    // Run LLM extraction (if API key available)
    const llm = await extractWithLlm(fixture.inputText);

    // Merge
    const merged = mergeExtractions(llm, heuristic);

    // Check fields
    const { expected } = fixture;

    if (expected.quotedTotal !== undefined) {
      const diff = Math.abs(merged.quotedTotal - expected.quotedTotal) / expected.quotedTotal;
      if (diff > 0.05) failures.push(`quotedTotal: got ${merged.quotedTotal}, expected ${expected.quotedTotal} (${(diff * 100).toFixed(1)}% off)`);
    }

    if (expected.jobType !== undefined && merged.jobType !== expected.jobType) {
      failures.push(`jobType: got "${merged.jobType}", expected "${expected.jobType}"`);
    }

    if (expected.systemType !== undefined && merged.systemType !== expected.systemType) {
      failures.push(`systemType: got "${merged.systemType}", expected "${expected.systemType}"`);
    }

    if (expected.equipmentBrand !== undefined) {
      const gotBrand = merged.equipmentBrand?.toLowerCase() ?? null;
      const expectBrand = expected.equipmentBrand?.toLowerCase() ?? null;
      if (gotBrand !== expectBrand) {
        failures.push(`equipmentBrand: got "${merged.equipmentBrand}", expected "${expected.equipmentBrand}"`);
      }
    }

    if (expected.seer2 !== undefined && merged.seer2 !== expected.seer2) {
      failures.push(`seer2: got ${merged.seer2}, expected ${expected.seer2}`);
    }

    if (expected.tonnage !== undefined && merged.tonnage !== expected.tonnage) {
      failures.push(`tonnage: got ${merged.tonnage}, expected ${expected.tonnage}`);
    }

    if (expected.zipCode !== undefined && merged.zipCode !== expected.zipCode) {
      failures.push(`zipCode: got "${merged.zipCode}", expected "${expected.zipCode}"`);
    }

    if (expected.permitsIncluded !== undefined && merged.permitsIncluded !== expected.permitsIncluded) {
      failures.push(`permitsIncluded: got ${merged.permitsIncluded}, expected ${expected.permitsIncluded}`);
    }

    if (expected.ductworkIncluded !== undefined && merged.ductworkIncluded !== expected.ductworkIncluded) {
      failures.push(`ductworkIncluded: got ${merged.ductworkIncluded}, expected ${expected.ductworkIncluded}`);
    }

    if (expected.electricalIncluded !== undefined && merged.electricalIncluded !== expected.electricalIncluded) {
      failures.push(`electricalIncluded: got ${merged.electricalIncluded}, expected ${expected.electricalIncluded}`);
    }

    if (expected.lineItemCount !== undefined && merged.lineItems.length !== expected.lineItemCount) {
      failures.push(`lineItemCount: got ${merged.lineItems.length}, expected ${expected.lineItemCount}`);
    }

    const pass = failures.length === 0;
    if (pass) passed++;
    else failed++;

    results.push({ fixture: file, passed: pass, failures });
    console.log(`${pass ? '✓' : '✗'} ${fixture.description}`);
    for (const f of failures) console.log(`  - ${f}`);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${files.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runExtractionEvals().catch(console.error);
