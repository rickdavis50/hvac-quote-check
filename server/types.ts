export interface RawQuote {
  id: string;
  timestamp: string;
  source: 'user' | 'seed';
  trust: 'extracted' | 'user_verified';
  extractionConfidence: number;

  // Location
  zipCode: string;
  latitude: number;
  longitude: number;
  state: string;
  metro: string | null;
  climateRegion: string;
  cbsaCode: string | null;

  // Quote details
  contractorName: string | null;
  quotedTotal: number;
  jobType: 'new_install' | 'replacement' | 'repair' | 'maintenance';
  systemType: SystemType;

  // Equipment
  equipmentBrand: string | null;
  seer2: number | null;
  tonnage: number | null;
  qualityTier: 'budget' | 'mid' | 'premium';
  sizeBand: 'small' | 'medium' | 'large';

  // Components
  lineItems: LineItem[];

  // Flags
  warrantyYears: number | null;
  permitsIncluded: boolean;
  ductworkIncluded: boolean;
  electricalIncluded: boolean;
}

export type SystemType =
  | 'central_heat_pump'
  | 'heat_pump_split'
  | 'mini_split'
  | 'furnace_ac_split'
  | 'ac_only'
  | 'furnace_only'
  | 'package_unit'
  | 'other';

export interface LineItem {
  category: 'equipment' | 'labor' | 'ductwork' | 'electrical' | 'permit' | 'other';
  description: string;
  amount: number;
}

export interface ExtractedData {
  contractorName: string | null;
  jobType: string;
  systemType: string;
  equipmentBrand: string | null;
  seer2: number | null;
  tonnage: number | null;
  qualityTier: string;
  sizeBand: string;
  zipCode: string;
  warrantyYears: number | null;
  permitsIncluded: boolean;
  ductworkIncluded: boolean;
  electricalIncluded: boolean;
  lineItems: LineItem[];
}

export interface PricingFactor {
  label: string;
  detail: string;
  multiplier: number;
  amount?: number;
}

export interface PricingResult {
  methodologyVersion: string;
  fairRange: { low: number; mid: number; high: number };
  rating: 'Low' | 'Fair' | 'High';
  savingsPotential: number;
  confidence: 'high' | 'medium' | 'low';
  factors: PricingFactor[];
  marketContext: {
    metroName: string | null;
    compositeIndex: number;
    comparableCount: number;
  };
  dataQuality: {
    sampleSize: number;
    geographyPrecision: 'zip' | 'metro' | 'state' | 'regional' | 'national';
    dataRecency: 'recent' | 'moderate' | 'limited';
  };
}

export interface AnalysisResult {
  submissionId: string;
  rating: 'Low' | 'Fair' | 'High';
  confidence: 'high' | 'medium' | 'low';
  quotedTotal: number;
  fairRange: { low: number; mid: number; high: number };
  savingsPotential: number;

  summary: string;
  extractedData: ExtractedData;
  dataQuality: {
    sampleSize: number;
    geographyPrecision: 'zip' | 'metro' | 'state' | 'regional' | 'national';
    dataRecency: 'recent' | 'moderate' | 'limited';
  };

  pricing: {
    methodologyVersion: string;
    factors: PricingFactor[];
    marketContext: PricingResult['marketContext'];
  };
  generatedAt: string;

  paidInsights: PaidInsights | null;
}

export interface PaidInsights {
  componentBreakdown: Array<{
    category: string;
    yourCost: number;
    typicalRange: { low: number; high: number };
    assessment: string;
  }>;
  comparableQuotes: string;
  negotiationPoints: string[];
  detailedExplanation: string;
}

export interface ValidationResult {
  passed: boolean;
  failures: string[];
}

export interface ZipEntry {
  zip: string;
  lat: number;
  lon: number;
  state: string;
  metro: string | null;
  climateRegion: string;
}

export interface QuoteSubmission {
  id: string;
  status: 'received' | 'processing' | 'processed' | 'failed';
  originalFilename: string;
  mimeType: string;
  rawText: string | null;
  analysisResult: AnalysisResult | null;
  paid: boolean;
  createdAt: string;
}
