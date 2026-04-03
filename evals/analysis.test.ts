import 'dotenv/config';
import { analyzeQuote } from '../server/lib/analyzer.js';

interface TestCase {
  description: string;
  expectedRating: 'Low' | 'Fair' | 'High';
  quote: Parameters<typeof analyzeQuote>[0];
}

const testCases: TestCase[] = [
  {
    description: 'Fair-priced mid-tier heat pump in Austin',
    expectedRating: 'Fair',
    quote: {
      extractionConfidence: 0.85,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central',
      contractorName: 'Austin HVAC',
      quotedTotal: 13500,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Rheem',
      seer2: 16,
      tonnage: 3,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [
        { category: 'equipment', description: 'Heat pump', amount: 5400 },
        { category: 'labor', description: 'Install', amount: 3600 },
      ],
      warrantyYears: 10,
      permitsIncluded: true,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Overpriced budget unit in cheap market',
    expectedRating: 'High',
    quote: {
      extractionConfidence: 0.9,
      zipCode: '77001',
      latitude: 29.75,
      longitude: -95.35,
      state: 'TX',
      metro: 'Houston',
      climateRegion: 'south_central',
      contractorName: 'Houston Air',
      quotedTotal: 22000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Goodman',
      seer2: 14,
      tonnage: 3,
      qualityTier: 'budget',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: 5,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Good deal on premium system',
    expectedRating: 'Low',
    quote: {
      extractionConfidence: 0.9,
      zipCode: '55401',
      latitude: 44.98,
      longitude: -93.27,
      state: 'MN',
      metro: 'Minneapolis',
      climateRegion: 'midwest',
      contractorName: 'North Star HVAC',
      quotedTotal: 10500,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Carrier',
      seer2: 20,
      tonnage: 3,
      qualityTier: 'premium',
      sizeBand: 'medium',
      lineItems: [
        { category: 'equipment', description: 'Carrier heat pump', amount: 6500 },
        { category: 'labor', description: 'Install', amount: 4000 },
      ],
      warrantyYears: 12,
      permitsIncluded: true,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
];

async function runAnalysisEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = await analyzeQuote(tc.quote, `eval-${Date.now()}`);
    const correct = result.rating === tc.expectedRating;

    if (correct) {
      passed++;
      console.log(`✓ ${tc.description} → ${result.rating}`);
    } else {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  Expected ${tc.expectedRating}, got ${result.rating}`);
      console.log(`  Fair range: $${result.fairRange.low} - $${result.fairRange.high}`);
      console.log(`  Summary: ${result.summary}`);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runAnalysisEvals().catch(console.error);
