import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';
import type { ExtractionInput } from './extraction.js';

const client = new Anthropic();

export const EXTRACTION_MODEL = 'claude-opus-4-8';

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
- zipCode: the 5-digit US ZIP of the customer's home / installation service address. Every quote shows the property address — read the ZIP from it. If both a contractor office address and a customer address appear, use the customer/service/install address, never the contractor's.
- lineItems: one entry per priced line on the quote.
- confidence: 0 to 1, your honest confidence in this extraction overall.
- Use null for anything not stated. Never invent values.`;

function normalizeZip(zip: string | null): string | null {
  if (!zip) return null;
  const digits = zip.replace(/\D/g, '').slice(0, 5);
  return digits.length === 5 ? digits : null;
}

export async function extractWithLlm(input: ExtractionInput): Promise<LlmExtractionResult | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

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

  try {
    const message = await client.messages.parse({
      model: EXTRACTION_MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content }],
      output_config: { format: zodOutputFormat(ExtractionSchema) },
    });

    const parsed = message.parsed_output;
    if (!parsed) return null;
    return { ...parsed, zipCode: normalizeZip(parsed.zipCode) };
  } catch (err) {
    console.warn('LLM extraction failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
