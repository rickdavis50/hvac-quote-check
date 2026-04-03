import type { CanonicalQuoteExtraction, QuoteLineItem, QualityTier, SystemType } from '../types.js';

const BRAND_PATTERNS: Array<{ brand: string; tier: QualityTier; regex: RegExp }> = [
  { brand: 'Carrier', tier: 'premium', regex: /\bcarrier\b/i },
  { brand: 'Daikin', tier: 'premium', regex: /\bdaikin\b/i },
  { brand: 'Goodman', tier: 'budget', regex: /\bgoodman\b/i },
  { brand: 'Lennox', tier: 'premium', regex: /\blennox\b/i },
  { brand: 'Mitsubishi', tier: 'premium', regex: /\bmitsubishi\b/i },
  { brand: 'Rheem', tier: 'standard', regex: /\brheem\b/i },
  { brand: 'Trane', tier: 'premium', regex: /\btrane\b/i },
  { brand: 'Bryant', tier: 'standard', regex: /\bbryant\b/i },
  { brand: 'York', tier: 'standard', regex: /\byork\b/i }
];

const parseCurrency = (token: string): number | null => {
  const normalized = token.replace(/[$,\s]/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};

const normalizeWhitespace = (rawText: string): string =>
  rawText
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const detectSystemType = (text: string): SystemType | null => {
  if (/ductless|mini[\s-]?split/i.test(text)) return 'mini_split';
  if (/package unit|rooftop unit|rtu/i.test(text)) return 'package_unit';
  if (/heat pump/i.test(text) && /air handler|split/i.test(text)) return 'heat_pump_split';
  if (/heat pump/i.test(text)) return 'central_heat_pump';
  if (/furnace/i.test(text) && /ac|air conditioner|condens/i.test(text)) return 'furnace_ac_split';
  if (/furnace only|gas furnace/i.test(text)) return 'furnace_only';
  if (/ac replacement|air conditioner|condens/i.test(text)) return 'ac_only';
  return null;
};

const detectJobType = (text: string): CanonicalQuoteExtraction['job_type'] => {
  if (/maintenance|tune-up|service agreement/i.test(text)) return 'maintenance';
  if (/repair|diagnostic|capacitor|contactor/i.test(text)) return 'repair';
  if (/ductless|mini[\s-]?split/i.test(text)) return 'ductless_install';
  if (/heat pump conversion|heat pump install|whole-home heat pump/i.test(text)) return 'heat_pump_install';
  if (/replace existing|replacement|remove existing/i.test(text) && /furnace|air handler|condenser|heat pump/i.test(text)) {
    return 'full_system_replacement';
  }
  if (/coil only|condenser only|furnace only|partial/i.test(text)) return 'partial_replacement';
  return 'other';
};

const detectZip = (text: string): string | null => {
  const contextual = text.match(/(?:zip|zipcode|customer zip|project zip|service address|job address)[^\d]{0,20}(\d{5})/i);
  if (contextual) return contextual[1];
  const fallback = text.match(/\b(\d{5})(?:-\d{4})?\b/);
  return fallback?.[1] ?? null;
};

const detectQuotedTotal = (text: string, lineItems: QuoteLineItem[]): number | null => {
  const totalLine = text
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /grand total|project total|total investment|estimated total|grand total|final total|total/i.test(line));

  if (totalLine) {
    const amountMatch = totalLine.match(/\$?\s?\d[\d,]*(?:\.\d{2})?/);
    if (amountMatch) {
      const parsed = parseCurrency(amountMatch[0]);
      if (parsed !== null) return parsed;
    }
  }

  const amounts = lineItems.map((item) => item.amount).filter((value): value is number => value !== null);
  if (!amounts.length) return null;
  return Math.max(...amounts, amounts.reduce((sum, amount) => sum + amount, 0));
};

const detectTonnage = (text: string): number | null => {
  const tonnageMatch = text.match(/(\d(?:\.\d)?)\s*(ton|tons)\b/i);
  if (tonnageMatch) return Number(tonnageMatch[1]);
  const btuMatch = text.match(/(\d{2,3})[, ]?(\d{3})\s*btu/i);
  if (!btuMatch) return null;
  const btu = Number(`${btuMatch[1]}${btuMatch[2]}`);
  if (!Number.isFinite(btu)) return null;
  return Number((btu / 12000).toFixed(1));
};

const detectSeer2 = (text: string): number | null => {
  const seer2Match = text.match(/seer\s*2\s*[:\-]?\s*(\d{2}(?:\.\d+)?)/i);
  if (seer2Match) return Number(seer2Match[1]);
  const seerMatch = text.match(/\bseer\s*[:\-]?\s*(\d{2}(?:\.\d+)?)/i);
  return seerMatch ? Number(seerMatch[1]) : null;
};

const detectWarrantyYears = (text: string, type: 'parts' | 'labor'): number | null => {
  const match = text.match(new RegExp(`(\\d{1,2})\\s*[- ]?year\\s*${type}`, 'i'));
  return match ? Number(match[1]) : null;
};

const detectBoolean = (text: string, pattern: RegExp): boolean | null => (pattern.test(text) ? true : null);

const detectReplacementType = (text: string): CanonicalQuoteExtraction['replacement_type'] => {
  if (/new install|new construction|first-time install/i.test(text)) return 'new_install';
  if (/replace|replacement|remove existing/i.test(text)) return 'replacement';
  return 'unknown';
};

const detectInstallDifficulty = (text: string): NonNullable<CanonicalQuoteExtraction['install_difficulty']> => {
  if (/crane|historic home|tight attic|limited access|structural/i.test(text)) return 'complex';
  if (/easy access|straight swap|ground level/i.test(text)) return 'easy';
  return 'standard';
};

const detectSystemsCount = (text: string): number => {
  const explicit = text.match(/(\d)\s*(systems|units|zones)\b/i);
  if (explicit) return Number(explicit[1]);
  if (/multi-zone|two zone|dual zone/i.test(text)) return 2;
  return 1;
};

const detectContractorName = (text: string): string | null => {
  const firstLine = text.split('\n').map((line) => line.trim()).find(Boolean);
  return firstLine && firstLine.length < 80 ? firstLine : null;
};

const extractLineItems = (text: string): QuoteLineItem[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): QuoteLineItem | null => {
      const amountMatch = line.match(/\$?\s?\d[\d,]*(?:\.\d{2})?/);
      if (!amountMatch) return null;
      const amount = parseCurrency(amountMatch[0]);
      if (amount === null) return null;

      let category = 'equipment';
      if (/permit|inspection/i.test(line)) category = 'permit';
      if (/duct/i.test(line)) category = 'ductwork';
      if (/electrical|panel|breaker|disconnect/i.test(line)) category = 'electrical';
      if (/labor|install|commission|haul-away|startup/i.test(line)) category = 'labor';

      return {
        category,
        description: line.replace(amountMatch[0], '').replace(/\.+/g, ' ').trim() || 'Line item',
        amount
      };
    })
    .filter((item): item is QuoteLineItem => item !== null);

export const heuristicExtractQuote = (rawText: string): CanonicalQuoteExtraction => {
  const normalized = normalizeWhitespace(rawText);
  const lower = normalized.toLowerCase();
  const lineItems = extractLineItems(normalized);
  const brandHit = BRAND_PATTERNS.find((entry) => entry.regex.test(lower));
  const filledFields = [
    detectContractorName(normalized),
    detectQuotedTotal(normalized, lineItems),
    detectSystemType(lower),
    detectJobType(lower),
    brandHit?.brand ?? null,
    detectSeer2(lower),
    detectTonnage(lower),
    detectZip(normalized)
  ].filter((value) => value !== null).length;

  return {
    contractor_name: detectContractorName(normalized),
    quoted_total: detectQuotedTotal(normalized, lineItems),
    job_type: detectJobType(lower),
    system_type: detectSystemType(lower),
    equipment_brand: brandHit?.brand ?? null,
    seer2: detectSeer2(lower),
    tonnage: detectTonnage(lower),
    permits_included: detectBoolean(lower, /permit|inspection|hers/i),
    ductwork_included: detectBoolean(lower, /duct|plenum|return grille/i),
    electrical_included: detectBoolean(lower, /electrical|breaker|subpanel|disconnect/i),
    labor_warranty_years: detectWarrantyYears(lower, 'labor'),
    parts_warranty_years: detectWarrantyYears(lower, 'parts'),
    line_items: lineItems,
    zip_code: detectZip(normalized),
    quality_tier_hint: brandHit?.tier ?? null,
    replacement_type: detectReplacementType(lower),
    install_difficulty: detectInstallDifficulty(lower),
    systems_count: detectSystemsCount(lower),
    confidence_extraction: Math.min(0.9, Math.max(0.35, filledFields / 10))
  };
};
