export interface LineItem {
  category: string;
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

export interface PricingFactor {
  label: string;
  detail: string;
  multiplier: number;
  amount?: number;
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
    geographyPrecision: string;
    dataRecency: string;
  };

  pricing: {
    methodologyVersion: string;
    factors: PricingFactor[];
    marketContext: {
      metroName: string | null;
      compositeIndex: number;
      comparableCount: number;
    };
  };
  generatedAt: string;

  paidInsights: PaidInsights | null;
}

export interface FairPriceEstimate {
  methodologyVersion: string;
  fairRange: { low: number; mid: number; high: number };
  confidence: 'high' | 'medium' | 'low';
  factors: PricingFactor[];
  marketContext: {
    metroName: string | null;
    compositeIndex: number;
    comparableCount: number;
  };
  dataQuality: {
    sampleSize: number;
    geographyPrecision: string;
    dataRecency: string;
  };
  resolved: {
    zipCode: string;
    state: string;
    metro: string | null;
    systemType: string;
    qualityTier: string;
    sizeBand: string;
    tonnage: number | null;
    scope: string[];
  };
  generatedAt: string;
}

export interface UserCorrections {
  zipCode?: string;
  systemType?: string;
  tonnage?: number;
  seer2?: number;
  qualityTier?: string;
  permitsIncluded?: boolean;
  ductworkIncluded?: boolean;
  electricalIncluded?: boolean;
}
