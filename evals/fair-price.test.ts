// Hermetic eval: quote-free fair-price estimates. No API key, no KB writes.
process.env.HVAC_DISABLE_KB_WRITES = '1';

import { estimateFairPrice, FairPriceError } from '../server/lib/fairPrice.js';

let passed = 0;
let failed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

check('Seattle 3-ton mid central heat pump matches engine math', () => {
  const est = estimateFairPrice({ zip: '98109', tonnage: 3, electrical: true, permits: true });
  // baseline 17500 × Seattle 1.18 × mid 1.0 × medium 1.0 × scope 1.10 = 22715
  assert(est.fairRange.mid === 22715, `expected mid 22715, got ${est.fairRange.mid}`);
  assert(est.resolved.state === 'WA', `expected WA, got ${est.resolved.state}`);
  assert(est.marketContext.metroName === 'Seattle-Tacoma-Bellevue', `metro was ${est.marketContext.metroName}`);
  assert(est.factors.length >= 5, 'factor trace missing');
});

check('Defaults: systemType central_heat_pump, tier mid, size medium', () => {
  const est = estimateFairPrice({ zip: '78704' });
  assert(est.resolved.systemType === 'central_heat_pump', `got ${est.resolved.systemType}`);
  assert(est.resolved.qualityTier === 'mid', `got ${est.resolved.qualityTier}`);
  assert(est.resolved.sizeBand === 'medium', `got ${est.resolved.sizeBand}`);
  assert(est.fairRange.low < est.fairRange.mid && est.fairRange.mid < est.fairRange.high, 'range not ordered');
});

check('Small mini-split prices below large premium heat pump split, same metro', () => {
  const small = estimateFairPrice({ zip: '30301', systemType: 'mini_split', tonnage: 1.5, qualityTier: 'budget' });
  const large = estimateFairPrice({ zip: '30301', systemType: 'heat_pump_split', tonnage: 5, qualityTier: 'premium' });
  assert(small.fairRange.mid < large.fairRange.mid, `${small.fairRange.mid} !< ${large.fairRange.mid}`);
});

check('Unknown ZIP falls back to national average with low confidence', () => {
  const est = estimateFairPrice({ zip: '00000' });
  assert(est.dataQuality.geographyPrecision === 'national', `got ${est.dataQuality.geographyPrecision}`);
  assert(est.confidence === 'low', `got ${est.confidence}`);
  assert(est.marketContext.compositeIndex === 1.0, `got ${est.marketContext.compositeIndex}`);
});

check('Invalid inputs rejected', () => {
  for (const bad of [
    () => estimateFairPrice({ zip: '1234' }),
    () => estimateFairPrice({ zip: '98109', systemType: 'geothermal' }),
    () => estimateFairPrice({ zip: '98109', qualityTier: 'luxury' }),
    () => estimateFairPrice({ zip: '98109', tonnage: 12 }),
  ]) {
    let threw = false;
    try {
      bad();
    } catch (err) {
      threw = true;
      assert(err instanceof FairPriceError, 'wrong error type');
    }
    assert(threw, 'expected a FairPriceError');
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed}`);
if (failed > 0) process.exit(1);
