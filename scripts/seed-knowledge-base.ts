import 'dotenv/config';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { storeRawQuote } from '../server/lib/knowledgeBase.js';
import { recompileKnowledgeBase } from '../server/lib/recompiler.js';
import { SYSTEM_BASELINES, QUALITY_ADJUSTMENTS, SIZE_ADJUSTMENTS } from '../data/baselines.js';
import { lookupZip } from '../server/lib/zipLookup.js';
import { lookupCbsaCost } from '../data/cbsa-cost-index.js';

const SEED_ZIPS = [
  '10001', '90001', '60601', '77001', '85001',
  '19101', '78201', '92101', '75201', '95101',
  '78701', '32801', '30301', '98101', '80201',
  '55401', '33101', '37201', '89101', '97201',
];

const SYSTEM_TYPES = Object.keys(SYSTEM_BASELINES) as Array<keyof typeof SYSTEM_BASELINES>;
const QUALITY_TIERS: Array<'budget' | 'mid' | 'premium'> = ['budget', 'mid', 'premium'];
const SIZE_BANDS: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

function randomVariation(base: number, spread: number): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * 2 * spread));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Seeding knowledge base...');
  mkdirSync(join(process.cwd(), 'knowledge', 'raw'), { recursive: true });
  mkdirSync(join(process.cwd(), 'knowledge', 'compiled'), { recursive: true });

  let count = 0;
  for (const zip of SEED_ZIPS) {
    const geo = lookupZip(zip);
    if (!geo) { console.warn(`ZIP ${zip} not found, skipping`); continue; }

    for (let i = 0; i < 5; i++) {
      const systemType = randomElement(SYSTEM_TYPES);
      const qualityTier = randomElement(QUALITY_TIERS);
      const sizeBand = randomElement(SIZE_BANDS);

      const baseline = SYSTEM_BASELINES[systemType];
      const cbsaEntry = geo.cbsaCode ? lookupCbsaCost(geo.cbsaCode) : null;
      const compositeIndex = cbsaEntry?.compositeIndex ?? 1.0;
      const qualityFactor = QUALITY_ADJUSTMENTS[qualityTier];
      const sizeFactor = SIZE_ADJUSTMENTS[sizeBand];

      const fairPrice = baseline * compositeIndex * qualityFactor * sizeFactor;
      const quotedTotal = randomVariation(fairPrice, 0.15);

      const ductworkIncluded = Math.random() > 0.6;
      const electricalIncluded = Math.random() > 0.7;
      const permitsIncluded = Math.random() > 0.3;

      const equipmentCost = Math.round(quotedTotal * 0.4);
      const laborCost = Math.round(quotedTotal * 0.25);

      const lineItems: Array<{ category: 'equipment' | 'labor' | 'ductwork' | 'electrical' | 'permit'; description: string; amount: number }> = [
        { category: 'equipment', description: 'HVAC unit and components', amount: equipmentCost },
        { category: 'labor', description: 'Installation labor', amount: laborCost },
      ];
      if (ductworkIncluded) lineItems.push({ category: 'ductwork', description: 'Ductwork modifications', amount: randomVariation(2800, 0.2) });
      if (electricalIncluded) lineItems.push({ category: 'electrical', description: 'Electrical work', amount: randomVariation(1400, 0.2) });
      if (permitsIncluded) lineItems.push({ category: 'permit', description: 'Permits and inspections', amount: randomVariation(500, 0.3) });

      const tonnage = sizeBand === 'small' ? 2.0 : sizeBand === 'large' ? 5.0 : 3.0;
      const seer2 = qualityTier === 'premium' ? 20 : qualityTier === 'budget' ? 14 : 16;

      storeRawQuote({
        extractionConfidence: 0.95,
        zipCode: zip, latitude: geo.lat, longitude: geo.lon,
        state: geo.state, metro: geo.metro, climateRegion: geo.climateRegion, cbsaCode: geo.cbsaCode,
        contractorName: null, quotedTotal,
        jobType: 'replacement', systemType: systemType as any,
        equipmentBrand: null, seer2, tonnage, qualityTier, sizeBand,
        lineItems, warrantyYears: qualityTier === 'premium' ? 12 : qualityTier === 'budget' ? 5 : 10,
        permitsIncluded, ductworkIncluded, electricalIncluded,
      }, 'seed', 'extracted');
      count++;
    }
  }

  console.log(`Created ${count} seed quotes.`);
  console.log('Recompiling knowledge base...');
  const result = await recompileKnowledgeBase();
  console.log(`Recompilation complete. ${result.articlesWritten} articles written.`);
}

main().catch(console.error);
