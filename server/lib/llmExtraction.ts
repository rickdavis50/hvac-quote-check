import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';
import type { ExtractionInput } from './extraction.js';

const client = new Anthropic();

// Executor / advisor split (cost strategy). Sonnet 5 is the cheap workhorse
// (~$2/$10 per M tok intro vs Opus 4.8's $5/$25); it consults Opus mid-turn via
// the native Advisor tool ONLY when it decides it needs strategic help — so the
// Opus cost is paid only on the hard cases. Neither model accepts `temperature`
// (non-default sampling → 400) — use adaptive thinking instead.
export const EXECUTOR_MODEL = 'claude-sonnet-5';
export const ADVISOR_MODEL = 'claude-opus-4-8';
// Back-compat alias (the health route imports this).
export const EXTRACTION_MODEL = EXECUTOR_MODEL;

// The first-party Advisor tool: a higher-intelligence advisor the executor calls
// when stuck. Beta (advisor_20260301); not yet in the SDK types, so the .parse
// calls that use it are loosely typed — the zod schema still validates output.
export const ADVISOR_BETA = 'advisor-tool-2026-03-01';
export const ADVISOR_TOOL = { type: 'advisor_20260301', name: 'advisor', model: ADVISOR_MODEL };

const ExtractionSchema = z.object({
  contractorName: z.string().nullable(),
  quotedTotal: z.number().nullable(),
  jobType: z.enum(['new_install', 'replacement', 'repair', 'maintenance']).nullable(),
  systemType: z.enum([
    'central_heat_pump', 'heat_pump_split', 'mini_split',
    'furnace_ac_split', 'ac_only', 'furnace_only', 'package_unit', 'other',
  ]).nullable(),
  equipmentBrand: z.string().nullable(),
  seer2: z.number().nullable(),
  tonnage: z.number().nullable(),
  qualityTierHint: z.enum(['budget', 'mid', 'premium']).nullable(),
  zipCode: z.string().nullable(),
  warrantyYears: z.number().nullable(),
  permitsIncluded: z.boolean(),
  ductworkIncluded: z.boolean(),
  electricalIncluded: z.boolean(),
  lineItems: z.array(z.object({
    category: z.enum(['equipment', 'labor', 'ductwork', 'electrical', 'permit', 'other']),
    description: z.string(),
    amount: z.number(),
  })),
  confidence: z.number(),
});

export type LlmExtractionResult = z.infer<typeof ExtractionSchema>;

const INSTRUCTIONS = `You are reading an HVAC quote a homeowner received. Extract the structured fields exactly as defined by the output schema.

Guidance:
- quotedTotal is the bottom-line price in dollars. Prefer "total"/"grand total"/"amount due" over subtotals.
- systemType: "central_heat_pump" for ducted heat pumps, "heat_pump_split" for heat pump + air handler split systems described as such, "mini_split" for ductless, "furnace_ac_split" for furnace+AC combos.
- qualityTierHint: judge from brand and specs (e.g. Carrier/Trane/Lennox/Daikin/Mitsubishi premium; Goodman/Payne budget).
- zipCode: the 5-digit US ZIP of the customer's home / installation service address. Every quote shows the property address. Read the ZIP from it. If both a contractor office address and a customer address appear, use the customer/service/install address, never the contractor's.
- lineItems: one entry per priced line on the quote.
- confidence: 0 to 1, your honest confidence in this extraction overall.
- Use null for anything not stated. Never invent values.`;

function normalizeZip(zip: string | null): string | null {
  if (!zip) return null;
  const digits = zip.replace(/\D/g, '').slice(0, 5);
  return digits.length === 5 ? digits : null;
}

function buildContent(input: ExtractionInput): Anthropic.ContentBlockParam[] {
  const content: Anthropic.ContentBlockParam[] = [];
  if (input.document?.kind === 'pdf') {
    content.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: input.document.dataBase64 },
    });
  } else if (input.document?.kind === 'image') {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: input.document.mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
        data: input.document.dataBase64,
      },
    });
  }
  if (input.text && input.document?.kind !== 'pdf') {
    content.push({ type: 'text', text: `Quote text:\n${input.text}` });
  }
  content.push({ type: 'text', text: INSTRUCTIONS });
  return content;
}

export async function extractWithLlm(input: ExtractionInput): Promise<LlmExtractionResult | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const content = buildContent(input);
  try {
    // Sonnet 5 executes; the Advisor tool lets it consult Opus 4.8 mid-turn when
    // it needs help. The heuristic merge + no-key path still cover a failure here.
    const message = await (client.beta.messages as unknown as {
      parse: (params: unknown) => Promise<{ parsed_output: LlmExtractionResult | null }>;
    }).parse({
      model: EXECUTOR_MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      betas: [ADVISOR_BETA],
      tools: [ADVISOR_TOOL],
      messages: [{ role: 'user', content }],
      // Low effort: extraction is mechanical field-reading, not deep reasoning —
      // keeps latency under the serverless function limit. The advisor is still
      // consulted when the model decides it needs it.
      output_config: { format: zodOutputFormat(ExtractionSchema), effort: 'low' },
    });
    const parsed = message.parsed_output;
    if (!parsed) return null;
    return { ...parsed, zipCode: normalizeZip(parsed.zipCode) };
  } catch (err) {
    console.warn('LLM extraction failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
