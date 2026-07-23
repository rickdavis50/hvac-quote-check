import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';
import type { AnalysisResult, PaidInsights, PricingResult } from '../types.js';
import { priceQuote, type QuoteForPricing, type Comparable } from './pricingEngine.js';
import { loadRawQuotes } from './knowledgeBase.js';
import { COMPONENT_RANGES } from '../../data/baselines.js';
import { EXECUTOR_MODEL } from './llmExtraction.js';

const client = new Anthropic();

// Narrative runs on the executor (Sonnet 5) WITHOUT the advisor tool — it's
// low-stakes prose, and skipping the mid-turn Opus consult keeps total analyze
// latency safely under the serverless function limit. Extraction keeps the
// advisor (accuracy-critical; see llmExtraction).
export const NARRATIVE_MODEL = EXECUTOR_MODEL;

// Anti-slop voice rules folded into the narrative prompt so the generated prose
// reads like a sharp human, not machine copy. Mirrors the "no AI slop" pattern
// set (em-dashes, binary contrasts, throat-clearing, puffery, weasel sourcing, …).
const ANTI_SLOP = `## Voice (write like a sharp human, not an AI)
Avoid the tells of machine-written copy:
- No em-dashes. Use periods and commas instead. (Number ranges like $12,000–$18,000 keep their en-dash.)
- No "it's not X, it's Y" contrasts, and don't list what something isn't before saying what it is.
- No throat-clearing ("Here's the thing", "Let's be clear") and no faux-insight ("What nobody tells you", "The truth is").
- No colons that manufacture suspense, and no one-sentence fragments dropped for drama.
- No importance puffery ("pivotal", "game-changer", "in today's landscape") and no vague sourcing ("experts agree", "studies show").
- No inflated verbs ("serves as", "leverages", "delve", "unlock"). Use plain ones ("is", "uses", "cuts").
- Don't restate the same point in new words, and don't end on a grand summary or a profound-sounding kicker.
- Vary sentence length; avoid a run of identically shaped sentences. Lead with the verdict, use active voice, and prefer concrete numbers to adjectives.`;

const NarrativeSchema = z.object({
  summary: z.string(),
  negotiationPoints: z.array(z.string()).nullable(),
  detailedExplanation: z.string().nullable(),
});

export function priceWithMarket(quote: QuoteForPricing): { pricing: PricingResult; comparables: Comparable[] } {
  const comparables: Comparable[] = loadRawQuotes({
    state: quote.state,
    systemType: quote.systemType,
    maxAgeDays: 180,
  }).map((q) => ({ quotedTotal: q.quotedTotal, timestamp: q.timestamp, source: q.source }));
  return { pricing: priceQuote(quote, comparables), comparables };
}

export async function composeResult(
  quote: QuoteForPricing,
  pricing: PricingResult,
  comparables: Comparable[],
  submissionId: string
): Promise<AnalysisResult> {
  const componentBreakdown = buildComponentBreakdown(quote, pricing);
  const comparableSummary = describeComparables(quote, comparables);
  const wantsPaidContent = pricing.rating === 'High' && pricing.savingsPotential >= 500;

  const narrative = await generateNarrative(quote, pricing, componentBreakdown, comparableSummary, wantsPaidContent);

  const paidInsights: PaidInsights | null = wantsPaidContent
    ? {
        componentBreakdown,
        comparableQuotes: comparableSummary,
        negotiationPoints: narrative.negotiationPoints ?? fallbackNegotiationPoints(quote, pricing),
        detailedExplanation: narrative.detailedExplanation ?? fallbackExplanation(quote, pricing),
      }
    : null;

  return {
    submissionId,
    rating: pricing.rating,
    confidence: pricing.confidence,
    quotedTotal: quote.quotedTotal,
    fairRange: pricing.fairRange,
    savingsPotential: pricing.savingsPotential,
    summary: narrative.summary,
    extractedData: {
      contractorName: quote.contractorName,
      jobType: quote.jobType,
      systemType: quote.systemType,
      equipmentBrand: quote.equipmentBrand,
      seer2: quote.seer2,
      tonnage: quote.tonnage,
      qualityTier: quote.qualityTier,
      sizeBand: quote.sizeBand,
      zipCode: quote.zipCode,
      warrantyYears: quote.warrantyYears,
      permitsIncluded: quote.permitsIncluded,
      ductworkIncluded: quote.ductworkIncluded,
      electricalIncluded: quote.electricalIncluded,
      lineItems: quote.lineItems,
    },
    dataQuality: pricing.dataQuality,
    pricing: {
      methodologyVersion: pricing.methodologyVersion,
      factors: pricing.factors,
      marketContext: pricing.marketContext,
    },
    generatedAt: new Date().toISOString(),
    paidInsights,
  };
}

/** Convenience wrapper used by evals and the recompute path. */
export async function analyzeQuote(quote: QuoteForPricing, submissionId: string): Promise<AnalysisResult> {
  const { pricing, comparables } = priceWithMarket(quote);
  return composeResult(quote, pricing, comparables, submissionId);
}

function buildComponentBreakdown(quote: QuoteForPricing, pricing: PricingResult): PaidInsights['componentBreakdown'] {
  const index = pricing.marketContext.compositeIndex;
  return quote.lineItems
    .filter((item) => COMPONENT_RANGES[item.category])
    .map((item) => {
      const range = COMPONENT_RANGES[item.category];
      const low = Math.round(range.low * index);
      const high = Math.round(range.high * index);
      const assessment =
        item.amount > high ? 'Above the typical local range'
        : item.amount < low ? 'Below the typical local range'
        : 'Within the typical local range';
      return { category: item.category, yourCost: item.amount, typicalRange: { low, high }, assessment };
    });
}

function describeComparables(quote: QuoteForPricing, comparables: Comparable[]): string {
  const userComps = comparables.filter((c) => c.source === 'user');
  if (userComps.length === 0) {
    return `No directly comparable homeowner quotes in ${quote.state} yet. Pricing is anchored to national medians adjusted for your local market.`;
  }
  const totals = userComps.map((c) => c.quotedTotal).sort((a, b) => a - b);
  const median = totals[Math.floor(totals.length / 2)];
  return `${userComps.length} comparable homeowner quote${userComps.length === 1 ? '' : 's'} in ${quote.state} (last 180 days): $${totals[0].toLocaleString()} – $${totals[totals.length - 1].toLocaleString()}, median $${median.toLocaleString()}.`;
}

interface Narrative {
  summary: string;
  negotiationPoints: string[] | null;
  detailedExplanation: string | null;
}

async function generateNarrative(
  quote: QuoteForPricing,
  pricing: PricingResult,
  componentBreakdown: PaidInsights['componentBreakdown'],
  comparableSummary: string,
  wantsPaidContent: boolean
): Promise<Narrative> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      summary: fallbackSummary(quote, pricing),
      negotiationPoints: null,
      detailedExplanation: null,
    };
  }

  const factorTable = pricing.factors
    .map((f) => `- ${f.label}: ${f.detail} (×${f.multiplier.toFixed(2)}${f.amount ? `, $${f.amount.toLocaleString()}` : ''})`)
    .join('\n');
  const componentTable = componentBreakdown
    .map((c) => `- ${c.category}: $${c.yourCost.toLocaleString()} vs typical $${c.typicalRange.low.toLocaleString()}-$${c.typicalRange.high.toLocaleString()} (${c.assessment})`)
    .join('\n') || 'No line items extracted.';

  const prompt = `You are a consumer advocate explaining an HVAC quote assessment to a homeowner. The numbers below were computed deterministically from market data. Treat them as fixed facts. Never invent or alter prices, ranges, or the rating.

## The quote
- Total: $${quote.quotedTotal.toLocaleString()} from ${quote.contractorName ?? 'an unnamed contractor'}
- System: ${quote.systemType.replace(/_/g, ' ')} (${quote.qualityTier} tier, ${quote.sizeBand} size${quote.tonnage ? `, ${quote.tonnage} tons` : ''}${quote.seer2 ? `, SEER2 ${quote.seer2}` : ''})
- Brand: ${quote.equipmentBrand ?? 'not stated'} · Warranty: ${quote.warrantyYears ? `${quote.warrantyYears} years` : 'not stated'}
- Location: ${quote.zipCode}, ${quote.state}${pricing.marketContext.metroName ? ` (${pricing.marketContext.metroName})` : ''}

## Computed assessment (fixed)
- Rating: ${pricing.rating}
- Fair range for this job: $${pricing.fairRange.low.toLocaleString()} – $${pricing.fairRange.high.toLocaleString()} (midpoint $${pricing.fairRange.mid.toLocaleString()})
${pricing.savingsPotential > 0 ? `- Potential savings vs midpoint: $${pricing.savingsPotential.toLocaleString()}` : ''}
- How it was computed:
${factorTable}

## Line items vs local typical ranges
${componentTable}

## Comparable market data
${comparableSummary}

${ANTI_SLOP}

## Your task
Write for a homeowner with no HVAC background. Return:
- summary: 2-3 plain sentences. State the verdict, the fair range, and the single most useful thing to know. Warm, direct, no jargon, no hedging boilerplate.
${wantsPaidContent ? `- negotiationPoints: 4-6 specific, actionable talking points for negotiating this exact quote down (reference its actual numbers, overpriced components, scope, and warranty).
- detailedExplanation: 1-2 paragraphs explaining where this quote is out of line and why, grounded only in the data above.` : `- negotiationPoints: null
- detailedExplanation: null`}`;

  const narrative = await parseNarrative(prompt);
  if (narrative) return narrative;
  return {
    summary: fallbackSummary(quote, pricing),
    negotiationPoints: null,
    detailedExplanation: null,
  };
}

async function parseNarrative(prompt: string): Promise<Narrative | null> {
  try {
    const message = await client.messages.parse({
      model: EXECUTOR_MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: zodOutputFormat(NarrativeSchema) },
    });
    return message.parsed_output ?? null;
  } catch (err) {
    console.warn('Narrative failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

function fallbackSummary(quote: QuoteForPricing, pricing: PricingResult): string {
  const market = pricing.marketContext.metroName ?? `the ${quote.state} market`;
  const base = `Your quote of $${quote.quotedTotal.toLocaleString()} is ${pricing.rating.toLowerCase()} compared to the fair range of $${pricing.fairRange.low.toLocaleString()} – $${pricing.fairRange.high.toLocaleString()} for this job in ${market}.`;
  if (pricing.rating === 'High') {
    return `${base} You could likely save around $${pricing.savingsPotential.toLocaleString()} by negotiating or getting competing bids.`;
  }
  if (pricing.rating === 'Low') {
    return `${base} This is below the typical market price. Verify the scope and warranty are what you expect, then it looks like a strong deal.`;
  }
  return `${base} This is a reasonable market price for the work described.`;
}

function fallbackNegotiationPoints(quote: QuoteForPricing, pricing: PricingResult): string[] {
  return [
    `Mention that comparable ${quote.systemType.replace(/_/g, ' ')} installs in your area run $${pricing.fairRange.low.toLocaleString()} – $${pricing.fairRange.high.toLocaleString()}, and ask the contractor to explain the difference.`,
    'Request an itemized breakdown of equipment, labor, and materials before signing.',
    'Get at least two competing bids for the identical scope and share the lowest with this contractor.',
    'Ask whether the price includes permits, haul-away, and electrical work, and what each is worth.',
    'Ask about current manufacturer rebates and utility incentives; these often are not passed through automatically.',
  ];
}

function fallbackExplanation(quote: QuoteForPricing, pricing: PricingResult): string {
  return `This quote totals $${quote.quotedTotal.toLocaleString()}, which is $${(quote.quotedTotal - pricing.fairRange.high).toLocaleString()} above the top of the fair range for a ${quote.qualityTier}-tier ${quote.systemType.replace(/_/g, ' ')} in your market ($${pricing.fairRange.low.toLocaleString()} – $${pricing.fairRange.high.toLocaleString()}). The fair range accounts for local labor costs, equipment tier, system size, and the scope of work included. Prices above it usually reflect contractor margin rather than necessary cost, which is exactly where negotiation or a competing bid tends to work.`;
}
