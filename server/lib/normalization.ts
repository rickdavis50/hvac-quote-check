import type { RawQuote, SystemType } from '../types.js';
import type { LlmExtractionResult } from './llmExtraction.js';
import type { HeuristicResult } from './heuristicExtraction.js';
import { BRAND_TIERS } from '../../data/baselines.js';
import { lookupZip } from './zipLookup.js';

interface MergedExtraction {
  contractorName: string | null;
  quotedTotal: number;
  jobType: string;
  systemType: SystemType;
  equipmentBrand: string | null;
  seer2: number | null;
  tonnage: number | null;
  qualityTierHint: string | null;
  zipCode: string;
  warrantyYears: number | null;
  permitsIncluded: boolean;
  ductworkIncluded: boolean;
  electricalIncluded: boolean;
  lineItems: Array<{ category: string; description: string; amount: number }>;
  confidence: number;
}

export function mergeExtractions(
  llm: LlmExtractionResult | null,
  heuristic: HeuristicResult
): MergedExtraction {
  return {
    contractorName: llm?.contractorName ?? heuristic.contractorName,
    quotedTotal: llm?.quotedTotal ?? heuristic.quotedTotal ?? 0,
    jobType: llm?.jobType ?? heuristic.jobType ?? 'replacement',
    systemType: (llm?.systemType ?? heuristic.systemType ?? 'other') as SystemType,
    equipmentBrand: llm?.equipmentBrand ?? heuristic.equipmentBrand,
    seer2: llm?.seer2 ?? heuristic.seer2,
    tonnage: llm?.tonnage ?? heuristic.tonnage,
    qualityTierHint: llm?.qualityTierHint ?? heuristic.qualityTierHint,
    zipCode: llm?.zipCode ?? heuristic.zipCode ?? '00000',
    warrantyYears: llm?.warrantyYears ?? heuristic.warrantyYears,
    permitsIncluded: llm?.permitsIncluded ?? heuristic.permitsIncluded,
    ductworkIncluded: llm?.ductworkIncluded ?? heuristic.ductworkIncluded,
    electricalIncluded: llm?.electricalIncluded ?? heuristic.electricalIncluded,
    lineItems: (llm?.lineItems?.length ? llm.lineItems : heuristic.lineItems) as Array<{ category: string; description: string; amount: number }>,
    confidence: Math.max(llm?.confidence ?? 0, heuristic.confidence),
  };
}

export function normalize(merged: MergedExtraction): Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'> {
  const qualityTier = inferQualityTier(merged.qualityTierHint, merged.equipmentBrand, merged.seer2);
  const sizeBand = inferSizeBand(merged.tonnage);
  const geo = resolveGeography(merged.zipCode);

  return {
    extractionConfidence: merged.confidence,
    zipCode: merged.zipCode,
    latitude: geo.lat,
    longitude: geo.lon,
    state: geo.state,
    metro: geo.metro,
    climateRegion: geo.climateRegion,
    contractorName: merged.contractorName,
    quotedTotal: merged.quotedTotal,
    jobType: merged.jobType as RawQuote['jobType'],
    systemType: merged.systemType,
    equipmentBrand: merged.equipmentBrand,
    seer2: merged.seer2,
    tonnage: merged.tonnage,
    qualityTier,
    sizeBand,
    lineItems: merged.lineItems as RawQuote['lineItems'],
    warrantyYears: merged.warrantyYears,
    permitsIncluded: merged.permitsIncluded,
    ductworkIncluded: merged.ductworkIncluded,
    electricalIncluded: merged.electricalIncluded,
  };
}

function inferQualityTier(hint: string | null, brand: string | null, seer2: number | null): 'budget' | 'mid' | 'premium' {
  if (hint === 'budget' || hint === 'mid' || hint === 'premium') return hint;
  if (brand) {
    const tier = BRAND_TIERS[brand.toLowerCase()];
    if (tier) return tier;
  }
  if (seer2 !== null) {
    if (seer2 >= 18) return 'premium';
    if (seer2 <= 14) return 'budget';
  }
  return 'mid';
}

function inferSizeBand(tonnage: number | null): 'small' | 'medium' | 'large' {
  if (tonnage === null) return 'medium';
  if (tonnage <= 2.5) return 'small';
  if (tonnage > 4.0) return 'large';
  return 'medium';
}

function resolveGeography(zipCode: string): { lat: number; lon: number; state: string; metro: string | null; climateRegion: string } {
  const entry = lookupZip(zipCode);
  if (entry) return { lat: entry.lat, lon: entry.lon, state: entry.state, metro: entry.metro, climateRegion: entry.climateRegion };
  return { lat: 39.8283, lon: -98.5795, state: 'US', metro: null, climateRegion: 'midwest' };
}
