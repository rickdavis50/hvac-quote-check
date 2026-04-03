import { z } from 'zod';
import { config } from './config.js';
import { AppError } from './errors.js';
import type { CanonicalQuoteExtraction } from '../types.js';

const lineItemSchema = z.object({
  category: z.string().default('other'),
  description: z.string().default('Line item'),
  amount: z.number().nullable().default(null)
});

const extractionSchema = z.object({
  contractor_name: z.string().nullable().default(null),
  quoted_total: z.number().nullable().default(null),
  job_type: z.enum(['repair', 'partial_replacement', 'full_system_replacement', 'heat_pump_install', 'ductless_install', 'maintenance', 'other']).nullable().default(null),
  system_type: z.enum(['central_heat_pump', 'heat_pump_split', 'furnace_ac_split', 'furnace_only', 'ac_only', 'mini_split', 'package_unit', 'other']).nullable().default(null),
  equipment_brand: z.string().nullable().default(null),
  seer2: z.number().nullable().default(null),
  tonnage: z.number().nullable().default(null),
  permits_included: z.boolean().nullable().default(null),
  ductwork_included: z.boolean().nullable().default(null),
  electrical_included: z.boolean().nullable().default(null),
  labor_warranty_years: z.number().nullable().default(null),
  parts_warranty_years: z.number().nullable().default(null),
  line_items: z.array(lineItemSchema).default([]),
  zip_code: z.string().regex(/^\d{5}$/).nullable().default(null),
  quality_tier_hint: z.enum(['budget', 'standard', 'premium', 'unknown']).nullable().default(null),
  replacement_type: z.enum(['replacement', 'new_install', 'unknown']).default('unknown'),
  install_difficulty: z.enum(['easy', 'standard', 'complex']).default('standard'),
  systems_count: z.number().int().min(1).default(1),
  confidence_extraction: z.number().min(0).max(1).default(0.55)
});

const buildPrompt = (rawText: string): string => `Extract structured HVAC quote data from the text below.

Return a single JSON object only. Use null for missing values. Do not estimate price verdicts. Focus only on extraction and normalization.

Allowed job_type values:
- repair
- partial_replacement
- full_system_replacement
- heat_pump_install
- ductless_install
- maintenance
- other

Allowed system_type values:
- central_heat_pump
- heat_pump_split
- furnace_ac_split
- furnace_only
- ac_only
- mini_split
- package_unit
- other

Allowed quality_tier_hint values:
- budget
- standard
- premium
- unknown

Quote text:
${rawText.slice(0, 18000)}`;

export const extractWithLlm = async (rawText: string): Promise<CanonicalQuoteExtraction | null> => {
  if (!config.openAiApiKey) {
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openAiApiKey}`
    },
    body: JSON.stringify({
      model: config.openAiModel,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You extract structured HVAC quote data. Return valid JSON only.'
        },
        {
          role: 'user',
          content: buildPrompt(rawText)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new AppError(`OpenAI extraction request failed with status ${response.status}`, 502);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return null;
  }

  const parsed = extractionSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};
