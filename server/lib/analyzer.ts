import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { RawQuote, AnalysisResult, PaidInsights } from '../types.js';
import { readIndex, readConfidenceMap, readCompiledArticle, loadRawQuotes } from './knowledgeBase.js';
import { SYSTEM_BASELINES, CLIMATE_FACTORS, STATE_MULTIPLIERS, QUALITY_ADJUSTMENTS, SIZE_ADJUSTMENTS } from '../../data/baselines.js';

const client = new Anthropic();

const AnalysisSchema = z.object({
  rating: z.enum(['Low', 'Fair', 'High']),
  confidence: z.enum(['high', 'medium', 'low']),
  fairRange: z.object({ low: z.number(), mid: z.number(), high: z.number() }),
  savingsPotential: z.number(),
  summary: z.string(),
  dataQuality: z.object({
    sampleSize: z.number(),
    geographyPrecision: z.enum(['zip', 'metro', 'state', 'regional', 'national']),
    dataRecency: z.enum(['recent', 'moderate', 'limited']),
  }),
  componentBreakdown: z.array(z.object({
    category: z.string(),
    yourCost: z.number(),
    typicalRange: z.object({ low: z.number(), high: z.number() }),
    assessment: z.string(),
  })).nullable(),
  comparableQuotes: z.string().nullable(),
  negotiationPoints: z.array(z.string()).nullable(),
  detailedExplanation: z.string().nullable(),
});

export async function analyzeQuote(
  quoteData: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>,
  submissionId: string
): Promise<AnalysisResult> {
  const kbContext = buildKbContext(quoteData);
  const prompt = buildAnalysisPrompt(quoteData, kbContext);

  if (!process.env.ANTHROPIC_API_KEY) {
    return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = AnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('Analysis validation failed:', validated.error.issues);
      return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
    }

    const result = validated.data;
    const paidInsights: PaidInsights | null =
      result.rating === 'High' && result.savingsPotential >= 500 && result.componentBreakdown
        ? {
            componentBreakdown: result.componentBreakdown,
            comparableQuotes: result.comparableQuotes ?? '',
            negotiationPoints: result.negotiationPoints ?? [],
            detailedExplanation: result.detailedExplanation ?? '',
          }
        : null;

    return {
      submissionId,
      rating: result.rating,
      confidence: result.confidence,
      quotedTotal: quoteData.quotedTotal,
      fairRange: result.fairRange,
      savingsPotential: result.savingsPotential,
      summary: result.summary,
      extractedData: {
        contractorName: quoteData.contractorName,
        jobType: quoteData.jobType,
        systemType: quoteData.systemType,
        equipmentBrand: quoteData.equipmentBrand,
        seer2: quoteData.seer2,
        tonnage: quoteData.tonnage,
        qualityTier: quoteData.qualityTier,
        sizeBand: quoteData.sizeBand,
        zipCode: quoteData.zipCode,
        warrantyYears: quoteData.warrantyYears,
        permitsIncluded: quoteData.permitsIncluded,
        ductworkIncluded: quoteData.ductworkIncluded,
        electricalIncluded: quoteData.electricalIncluded,
        lineItems: quoteData.lineItems,
      },
      dataQuality: result.dataQuality,
      paidInsights,
    };
  } catch (err) {
    console.warn('Analysis LLM call failed:', err);
    return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
  }
}

interface KbContext {
  indexContent: string;
  confidenceMap: string;
  regionalArticle: string;
  systemArticle: string;
  componentArticles: string;
  sampleSize: number;
  relevantQuoteSummary: string;
}

function buildKbContext(quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>): KbContext {
  const indexContent = readIndex() ?? 'No index available. Knowledge base is new.';
  const confidenceMap = readConfidenceMap() ?? 'No confidence map available.';

  let regionalArticle = '';
  if (quote.metro) {
    const metroArticle = readCompiledArticle(`regions/${quote.climateRegion}/${quote.state.toLowerCase()}/${quote.metro.toLowerCase().replace(/\s+/g, '-')}.md`);
    if (metroArticle) regionalArticle += metroArticle + '\n\n';
  }
  const stateArticle = readCompiledArticle(`regions/${quote.climateRegion}/${quote.state.toLowerCase()}/overview.md`);
  if (stateArticle) regionalArticle += stateArticle + '\n\n';
  const regionArticle = readCompiledArticle(`regions/${quote.climateRegion}/overview.md`);
  if (regionArticle) regionalArticle += regionArticle;
  if (!regionalArticle) regionalArticle = 'No regional pricing articles available yet.';

  const systemArticle = readCompiledArticle(`system-types/${quote.systemType.replace(/_/g, '-')}.md`) ?? 'No system type article available.';

  const componentCategories = [...new Set(quote.lineItems.map((i) => i.category))];
  const componentArticles = componentCategories
    .map((cat) => readCompiledArticle(`components/${cat}.md`))
    .filter(Boolean)
    .join('\n\n') || 'No component articles available.';

  const localQuotes = loadRawQuotes({ state: quote.state, systemType: quote.systemType, maxAgeDays: 180 });
  const sampleSize = localQuotes.length;

  let relevantQuoteSummary = '';
  if (localQuotes.length > 0) {
    const totals = localQuotes.map((q) => q.quotedTotal).sort((a, b) => a - b);
    const min = totals[0];
    const max = totals[totals.length - 1];
    const median = totals[Math.floor(totals.length / 2)];
    relevantQuoteSummary = `Found ${localQuotes.length} comparable quotes in ${quote.state} for ${quote.systemType} (last 180 days). Price range: $${min.toLocaleString()} - $${max.toLocaleString()}, median: $${median.toLocaleString()}.`;
    if (localQuotes.length <= 10) {
      relevantQuoteSummary += '\nIndividual quotes:\n';
      for (const q of localQuotes) {
        relevantQuoteSummary += `- $${q.quotedTotal.toLocaleString()} (${q.qualityTier} ${q.sizeBand}, ${q.metro ?? q.state}, ${q.source})\n`;
      }
    }
  } else {
    relevantQuoteSummary = 'No comparable quotes found in the knowledge base for this region and system type.';
  }

  return { indexContent, confidenceMap, regionalArticle, systemArticle, componentArticles, sampleSize, relevantQuoteSummary };
}

function buildAnalysisPrompt(quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>, ctx: KbContext): string {
  return `You are an expert HVAC pricing analyst. Analyze this quote against the knowledge base and produce a pricing assessment.

## Quote to Analyze
- Total: $${quote.quotedTotal.toLocaleString()}
- System: ${quote.systemType} (${quote.qualityTier} tier, ${quote.sizeBand} size)
- Location: ${quote.zipCode}, ${quote.state}${quote.metro ? `, ${quote.metro} metro` : ''}
- Climate: ${quote.climateRegion}
- Brand: ${quote.equipmentBrand ?? 'Unknown'}
- SEER2: ${quote.seer2 ?? 'Unknown'}, Tonnage: ${quote.tonnage ?? 'Unknown'}
- Includes: ${[quote.permitsIncluded && 'permits', quote.ductworkIncluded && 'ductwork', quote.electricalIncluded && 'electrical'].filter(Boolean).join(', ') || 'none specified'}
- Line items: ${quote.lineItems.map((i) => `${i.category}: $${i.amount} (${i.description})`).join('; ') || 'none extracted'}
- Job type: ${quote.jobType}

## Knowledge Base Context

### Market Overview
${ctx.indexContent}

### Data Confidence for This Region
${ctx.confidenceMap}

### Regional Pricing Data
${ctx.regionalArticle}

### System Type Data
${ctx.systemArticle}

### Component Pricing Data
${ctx.componentArticles}

### Comparable Quotes
${ctx.relevantQuoteSummary}

## Instructions
Produce a JSON analysis with these fields:
- rating: "Low" (good deal), "Fair" (reasonable), or "High" (overpaying)
- confidence: "high" (strong data), "medium" (moderate data), "low" (limited data)
- fairRange: {low, mid, high} — the fair price range for this specific job
- savingsPotential: How much the user could save if High (0 if Fair or Low)
- summary: 2-3 sentence plain language assessment explaining your reasoning
- dataQuality: {sampleSize (number of comparable quotes), geographyPrecision ("zip"|"metro"|"state"|"regional"|"national"), dataRecency ("recent"|"moderate"|"limited")}
- componentBreakdown: Array of {category, yourCost, typicalRange: {low, high}, assessment} for each line item (null if no line items)
- comparableQuotes: Summary of similar local quotes if available (null if none)
- negotiationPoints: Specific talking points for negotiation if High (null otherwise)
- detailedExplanation: Detailed pricing analysis (null if Fair or Low)

Consider regional cost factors, quality tier, system size, included services, and available comparable data. Be honest about confidence — if data is thin, say so. Return only the JSON object.`;
}

function buildFallbackAnalysis(
  quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>,
  submissionId: string,
  sampleSize: number
): AnalysisResult {
  const baseline = SYSTEM_BASELINES[quote.systemType] ?? SYSTEM_BASELINES.other;
  const climateFactor = CLIMATE_FACTORS[quote.climateRegion] ?? 1.0;
  const stateFactor = STATE_MULTIPLIERS[quote.state] ?? 1.0;
  const qualityFactor = QUALITY_ADJUSTMENTS[quote.qualityTier] ?? 1.0;
  const sizeFactor = SIZE_ADJUSTMENTS[quote.sizeBand] ?? 1.0;

  const adjustedBaseline = baseline * climateFactor * stateFactor * qualityFactor * sizeFactor;
  const fairLow = Math.round(adjustedBaseline * 0.85);
  const fairMid = Math.round(adjustedBaseline);
  const fairHigh = Math.round(adjustedBaseline * 1.15);

  let rating: 'Low' | 'Fair' | 'High' = 'Fair';
  let savingsPotential = 0;
  if (quote.quotedTotal < fairLow) rating = 'Low';
  else if (quote.quotedTotal > fairHigh) {
    rating = 'High';
    savingsPotential = Math.round(quote.quotedTotal - fairMid);
  }

  return {
    submissionId,
    rating,
    confidence: 'low',
    quotedTotal: quote.quotedTotal,
    fairRange: { low: fairLow, mid: fairMid, high: fairHigh },
    savingsPotential,
    summary: `Based on national pricing data adjusted for your region (${quote.state}) and system specifications, your quote of $${quote.quotedTotal.toLocaleString()} is ${rating.toLowerCase()} compared to a typical fair range of $${fairLow.toLocaleString()} - $${fairHigh.toLocaleString()}. Note: this estimate uses limited data — confidence will improve as more local quotes are analyzed.`,
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
    dataQuality: { sampleSize, geographyPrecision: 'national', dataRecency: 'limited' },
    paidInsights: null,
  };
}
