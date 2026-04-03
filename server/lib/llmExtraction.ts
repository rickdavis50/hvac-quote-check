import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic();

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
  zipCode: z.string().regex(/^\d{5}$/).nullable(),
  warrantyYears: z.number().nullable(),
  permitsIncluded: z.boolean(),
  ductworkIncluded: z.boolean(),
  electricalIncluded: z.boolean(),
  lineItems: z.array(z.object({
    category: z.enum(['equipment', 'labor', 'ductwork', 'electrical', 'permit', 'other']),
    description: z.string(),
    amount: z.number(),
  })),
  confidence: z.number().min(0).max(1),
});

export type LlmExtractionResult = z.infer<typeof ExtractionSchema>;

const EXTRACTION_PROMPT = `Extract structured HVAC quote data from the text below.
Return a single JSON object only. Use null for missing values.

Field definitions:
- contractorName: The company or contractor name
- quotedTotal: The total price quoted in dollars (number, no $ sign)
- jobType: One of "new_install", "replacement", "repair", "maintenance"
- systemType: One of "central_heat_pump", "heat_pump_split", "mini_split", "furnace_ac_split", "ac_only", "furnace_only", "package_unit", "other"
- equipmentBrand: The HVAC equipment manufacturer name
- seer2: SEER or SEER2 efficiency rating (number)
- tonnage: System capacity in tons (number)
- qualityTierHint: Your assessment — "budget", "mid", or "premium" based on brand/specs
- zipCode: 5-digit US ZIP code found in the document
- warrantyYears: Warranty duration in years
- permitsIncluded: Whether permits are included in the quote (boolean)
- ductworkIncluded: Whether ductwork is included (boolean)
- electricalIncluded: Whether electrical work is included (boolean)
- lineItems: Array of {category, description, amount} for each line item found
  - category: One of "equipment", "labor", "ductwork", "electrical", "permit", "other"
- confidence: Your confidence in the overall extraction accuracy (0.0 to 1.0)

Quote text:
`;

export async function extractWithLlm(text: string): Promise<LlmExtractionResult | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + text,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return null;

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = ExtractionSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('LLM extraction validation failed:', validated.error.issues);
      return null;
    }

    return validated.data;
  } catch (err) {
    console.warn('LLM extraction failed:', err);
    return null;
  }
}
