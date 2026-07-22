// Hermetic: the executor/advisor wiring. No API key, no network — just asserts
// the models and the native Advisor tool are configured as intended.
process.env.HVAC_DISABLE_KB_WRITES = '1';

import { EXECUTOR_MODEL, ADVISOR_MODEL, ADVISOR_BETA, ADVISOR_TOOL } from '../server/lib/llmExtraction.js';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`✓ ${name}`); }
  else { failed++; console.error(`✗ ${name}`); }
}

check('executor is Sonnet 5', EXECUTOR_MODEL === 'claude-sonnet-5');
check('advisor is Opus 4.8', ADVISOR_MODEL === 'claude-opus-4-8');
check('advisor beta flag set', ADVISOR_BETA === 'advisor-tool-2026-03-01');
check('advisor tool type', ADVISOR_TOOL.type === 'advisor_20260301');
check('advisor tool points at the advisor model', ADVISOR_TOOL.model === ADVISOR_MODEL);

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed}`);
if (failed > 0) process.exit(1);
