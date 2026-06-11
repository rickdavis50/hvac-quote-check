import 'dotenv/config';
import { validateForKnowledgeBase } from '../server/lib/validation.js';

interface TestCase {
  description: string;
  shouldPass: boolean;
  quote: Parameters<typeof validateForKnowledgeBase>[0];
}

const testCases: TestCase[] = [
  {
    description: 'Valid quote passes all gates',
    shouldPass: true,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central', cbsaCode: '12420',
      contractorName: 'Test HVAC Co',
      quotedTotal: 14000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Carrier',
      seer2: 16,
      tonnage: 3,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [
        { category: 'equipment', description: 'Heat pump unit', amount: 5200 },
        { category: 'labor', description: 'Installation', amount: 3800 },
      ],
      warrantyYears: 10,
      permitsIncluded: true,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Low confidence rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.3,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central', cbsaCode: '12420',
      contractorName: null,
      quotedTotal: 14000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Absurdly high price rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.9,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central', cbsaCode: '12420',
      contractorName: 'Scam Corp',
      quotedTotal: 150000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Missing ZIP rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '00000',
      latitude: 0,
      longitude: 0,
      state: 'US',
      metro: null,
      climateRegion: 'midwest', cbsaCode: null,
      contractorName: null,
      quotedTotal: 12000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Unknown system type rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central', cbsaCode: '12420',
      contractorName: null,
      quotedTotal: 12000,
      jobType: 'replacement',
      systemType: 'other',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Zero total rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central', cbsaCode: '12420',
      contractorName: null,
      quotedTotal: 0,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
];

function runValidationEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = validateForKnowledgeBase(tc.quote);
    const actualPass = result.passed;
    const correct = actualPass === tc.shouldPass;

    if (correct) {
      passed++;
      console.log(`✓ ${tc.description}`);
    } else {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  Expected ${tc.shouldPass ? 'PASS' : 'FAIL'}, got ${actualPass ? 'PASS' : 'FAIL'}`);
      if (result.failures.length) {
        for (const f of result.failures) console.log(`  - ${f}`);
      }
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runValidationEvals();
