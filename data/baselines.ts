// 2025-2026 national medians for mid-tier, 3-ton replacement
export const SYSTEM_BASELINES: Record<string, number> = {
  central_heat_pump: 17500,
  heat_pump_split: 19500,
  mini_split: 14800,
  furnace_ac_split: 15200,
  ac_only: 10500,
  furnace_only: 8800,
  package_unit: 17000,
  other: 15000,
};

export const COMPONENT_RANGES: Record<string, { low: number; mid: number; high: number }> = {
  equipment: { low: 4500, mid: 7500, high: 12500 },
  labor: { low: 2800, mid: 4800, high: 8000 },
  ductwork: { low: 2000, mid: 3500, high: 6000 },
  electrical: { low: 1000, mid: 1800, high: 3000 },
  permit: { low: 250, mid: 600, high: 1500 },
};


export const BRAND_TIERS: Record<string, 'budget' | 'mid' | 'premium'> = {
  carrier: 'premium', trane: 'premium', lennox: 'premium',
  daikin: 'premium', mitsubishi: 'premium', bosch: 'premium',
  rheem: 'mid', ruud: 'mid', york: 'mid',
  amana: 'mid', bryant: 'mid', heil: 'mid',
  goodman: 'budget', payne: 'budget', airquest: 'budget',
};

export const QUALITY_ADJUSTMENTS: Record<string, number> = {
  premium: 1.14,
  mid: 1.0,
  budget: 0.92,
};

export const SIZE_ADJUSTMENTS: Record<string, number> = {
  large: 1.18,
  medium: 1.0,
  small: 0.90,
};
