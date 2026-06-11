import 'dotenv/config';
process.env.HVAC_DISABLE_KB_WRITES = '1'; // evals must not pollute the benchmark KB
import { processQuote } from '../server/lib/pipeline.js';

interface TestCase {
  description: string;
  text: string;
  expectedRating: 'Low' | 'Fair' | 'High';
  expectedSystemType: string;
}

const testCases: TestCase[] = [
  {
    description: 'E2E: Denver heat pump quote at $9,550 → Low rating',
    text: `Cool Air Solutions
456 Oak Ave, Denver CO 80202

HVAC Replacement Estimate

System: Rheem RP17AZ36AJ - 3 Ton 17 SEER2 Heat Pump
Equipment and Materials: $5,600.00
Installation Labor: $3,400.00
Permits: $550.00

Subtotal: $9,550.00
Total Due: $9,550.00

10 Year Parts Warranty
Licensed & Insured - CO License #12345`,
    expectedRating: 'Low',
    expectedSystemType: 'central_heat_pump',
  },
  {
    description: 'E2E: Phoenix mini split at $17,400 → Fair rating',
    text: `Premium HVAC LLC
789 Palm Dr, Phoenix AZ 85001

Ductless Mini Split Installation

Mitsubishi MZ-FH18NA - 1.5 Ton 20 SEER2
Equipment: $8,500.00
Installation: $5,500.00
Electrical Panel Upgrade: $2,800.00
Permits: $600.00

Grand Total: $17,400.00

12 Year Warranty`,
    expectedRating: 'Fair',
    expectedSystemType: 'mini_split',
  },
];

async function runE2eEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    try {
      const result = await processQuote({ text: tc.text });

      const ratingCorrect = result.rating === tc.expectedRating;
      const systemCorrect = result.extractedData.systemType === tc.expectedSystemType;
      const correct = ratingCorrect && systemCorrect;

      if (correct) {
        passed++;
        console.log(`✓ ${tc.description}`);
      } else {
        failed++;
        console.log(`✗ ${tc.description}`);
        if (!ratingCorrect) console.log(`  Rating: got ${result.rating}, expected ${tc.expectedRating}`);
        if (!systemCorrect) console.log(`  System: got ${result.extractedData.systemType}, expected ${tc.expectedSystemType}`);
      }
    } catch (err) {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  Error: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runE2eEvals().catch(console.error);
