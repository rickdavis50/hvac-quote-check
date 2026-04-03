import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';
import type { CanonicalQuoteExtraction } from '../types.js';
import { config } from './config.js';
import { AppError } from './errors.js';
import { heuristicExtractQuote } from './heuristicExtraction.js';
import { extractWithLlm } from './llmExtraction.js';

const mergeExtractions = (
  primary: CanonicalQuoteExtraction,
  secondary: CanonicalQuoteExtraction
): CanonicalQuoteExtraction => ({
  contractor_name: primary.contractor_name ?? secondary.contractor_name,
  quoted_total: primary.quoted_total ?? secondary.quoted_total,
  job_type: primary.job_type ?? secondary.job_type,
  system_type: primary.system_type ?? secondary.system_type,
  equipment_brand: primary.equipment_brand ?? secondary.equipment_brand,
  seer2: primary.seer2 ?? secondary.seer2,
  tonnage: primary.tonnage ?? secondary.tonnage,
  permits_included: primary.permits_included ?? secondary.permits_included,
  ductwork_included: primary.ductwork_included ?? secondary.ductwork_included,
  electrical_included: primary.electrical_included ?? secondary.electrical_included,
  labor_warranty_years: primary.labor_warranty_years ?? secondary.labor_warranty_years,
  parts_warranty_years: primary.parts_warranty_years ?? secondary.parts_warranty_years,
  line_items: primary.line_items.length ? primary.line_items : secondary.line_items,
  zip_code: primary.zip_code ?? secondary.zip_code,
  quality_tier_hint: primary.quality_tier_hint ?? secondary.quality_tier_hint ?? null,
  replacement_type: primary.replacement_type ?? secondary.replacement_type ?? 'unknown',
  install_difficulty: primary.install_difficulty ?? secondary.install_difficulty ?? 'standard',
  systems_count: primary.systems_count ?? secondary.systems_count ?? 1,
  confidence_extraction: Math.max(primary.confidence_extraction, secondary.confidence_extraction)
});

const extractPdfText = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
};

const extractImageText = async (buffer: Buffer): Promise<string> => {
  if (config.ocrProvider !== 'tesseract') {
    return '';
  }

  const { data } = await Tesseract.recognize(buffer, 'eng');
  return data.text?.trim() ?? '';
};

export const extractRawText = async (buffer: Buffer, mimeType: string, filename: string): Promise<string> => {
  const loweredName = filename.toLowerCase();
  const loweredMime = mimeType.toLowerCase();

  if (loweredMime.includes('pdf') || loweredName.endsWith('.pdf')) {
    return extractPdfText(buffer);
  }

  if (loweredMime.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(loweredName)) {
    return extractImageText(buffer);
  }

  return buffer.toString('utf8').trim();
};

export const extractStructuredQuote = async (rawText: string): Promise<CanonicalQuoteExtraction> => {
  if (!rawText.trim()) {
    throw new AppError('The uploaded quote did not contain readable text.', 422);
  }

  const heuristic = heuristicExtractQuote(rawText);

  try {
    const llm = await extractWithLlm(rawText);
    return llm ? mergeExtractions(llm, heuristic) : heuristic;
  } catch {
    return heuristic;
  }
};
