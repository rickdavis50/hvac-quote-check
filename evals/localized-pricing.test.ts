import 'dotenv/config';
import { SYSTEM_BASELINES } from '../data/baselines.js';
import { lookupZip } from '../server/lib/zipLookup.js';
import { priceQuote, type QuoteForPricing } from '../server/lib/pricingEngine.js';

interface PricingTestCase {
  description: string;
  zipCode: string;
  systemType: keyof typeof SYSTEM_BASELINES;
  qualityTier: 'budget' | 'mid' | 'premium';
  sizeBand: 'small' | 'medium' | 'large';
  ductwork: boolean;
  electrical: boolean;
  permits: boolean;
  expectedFairMidMin: number;
  expectedFairMidMax: number;
}

const testCases: PricingTestCase[] = [
  {
    description: 'Orinda/Bay Area heat pump — should be $22k-$26k mid, not $15k',
    zipCode: '94563',
    systemType: 'central_heat_pump',
    qualityTier: 'mid',
    sizeBand: 'medium',
    ductwork: false,
    electrical: false,
    permits: true,
    expectedFairMidMin: 22000,
    expectedFairMidMax: 27000,
  },
  {
    description: 'Rural Mississippi heat pump — should be ~$13k-$16k',
    zipCode: '39201', // Jackson area
    systemType: 'central_heat_pump',
    qualityTier: 'mid',
    sizeBand: 'medium',
    ductwork: false,
    electrical: false,
    permits: false,
    expectedFairMidMin: 12000,
    expectedFairMidMax: 16000,
  },
  {
    description: 'NYC mini split — expensive market',
    zipCode: '10001',
    systemType: 'mini_split',
    qualityTier: 'mid',
    sizeBand: 'medium',
    ductwork: false,
    electrical: false,
    permits: true,
    expectedFairMidMin: 16000,
    expectedFairMidMax: 22000,
  },
  {
    description: 'Phoenix AC replacement — moderate market',
    zipCode: '85001',
    systemType: 'ac_only',
    qualityTier: 'mid',
    sizeBand: 'medium',
    ductwork: false,
    electrical: false,
    permits: true,
    expectedFairMidMin: 9500,
    expectedFairMidMax: 12500,
  },
  {
    description: 'Houston furnace+AC — slightly below average market',
    zipCode: '77001',
    systemType: 'furnace_ac_split',
    qualityTier: 'mid',
    sizeBand: 'medium',
    ductwork: false,
    electrical: false,
    permits: true,
    expectedFairMidMin: 14000,
    expectedFairMidMax: 17000,
  },
  {
    description: 'Denver heat pump split — above average market',
    zipCode: '80202',
    systemType: 'heat_pump_split',
    qualityTier: 'mid',
    sizeBand: 'medium',
    ductwork: false,
    electrical: false,
    permits: true,
    expectedFairMidMin: 19000,
    expectedFairMidMax: 23000,
  },
  {
    description: 'Seattle premium heat pump — high cost of living',
    zipCode: '98101',
    systemType: 'central_heat_pump',
    qualityTier: 'premium',
    sizeBand: 'large',
    ductwork: true,
    electrical: true,
    permits: true,
    expectedFairMidMin: 28000,
    expectedFairMidMax: 38000,
  },
  {
    description: 'Rural Alabama budget furnace — cheapest markets',
    zipCode: '36830', // Auburn area (no major metro)
    systemType: 'furnace_only',
    qualityTier: 'budget',
    sizeBand: 'small',
    ductwork: false,
    electrical: false,
    permits: false,
    expectedFairMidMin: 5500,
    expectedFairMidMax: 8000,
  },
  {
    description: 'Boston package unit — expensive northeast',
    zipCode: '02101',
    systemType: 'package_unit',
    qualityTier: 'mid',
    sizeBand: 'medium',
    ductwork: false,
    electrical: false,
    permits: true,
    expectedFairMidMin: 19000,
    expectedFairMidMax: 25000,
  },
  {
    description: 'Las Vegas AC — desert climate',
    zipCode: '89101',
    systemType: 'ac_only',
    qualityTier: 'mid',
    sizeBand: 'large',
    ductwork: false,
    electrical: false,
    permits: true,
    expectedFairMidMin: 11000,
    expectedFairMidMax: 16000,
  },
];

// Exercises the real pricing engine (no duplicated formula) so any drift in
// the engine's math fails this eval.
function calculateFairMid(tc: PricingTestCase): { fairMid: number; compositeIndex: number; cbsaName: string } {
  const geo = lookupZip(tc.zipCode);
  if (!geo) return { fairMid: 0, compositeIndex: 0, cbsaName: 'UNKNOWN' };

  const quote: QuoteForPricing = {
    extractionConfidence: 0.9,
    zipCode: tc.zipCode,
    latitude: geo.lat,
    longitude: geo.lon,
    state: geo.state,
    metro: geo.metro,
    climateRegion: geo.climateRegion,
    cbsaCode: geo.cbsaCode,
    contractorName: null,
    quotedTotal: 1, // irrelevant to the fair range
    jobType: 'replacement',
    systemType: tc.systemType as QuoteForPricing['systemType'],
    equipmentBrand: null,
    seer2: null,
    tonnage: null,
    qualityTier: tc.qualityTier,
    sizeBand: tc.sizeBand,
    lineItems: [],
    warrantyYears: null,
    permitsIncluded: tc.permits,
    ductworkIncluded: tc.ductwork,
    electricalIncluded: tc.electrical,
  };

  const result = priceQuote(quote, []);
  return {
    fairMid: result.fairRange.mid,
    compositeIndex: result.marketContext.compositeIndex,
    cbsaName: result.marketContext.metroName ?? `RURAL-${geo.state}`,
  };
}

function runLocalizedPricingEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const { fairMid, compositeIndex, cbsaName } = calculateFairMid(tc);
    const inRange = fairMid >= tc.expectedFairMidMin && fairMid <= tc.expectedFairMidMax;

    if (inRange) {
      passed++;
      console.log(`✓ ${tc.description}`);
      console.log(`  CBSA: ${cbsaName} (index: ${compositeIndex.toFixed(2)}), fair mid: $${fairMid.toLocaleString()}`);
    } else {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  CBSA: ${cbsaName} (index: ${compositeIndex.toFixed(2)})`);
      console.log(`  fair mid: $${fairMid.toLocaleString()} — expected $${tc.expectedFairMidMin.toLocaleString()}-$${tc.expectedFairMidMax.toLocaleString()}`);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runLocalizedPricingEvals();
