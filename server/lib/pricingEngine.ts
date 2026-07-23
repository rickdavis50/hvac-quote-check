import type { RawQuote, PricingResult, PricingFactor } from '../types.js';
import { SYSTEM_BASELINES, QUALITY_ADJUSTMENTS, SIZE_ADJUSTMENTS } from '../../data/baselines.js';
import { lookupCbsaCost } from '../../data/cbsa-cost-index.js';

export const METHODOLOGY_VERSION = '2026.06';

// Fair range is asymmetric around the anchor: quotes run higher more often than lower.
const FAIR_LOW_RATIO = 0.82;
const FAIR_HIGH_RATIO = 1.22;

// Real user quotes start influencing the anchor at this sample size, capped at half weight.
const COMPARABLE_MIN_SAMPLE = 5;
const COMPARABLE_MAX_WEIGHT = 0.5;

export type QuoteForPricing = Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>;

export interface Comparable {
  quotedTotal: number;
  timestamp: string;
  source: 'user' | 'seed';
}

export function priceQuote(quote: QuoteForPricing, comparables: Comparable[]): PricingResult {
  const factors: PricingFactor[] = [];

  const baseline = SYSTEM_BASELINES[quote.systemType] ?? SYSTEM_BASELINES.other;
  factors.push({
    label: 'National baseline',
    detail: `Median installed price for a ${quote.systemType.replace(/_/g, ' ')}`,
    multiplier: 1.0,
    amount: baseline,
  });

  const cbsaEntry = quote.cbsaCode ? lookupCbsaCost(quote.cbsaCode) : null;
  const compositeIndex = cbsaEntry?.compositeIndex ?? 1.0;
  factors.push({
    label: 'Local market',
    detail: cbsaEntry
      ? `${cbsaEntry.name} labor and cost-of-living index`
      : 'No metro match, national average assumed',
    multiplier: compositeIndex,
  });

  const qualityFactor = QUALITY_ADJUSTMENTS[quote.qualityTier] ?? 1.0;
  factors.push({
    label: 'Equipment tier',
    detail: `${quote.qualityTier} tier${quote.equipmentBrand ? ` (${quote.equipmentBrand})` : ''}`,
    multiplier: qualityFactor,
  });

  const sizeFactor = SIZE_ADJUSTMENTS[quote.sizeBand] ?? 1.0;
  factors.push({
    label: 'System size',
    detail: quote.tonnage ? `${quote.tonnage} tons (${quote.sizeBand})` : `${quote.sizeBand} (assumed)`,
    multiplier: sizeFactor,
  });

  let scopeFactor = 1.0;
  const scopeParts: string[] = [];
  if (quote.ductworkIncluded) { scopeFactor += 0.10; scopeParts.push('ductwork'); }
  if (quote.electricalIncluded) { scopeFactor += 0.07; scopeParts.push('electrical'); }
  if (quote.permitsIncluded) { scopeFactor += 0.03; scopeParts.push('permits'); }
  factors.push({
    label: 'Scope of work',
    detail: scopeParts.length ? `Includes ${scopeParts.join(', ')}` : 'Equipment and labor only',
    multiplier: scopeFactor,
  });

  const modelAnchor = baseline * compositeIndex * qualityFactor * sizeFactor * scopeFactor;

  // Blend in the median of real user-submitted quotes once we have enough of them.
  // Seed quotes are excluded — they were generated from this same formula.
  const userComparables = comparables.filter((c) => c.source === 'user');
  let anchor = modelAnchor;
  if (userComparables.length >= COMPARABLE_MIN_SAMPLE) {
    const totals = userComparables.map((c) => c.quotedTotal).sort((a, b) => a - b);
    const median = totals[Math.floor(totals.length / 2)];
    const weight = Math.min(userComparables.length / 20, COMPARABLE_MAX_WEIGHT);
    anchor = modelAnchor * (1 - weight) + median * weight;
    factors.push({
      label: 'Local quote data',
      detail: `Median of ${userComparables.length} recent quotes nearby ($${median.toLocaleString()}), weighted ${Math.round(weight * 100)}%`,
      multiplier: anchor / modelAnchor,
    });
  }

  const fairLow = Math.round(anchor * FAIR_LOW_RATIO);
  const fairMid = Math.round(anchor);
  const fairHigh = Math.round(anchor * FAIR_HIGH_RATIO);

  let rating: 'Low' | 'Fair' | 'High' = 'Fair';
  let savingsPotential = 0;
  if (quote.quotedTotal < fairLow) {
    rating = 'Low';
  } else if (quote.quotedTotal > fairHigh) {
    rating = 'High';
    savingsPotential = Math.round(quote.quotedTotal - fairMid);
  }

  const sampleSize = userComparables.length;
  const geographyPrecision = cbsaEntry
    ? (quote.cbsaCode?.startsWith('RURAL-') ? 'state' : 'metro')
    : 'national';

  const newestComparable = userComparables.reduce<number>(
    (newest, c) => Math.max(newest, new Date(c.timestamp).getTime()),
    0
  );
  const ageDays = newestComparable ? (Date.now() - newestComparable) / 86_400_000 : Infinity;
  const dataRecency = ageDays < 90 ? 'recent' : ageDays < 180 ? 'moderate' : 'limited';

  const confidence =
    cbsaEntry && sampleSize >= COMPARABLE_MIN_SAMPLE ? 'high' : cbsaEntry ? 'medium' : 'low';

  return {
    methodologyVersion: METHODOLOGY_VERSION,
    fairRange: { low: fairLow, mid: fairMid, high: fairHigh },
    rating,
    savingsPotential,
    confidence,
    factors,
    marketContext: {
      metroName: cbsaEntry && !quote.cbsaCode?.startsWith('RURAL-') ? cbsaEntry.name : null,
      compositeIndex,
      comparableCount: sampleSize,
    },
    dataQuality: { sampleSize, geographyPrecision, dataRecency },
  };
}
