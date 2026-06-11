import 'dotenv/config';
import { priceQuote, type QuoteForPricing } from '../server/lib/pricingEngine.js';

// Hermetic rating evals: the deterministic engine is the source of truth for
// ratings, so these run instantly with no API key and no knowledge-base state
// (comparables are passed explicitly).

interface TestCase {
  description: string;
  expectedRating: 'Low' | 'Fair' | 'High';
  quote: QuoteForPricing;
}

function makeQuote(overrides: Partial<QuoteForPricing>): QuoteForPricing {
  return {
    extractionConfidence: 0.9,
    zipCode: '78701',
    latitude: 30.27,
    longitude: -97.74,
    state: 'TX',
    metro: 'Austin',
    climateRegion: 'south_central',
    cbsaCode: '12420',
    contractorName: 'Test HVAC',
    quotedTotal: 18000,
    jobType: 'replacement',
    systemType: 'central_heat_pump',
    equipmentBrand: 'Rheem',
    seer2: 16,
    tonnage: 3,
    qualityTier: 'mid',
    sizeBand: 'medium',
    lineItems: [],
    warrantyYears: 10,
    permitsIncluded: true,
    ductworkIncluded: false,
    electricalIncluded: false,
    ...overrides,
  };
}

const testCases: TestCase[] = [
  {
    description: 'Fair-priced mid-tier heat pump in Austin',
    expectedRating: 'Fair',
    quote: makeQuote({}),
  },
  {
    description: 'Overpriced budget unit in Houston',
    expectedRating: 'High',
    quote: makeQuote({
      zipCode: '77001', metro: 'Houston', cbsaCode: '26420',
      quotedTotal: 22000, equipmentBrand: 'Goodman', seer2: 14,
      qualityTier: 'budget', warrantyYears: 5, permitsIncluded: false,
    }),
  },
  {
    description: 'Good deal on premium system in Minneapolis',
    expectedRating: 'Low',
    quote: makeQuote({
      zipCode: '55401', state: 'MN', metro: 'Minneapolis', climateRegion: 'midwest', cbsaCode: '33460',
      quotedTotal: 10500, equipmentBrand: 'Carrier', seer2: 20,
      qualityTier: 'premium', warrantyYears: 12,
    }),
  },
  {
    description: 'Bay Area premium full-scope job priced for the metro is Fair, not High',
    expectedRating: 'Fair',
    quote: makeQuote({
      zipCode: '94563', state: 'CA', metro: 'San Francisco', climateRegion: 'west_coast', cbsaCode: '41860',
      quotedTotal: 29000, qualityTier: 'mid', ductworkIncluded: true, electricalIncluded: false,
    }),
  },
  {
    description: 'Same price in rural Mississippi is High',
    expectedRating: 'High',
    quote: makeQuote({
      zipCode: '39730', state: 'MS', metro: null, climateRegion: 'southeast', cbsaCode: 'RURAL-MS',
      quotedTotal: 29000, qualityTier: 'mid', ductworkIncluded: true,
    }),
  },
];

function runAnalysisEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = priceQuote(tc.quote, []);
    const correct = result.rating === tc.expectedRating;

    if (correct) {
      passed++;
      console.log(`✓ ${tc.description} → ${result.rating} (fair: $${result.fairRange.low.toLocaleString()}-$${result.fairRange.high.toLocaleString()})`);
    } else {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  Expected ${tc.expectedRating}, got ${result.rating}`);
      console.log(`  Fair range: $${result.fairRange.low.toLocaleString()} - $${result.fairRange.high.toLocaleString()} for quote $${tc.quote.quotedTotal.toLocaleString()}`);
      for (const f of result.factors) console.log(`    ${f.label}: ×${f.multiplier.toFixed(2)} (${f.detail})`);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runAnalysisEvals();
