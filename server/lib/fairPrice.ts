import type { PricingFactor, PricingResult, SystemType } from '../types.js';
import { normalize } from './normalization.js';
import { priceWithMarket } from './analyzer.js';

// Quote-free fair pricing: same normalize → price chain as the quote pipeline,
// with quotedTotal pinned to 0 (the engine never reads it for the fair range).
// rating/savingsPotential are dropped — they only mean something against a real quote.

const SYSTEM_TYPES: SystemType[] = [
  'central_heat_pump',
  'heat_pump_split',
  'mini_split',
  'furnace_ac_split',
  'ac_only',
  'furnace_only',
  'package_unit',
  'other',
];

const QUALITY_TIERS = ['budget', 'mid', 'premium'] as const;

export interface FairPriceInputs {
  zip: string;
  systemType?: string;
  tonnage?: number | null;
  qualityTier?: string;
  ductwork?: boolean;
  electrical?: boolean;
  permits?: boolean;
}

export interface FairPriceEstimate {
  methodologyVersion: string;
  fairRange: { low: number; mid: number; high: number };
  confidence: PricingResult['confidence'];
  factors: PricingFactor[];
  marketContext: PricingResult['marketContext'];
  dataQuality: PricingResult['dataQuality'];
  resolved: {
    zipCode: string;
    state: string;
    metro: string | null;
    systemType: SystemType;
    qualityTier: string;
    sizeBand: string;
    tonnage: number | null;
    scope: string[];
  };
  generatedAt: string;
}

export class FairPriceError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function estimateFairPrice(inputs: FairPriceInputs): FairPriceEstimate {
  const zip = (inputs.zip ?? '').trim();
  if (!/^\d{5}$/.test(zip)) {
    throw new FairPriceError('zip must be a 5-digit US ZIP code');
  }

  const systemType = (inputs.systemType ?? 'central_heat_pump') as SystemType;
  if (!SYSTEM_TYPES.includes(systemType)) {
    throw new FairPriceError(`systemType must be one of: ${SYSTEM_TYPES.join(', ')}`);
  }

  const qualityTier = inputs.qualityTier ?? 'mid';
  if (!(QUALITY_TIERS as readonly string[]).includes(qualityTier)) {
    throw new FairPriceError(`qualityTier must be one of: ${QUALITY_TIERS.join(', ')}`);
  }

  let tonnage: number | null = null;
  if (inputs.tonnage !== undefined && inputs.tonnage !== null) {
    tonnage = Number(inputs.tonnage);
    if (!Number.isFinite(tonnage) || tonnage < 1 || tonnage > 6) {
      throw new FairPriceError('tonnage must be a number between 1 and 6');
    }
  }

  const normalized = normalize({
    contractorName: null,
    quotedTotal: 0,
    jobType: 'replacement',
    systemType,
    equipmentBrand: null,
    seer2: null,
    tonnage,
    qualityTierHint: qualityTier,
    zipCode: zip,
    warrantyYears: null,
    permitsIncluded: inputs.permits ?? false,
    ductworkIncluded: inputs.ductwork ?? false,
    electricalIncluded: inputs.electrical ?? false,
    lineItems: [],
    confidence: 1,
  });

  const { pricing } = priceWithMarket(normalized);

  const scope: string[] = [];
  if (normalized.ductworkIncluded) scope.push('ductwork');
  if (normalized.electricalIncluded) scope.push('electrical');
  if (normalized.permitsIncluded) scope.push('permits');

  return {
    methodologyVersion: pricing.methodologyVersion,
    fairRange: pricing.fairRange,
    confidence: pricing.confidence,
    factors: pricing.factors,
    marketContext: pricing.marketContext,
    dataQuality: pricing.dataQuality,
    resolved: {
      zipCode: normalized.zipCode,
      state: normalized.state,
      metro: normalized.metro,
      systemType: normalized.systemType,
      qualityTier: normalized.qualityTier,
      sizeBand: normalized.sizeBand,
      tonnage: normalized.tonnage,
      scope,
    },
    generatedAt: new Date().toISOString(),
  };
}
