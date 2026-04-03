import { BRAND_TIERS } from '../../data/baselines.js';

export interface HeuristicResult {
  contractorName: string | null;
  quotedTotal: number | null;
  jobType: string | null;
  systemType: string | null;
  equipmentBrand: string | null;
  seer2: number | null;
  tonnage: number | null;
  qualityTierHint: string | null;
  zipCode: string | null;
  warrantyYears: number | null;
  permitsIncluded: boolean;
  ductworkIncluded: boolean;
  electricalIncluded: boolean;
  lineItems: Array<{ category: string; description: string; amount: number }>;
  confidence: number;
}

export function extractHeuristic(text: string): HeuristicResult {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  return {
    contractorName: extractContractorName(lines),
    quotedTotal: extractTotal(text),
    jobType: extractJobType(text),
    systemType: extractSystemType(text),
    equipmentBrand: extractBrand(text),
    seer2: extractNumber(text, /(\d{1,2}(?:\.\d)?)\s*seer2?/i),
    tonnage: extractNumber(text, /(\d(?:\.\d)?)\s*(?:ton|tons)/i),
    qualityTierHint: null,
    zipCode: extractZip(text),
    warrantyYears: extractNumber(text, /(\d{1,2})\s*(?:year|yr)s?\s*warranty/i),
    permitsIncluded: /permit/i.test(text),
    ductworkIncluded: /duct\s*work|ductwork|duct\s*modification/i.test(text),
    electricalIncluded: /electrical\s*(?:work|upgrade|panel|wiring)/i.test(text),
    lineItems: extractLineItems(text),
    confidence: 0.4,
  };
}

function extractContractorName(lines: string[]): string | null {
  if (lines.length === 0) return null;
  const first = lines[0];
  if (first.length > 5 && first.length < 80 && !/\$|total|estimate|quote|invoice/i.test(first)) {
    return first;
  }
  return null;
}

function extractTotal(text: string): number | null {
  const patterns = [
    /(?:total|grand\s*total|amount\s*due|balance\s*due)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
    /\$\s*([\d,]+(?:\.\d{2})?)\s*(?:total)/i,
  ];
  for (const pat of patterns) {
    const match = text.match(pat);
    if (match) return parseFloat(match[1].replace(/,/g, ''));
  }
  const amounts = [...text.matchAll(/\$([\d,]+(?:\.\d{2})?)/g)]
    .map((m) => parseFloat(m[1].replace(/,/g, '')))
    .filter((n) => n >= 1000 && n <= 80000);
  if (amounts.length > 0) return Math.max(...amounts);
  return null;
}

function extractJobType(text: string): string | null {
  if (/replacement|replace|swap/i.test(text)) return 'replacement';
  if (/new\s*install|new\s*construction|new\s*system/i.test(text)) return 'new_install';
  if (/repair|fix|service\s*call/i.test(text)) return 'repair';
  if (/maintenance|tune.?up|inspection/i.test(text)) return 'maintenance';
  return null;
}

function extractSystemType(text: string): string | null {
  if (/mini.?split|ductless/i.test(text)) return 'mini_split';
  if (/heat\s*pump.*split|split.*heat\s*pump/i.test(text)) return 'heat_pump_split';
  if (/heat\s*pump/i.test(text)) return 'central_heat_pump';
  if (/furnace.*(?:ac|air\s*condition)|(?:ac|air\s*condition).*furnace/i.test(text)) return 'furnace_ac_split';
  if (/(?:^|\s)(?:ac|air\s*condition(?:er|ing))\s/i.test(text)) return 'ac_only';
  if (/furnace/i.test(text)) return 'furnace_only';
  if (/package\s*unit|packaged/i.test(text)) return 'package_unit';
  return null;
}

function extractBrand(text: string): string | null {
  const brandNames = Object.keys(BRAND_TIERS);
  const lower = text.toLowerCase();
  for (const brand of brandNames) {
    if (lower.includes(brand)) return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
  return null;
}

function extractNumber(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  if (match) return parseFloat(match[1]);
  return null;
}

function extractZip(text: string): string | null {
  const match = text.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

function extractLineItems(text: string): Array<{ category: string; description: string; amount: number }> {
  const items: Array<{ category: string; description: string; amount: number }> = [];
  const linePattern = /^(.+?)\s+\$?([\d,]+(?:\.\d{2})?)\s*$/gm;
  let match;
  while ((match = linePattern.exec(text)) !== null) {
    const description = match[1].trim();
    const amount = parseFloat(match[2].replace(/,/g, ''));
    if (amount >= 50 && amount <= 50000 && description.length > 3) {
      items.push({
        category: categorizeLineItem(description),
        description,
        amount,
      });
    }
  }
  return items;
}

function categorizeLineItem(description: string): string {
  const lower = description.toLowerCase();
  if (/equip|unit|system|condenser|compressor|handler|coil|heat\s*pump/i.test(lower)) return 'equipment';
  if (/labor|install|work/i.test(lower)) return 'labor';
  if (/duct/i.test(lower)) return 'ductwork';
  if (/electr|panel|wiring|circuit|breaker/i.test(lower)) return 'electrical';
  if (/permit/i.test(lower)) return 'permit';
  return 'other';
}
