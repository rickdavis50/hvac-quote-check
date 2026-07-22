// Hermetic: the escalation decision (when the executor hands off to the advisor).
// No API key, no network — just the isStuck logic that gates the extra Opus call.
process.env.HVAC_DISABLE_KB_WRITES = '1';

import { isStuck, EXECUTOR_MODEL, ADVISOR_MODEL } from '../server/lib/llmExtraction.js';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`✓ ${name}`); }
  else { failed++; console.error(`✗ ${name}`); }
}

const complete = {
  contractorName: 'Evergreen', quotedTotal: 31400, jobType: 'replacement' as const,
  systemType: 'central_heat_pump' as const, equipmentBrand: 'Bryant', seer2: 16, tonnage: 3,
  qualityTierHint: 'mid' as const, zipCode: '98109', warrantyYears: 10,
  permitsIncluded: true, ductworkIncluded: false, electricalIncluded: true,
  lineItems: [], confidence: 0.9,
};

check('executor is Sonnet 5, advisor is Opus 4.8', EXECUTOR_MODEL === 'claude-sonnet-5' && ADVISOR_MODEL === 'claude-opus-4-8');
check('null result → stuck (escalate)', isStuck(null) === true);
check('complete high-confidence result → not stuck (no escalation)', isStuck(complete) === false);
check('missing total → stuck', isStuck({ ...complete, quotedTotal: null }) === true);
check('zero total → stuck', isStuck({ ...complete, quotedTotal: 0 }) === true);
check('low confidence → stuck', isStuck({ ...complete, confidence: 0.4 }) === true);
check('borderline confidence 0.55 → not stuck', isStuck({ ...complete, confidence: 0.55 }) === false);

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed}`);
if (failed > 0) process.exit(1);
