export const SYSTEM_BASELINES: Record<string, number> = {
  central_heat_pump: 13250,
  heat_pump_split: 14900,
  mini_split: 11900,
  furnace_ac_split: 11800,
  ac_only: 8200,
  furnace_only: 7600,
  package_unit: 14500,
  other: 12500,
};

export const COMPONENT_RANGES: Record<string, { low: number; mid: number; high: number }> = {
  equipment: { low: 3500, mid: 5800, high: 9500 },
  labor: { low: 2000, mid: 3500, high: 6000 },
  ductwork: { low: 1500, mid: 2800, high: 4500 },
  electrical: { low: 800, mid: 1400, high: 2200 },
  permit: { low: 200, mid: 500, high: 1200 },
};

export const CLIMATE_FACTORS: Record<string, number> = {
  northeast: 1.08,
  southeast: 0.97,
  midwest: 0.95,
  south_central: 0.96,
  mid_atlantic: 1.06,
  mountain: 1.02,
  desert: 1.05,
  west_coast: 1.15,
  northwest: 1.04,
};

export const STATE_MULTIPLIERS: Record<string, number> = {
  AL: 0.91, AK: 1.12, AZ: 1.01, AR: 0.88, CA: 1.15,
  CO: 1.03, CT: 1.10, DE: 1.04, FL: 0.98, GA: 0.94,
  HI: 1.18, ID: 0.96, IL: 1.02, IN: 0.93, IA: 0.90,
  KS: 0.91, KY: 0.90, LA: 0.92, ME: 1.03, MD: 1.07,
  MA: 1.12, MI: 0.96, MN: 0.98, MS: 0.87, MO: 0.91,
  MT: 0.97, NE: 0.90, NV: 1.02, NH: 1.06, NJ: 1.11,
  NM: 0.94, NY: 1.14, NC: 0.94, ND: 0.92, OH: 0.93,
  OK: 0.89, OR: 1.05, PA: 1.01, RI: 1.08, SC: 0.92,
  SD: 0.91, TN: 0.92, TX: 0.94, UT: 0.98, VT: 1.04,
  VA: 1.02, WA: 1.07, WV: 0.89, WI: 0.95, WY: 0.96,
  DC: 1.16,
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
