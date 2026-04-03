# HVAC Price Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an autonomous HVAC pricing transparency agent that analyzes uploaded quotes against a growing knowledge base, rates them Low/Fair/High, and charges $9 to unlock savings details when overpaying by $500+.

**Architecture:** React + Vite + Tailwind frontend, Express + TypeScript backend, Claude API for extraction and analysis, file-based knowledge base (JSON raw quotes + LLM-compiled markdown articles), Stripe for $9 unlock payments.

**Tech Stack:** React 18, Vite, TailwindCSS, Express 5, TypeScript, Claude API (@anthropic-ai/sdk), pdf-parse, Tesseract.js, Stripe, Zod

---

## File Structure

### New Files to Create

**Project Config:**
- `package.json` — root package with all dependencies
- `tsconfig.json` — frontend TypeScript config
- `tsconfig.server.json` — server TypeScript config
- `vite.config.ts` — Vite config with API proxy
- `tailwind.config.ts` — Tailwind configuration
- `postcss.config.cjs` — PostCSS config for Tailwind
- `index.html` — Vite entry HTML
- `.env.example` — environment variable template

**Server:**
- `server/index.ts` — Express app setup, middleware, route mounting
- `server/types.ts` — All shared TypeScript interfaces (RawQuote, AnalysisResult, etc.)
- `server/routes/quotes.ts` — Upload, recompute, get endpoints
- `server/routes/payments.ts` — Stripe checkout + webhook + insights
- `server/routes/admin.ts` — KB recompile trigger
- `server/lib/pipeline.ts` — Orchestrates extract → validate → analyze → store
- `server/lib/extraction.ts` — PDF and image text extraction
- `server/lib/llmExtraction.ts` — Claude structured extraction call
- `server/lib/heuristicExtraction.ts` — Regex fallback extraction
- `server/lib/normalization.ts` — Infer quality tier, size band, geography
- `server/lib/validation.ts` — Five validation gates
- `server/lib/knowledgeBase.ts` — Read/write/query KB files
- `server/lib/analyzer.ts` — Claude analysis call (reads KB context, produces rating)
- `server/lib/recompiler.ts` — KB recompilation logic
- `server/lib/stripe.ts` — Stripe checkout session + webhook verification
- `server/lib/zipLookup.ts` — Bundled ZIP → geography lookup

**Data:**
- `data/baselines.ts` — Tier 1 hardcoded national baselines, climate factors, brand tiers, state multipliers
- `data/zip-geography.json` — Full US ZIP database (~42k entries)
- `data/seed-quotes/` — ~100 Tier 2 seed quote JSON files

**Knowledge Base (generated at seed time):**
- `knowledge/raw/` — validated quote JSON files
- `knowledge/compiled/` — LLM-generated markdown articles
- `knowledge/index.md` — master index
- `knowledge/confidence-map.md` — data coverage map

**Frontend:**
- `src/main.tsx` — React entry point
- `src/App.tsx` — Main app with routing logic
- `src/types.ts` — Frontend type definitions
- `src/index.css` — Tailwind base styles
- `src/components/UploadZone.tsx` — File upload drop zone
- `src/components/ProcessingSteps.tsx` — Progress indicator
- `src/components/ResultsCard.tsx` — Free tier results display
- `src/components/PaidInsights.tsx` — Paid tier component breakdown + negotiation points
- `src/components/EditableFields.tsx` — User correction form
- `src/components/RatingBadge.tsx` — Low/Fair/High pill
- `src/components/FairRangeBar.tsx` — Visual fair range indicator
- `src/lib/api.ts` — API client functions
- `src/lib/format.ts` — Currency formatting utilities

**Scripts:**
- `scripts/seed-knowledge-base.ts` — Generate Tier 2 seed quotes + Tier 3 compiled articles

**Evals:**
- `evals/fixtures/quotes/` — Test quote PDFs/images
- `evals/fixtures/expected/` — Expected extraction/analysis JSON
- `evals/extraction.test.ts` — Extraction eval runner
- `evals/analysis.test.ts` — Analysis eval runner
- `evals/validation.test.ts` — Validation gate eval runner
- `evals/e2e.test.ts` — End-to-end eval runner

---

### Task 1: Project Scaffolding & Config

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.server.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.cjs`
- Create: `index.html`
- Create: `.env.example`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`
- Create: `server/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "hvac-price-agent",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"vite\" \"tsx watch server/index.ts\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "vite build && tsc -p tsconfig.server.json",
    "seed": "tsx scripts/seed-knowledge-base.ts",
    "eval:extraction": "tsx evals/extraction.test.ts",
    "eval:analysis": "tsx evals/analysis.test.ts",
    "eval:gates": "tsx evals/validation.test.ts",
    "eval:e2e": "tsx evals/e2e.test.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "express": "^5.1.0",
    "multer": "^2.0.0",
    "pdf-parse": "^1.1.1",
    "stripe": "^17.0.0",
    "tesseract.js": "^5.1.1",
    "uuid": "^11.1.0",
    "zod": "^3.24.0",
    "dotenv": "^16.4.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/multer": "^1.4.12",
    "@types/pdf-parse": "^1.1.4",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "concurrently": "^9.1.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json (frontend)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create tsconfig.server.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist/server",
    "rootDir": ".",
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["server/**/*.ts", "data/**/*.ts"]
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5178',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 5: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 6: Create postcss.config.cjs**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HVAC Price Agent</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create .env.example**

```
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
ADMIN_KEY=change-me
PORT=5178
```

- [ ] **Step 9: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 10: Create src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 11: Create src/App.tsx (minimal placeholder)**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-900">HVAC Price Agent</h1>
    </div>
  );
}
```

- [ ] **Step 12: Create server/index.ts (minimal Express server)**

```typescript
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT || '5178', 10);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 13: Install dependencies and verify**

Run: `npm install`
Expected: Clean install, no errors.

Run: `npm run dev:server`
Expected: "Server running on http://localhost:5178"

Run (in another terminal): `curl http://localhost:5178/api/health`
Expected: `{"ok":true,"services":{"claude":false,"stripe":false}}`

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.server.json vite.config.ts tailwind.config.ts postcss.config.cjs index.html .env.example src/main.tsx src/index.css src/App.tsx server/index.ts
git commit -m "feat: scaffold project with Vite + Express + Tailwind"
```

---

### Task 2: Shared Types

**Files:**
- Create: `server/types.ts`
- Create: `src/types.ts`

- [ ] **Step 1: Create server/types.ts**

```typescript
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
```

- [ ] **Step 2: Create src/types.ts**

```typescript
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

  paidInsights: PaidInsights | null;
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
```

- [ ] **Step 3: Commit**

```bash
git add server/types.ts src/types.ts
git commit -m "feat: add shared type definitions for server and frontend"
```

---

### Task 3: Baseline Data & ZIP Lookup

**Files:**
- Create: `data/baselines.ts`
- Create: `server/lib/zipLookup.ts`
- Create: `data/zip-geography.json` (placeholder with structure — full data sourced separately)

- [ ] **Step 1: Create data/baselines.ts**

```typescript
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
```

- [ ] **Step 2: Create server/lib/zipLookup.ts**

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import type { ZipEntry } from '../types.js';

let zipMap: Map<string, ZipEntry> | null = null;

function loadZipData(): Map<string, ZipEntry> {
  if (zipMap) return zipMap;
  const raw = readFileSync(join(process.cwd(), 'data', 'zip-geography.json'), 'utf-8');
  const entries: ZipEntry[] = JSON.parse(raw);
  zipMap = new Map(entries.map((e) => [e.zip, e]));
  return zipMap;
}

export function lookupZip(zip: string): ZipEntry | null {
  const map = loadZipData();
  return map.get(zip) ?? null;
}

export function findNearbyZips(lat: number, lon: number, radiusMiles: number): ZipEntry[] {
  const map = loadZipData();
  const results: ZipEntry[] = [];
  for (const entry of map.values()) {
    const dist = haversine(lat, lon, entry.lat, entry.lon);
    if (dist <= radiusMiles) {
      results.push(entry);
    }
  }
  return results;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
```

- [ ] **Step 3: Create a starter zip-geography.json with 20 major metros**

Create `data/zip-geography.json` with representative ZIP codes. The full ~42k dataset will be sourced from Census ZCTA data in a separate step. For now, include ~100 ZIPs across 20 metros to enable development and testing:

```json
[
  {"zip":"10001","lat":40.7484,"lon":-73.9967,"state":"NY","metro":"New York","climateRegion":"northeast"},
  {"zip":"10002","lat":40.7157,"lon":-73.9863,"state":"NY","metro":"New York","climateRegion":"northeast"},
  {"zip":"10003","lat":40.7317,"lon":-73.9893,"state":"NY","metro":"New York","climateRegion":"northeast"},
  {"zip":"10004","lat":40.6989,"lon":-74.0393,"state":"NY","metro":"New York","climateRegion":"northeast"},
  {"zip":"10005","lat":40.7069,"lon":-74.0089,"state":"NY","metro":"New York","climateRegion":"northeast"},
  {"zip":"90001","lat":33.9425,"lon":-118.2551,"state":"CA","metro":"Los Angeles","climateRegion":"west_coast"},
  {"zip":"90002","lat":33.9490,"lon":-118.2470,"state":"CA","metro":"Los Angeles","climateRegion":"west_coast"},
  {"zip":"90003","lat":33.9640,"lon":-118.2730,"state":"CA","metro":"Los Angeles","climateRegion":"west_coast"},
  {"zip":"90004","lat":34.0770,"lon":-118.3090,"state":"CA","metro":"Los Angeles","climateRegion":"west_coast"},
  {"zip":"90005","lat":34.0590,"lon":-118.3090,"state":"CA","metro":"Los Angeles","climateRegion":"west_coast"},
  {"zip":"60601","lat":41.8862,"lon":-87.6186,"state":"IL","metro":"Chicago","climateRegion":"midwest"},
  {"zip":"60602","lat":41.8830,"lon":-87.6288,"state":"IL","metro":"Chicago","climateRegion":"midwest"},
  {"zip":"60603","lat":41.8797,"lon":-87.6270,"state":"IL","metro":"Chicago","climateRegion":"midwest"},
  {"zip":"60604","lat":41.8785,"lon":-87.6290,"state":"IL","metro":"Chicago","climateRegion":"midwest"},
  {"zip":"60605","lat":41.8672,"lon":-87.6180,"state":"IL","metro":"Chicago","climateRegion":"midwest"},
  {"zip":"77001","lat":29.7545,"lon":-95.3536,"state":"TX","metro":"Houston","climateRegion":"south_central"},
  {"zip":"77002","lat":29.7560,"lon":-95.3594,"state":"TX","metro":"Houston","climateRegion":"south_central"},
  {"zip":"77003","lat":29.7517,"lon":-95.3414,"state":"TX","metro":"Houston","climateRegion":"south_central"},
  {"zip":"77004","lat":29.7282,"lon":-95.3602,"state":"TX","metro":"Houston","climateRegion":"south_central"},
  {"zip":"77005","lat":29.7174,"lon":-95.4224,"state":"TX","metro":"Houston","climateRegion":"south_central"},
  {"zip":"85001","lat":33.4484,"lon":-112.0740,"state":"AZ","metro":"Phoenix","climateRegion":"desert"},
  {"zip":"85002","lat":33.4370,"lon":-112.0770,"state":"AZ","metro":"Phoenix","climateRegion":"desert"},
  {"zip":"85003","lat":33.4510,"lon":-112.0800,"state":"AZ","metro":"Phoenix","climateRegion":"desert"},
  {"zip":"85004","lat":33.4530,"lon":-112.0700,"state":"AZ","metro":"Phoenix","climateRegion":"desert"},
  {"zip":"85005","lat":33.4580,"lon":-112.0940,"state":"AZ","metro":"Phoenix","climateRegion":"desert"},
  {"zip":"19101","lat":39.9526,"lon":-75.1652,"state":"PA","metro":"Philadelphia","climateRegion":"mid_atlantic"},
  {"zip":"19102","lat":39.9526,"lon":-75.1685,"state":"PA","metro":"Philadelphia","climateRegion":"mid_atlantic"},
  {"zip":"19103","lat":39.9527,"lon":-75.1737,"state":"PA","metro":"Philadelphia","climateRegion":"mid_atlantic"},
  {"zip":"19104","lat":39.9575,"lon":-75.1990,"state":"PA","metro":"Philadelphia","climateRegion":"mid_atlantic"},
  {"zip":"19106","lat":39.9474,"lon":-75.1460,"state":"PA","metro":"Philadelphia","climateRegion":"mid_atlantic"},
  {"zip":"78201","lat":29.4680,"lon":-98.5254,"state":"TX","metro":"San Antonio","climateRegion":"south_central"},
  {"zip":"78202","lat":29.4336,"lon":-98.4647,"state":"TX","metro":"San Antonio","climateRegion":"south_central"},
  {"zip":"78203","lat":29.4139,"lon":-98.4648,"state":"TX","metro":"San Antonio","climateRegion":"south_central"},
  {"zip":"78204","lat":29.4111,"lon":-98.5111,"state":"TX","metro":"San Antonio","climateRegion":"south_central"},
  {"zip":"78205","lat":29.4240,"lon":-98.4949,"state":"TX","metro":"San Antonio","climateRegion":"south_central"},
  {"zip":"92101","lat":32.7194,"lon":-117.1628,"state":"CA","metro":"San Diego","climateRegion":"west_coast"},
  {"zip":"92102","lat":32.7148,"lon":-117.1277,"state":"CA","metro":"San Diego","climateRegion":"west_coast"},
  {"zip":"92103","lat":32.7464,"lon":-117.1700,"state":"CA","metro":"San Diego","climateRegion":"west_coast"},
  {"zip":"92104","lat":32.7411,"lon":-117.1300,"state":"CA","metro":"San Diego","climateRegion":"west_coast"},
  {"zip":"92105","lat":32.7375,"lon":-117.0945,"state":"CA","metro":"San Diego","climateRegion":"west_coast"},
  {"zip":"75201","lat":32.7872,"lon":-96.7985,"state":"TX","metro":"Dallas","climateRegion":"south_central"},
  {"zip":"75202","lat":32.7826,"lon":-96.7990,"state":"TX","metro":"Dallas","climateRegion":"south_central"},
  {"zip":"75203","lat":32.7459,"lon":-96.8107,"state":"TX","metro":"Dallas","climateRegion":"south_central"},
  {"zip":"75204","lat":32.8019,"lon":-96.7856,"state":"TX","metro":"Dallas","climateRegion":"south_central"},
  {"zip":"75205","lat":32.8350,"lon":-96.7920,"state":"TX","metro":"Dallas","climateRegion":"south_central"},
  {"zip":"95101","lat":37.3361,"lon":-121.8906,"state":"CA","metro":"San Jose","climateRegion":"west_coast"},
  {"zip":"95103","lat":37.3300,"lon":-121.8850,"state":"CA","metro":"San Jose","climateRegion":"west_coast"},
  {"zip":"95110","lat":37.3464,"lon":-121.9018,"state":"CA","metro":"San Jose","climateRegion":"west_coast"},
  {"zip":"95112","lat":37.3514,"lon":-121.8831,"state":"CA","metro":"San Jose","climateRegion":"west_coast"},
  {"zip":"95113","lat":37.3335,"lon":-121.8893,"state":"CA","metro":"San Jose","climateRegion":"west_coast"},
  {"zip":"78701","lat":30.2712,"lon":-97.7431,"state":"TX","metro":"Austin","climateRegion":"south_central"},
  {"zip":"78702","lat":30.2596,"lon":-97.7224,"state":"TX","metro":"Austin","climateRegion":"south_central"},
  {"zip":"78703","lat":30.2963,"lon":-97.7718,"state":"TX","metro":"Austin","climateRegion":"south_central"},
  {"zip":"78704","lat":30.2400,"lon":-97.7657,"state":"TX","metro":"Austin","climateRegion":"south_central"},
  {"zip":"78705","lat":30.2897,"lon":-97.7426,"state":"TX","metro":"Austin","climateRegion":"south_central"},
  {"zip":"32801","lat":28.5421,"lon":-81.3790,"state":"FL","metro":"Orlando","climateRegion":"southeast"},
  {"zip":"32802","lat":28.5090,"lon":-81.3800,"state":"FL","metro":"Orlando","climateRegion":"southeast"},
  {"zip":"32803","lat":28.5584,"lon":-81.3560,"state":"FL","metro":"Orlando","climateRegion":"southeast"},
  {"zip":"32804","lat":28.5729,"lon":-81.3930,"state":"FL","metro":"Orlando","climateRegion":"southeast"},
  {"zip":"32805","lat":28.5269,"lon":-81.4020,"state":"FL","metro":"Orlando","climateRegion":"southeast"},
  {"zip":"30301","lat":33.7490,"lon":-84.3880,"state":"GA","metro":"Atlanta","climateRegion":"southeast"},
  {"zip":"30302","lat":33.7510,"lon":-84.3910,"state":"GA","metro":"Atlanta","climateRegion":"southeast"},
  {"zip":"30303","lat":33.7530,"lon":-84.3910,"state":"GA","metro":"Atlanta","climateRegion":"southeast"},
  {"zip":"30305","lat":33.8330,"lon":-84.3870,"state":"GA","metro":"Atlanta","climateRegion":"southeast"},
  {"zip":"30306","lat":33.7870,"lon":-84.3500,"state":"GA","metro":"Atlanta","climateRegion":"southeast"},
  {"zip":"98101","lat":47.6097,"lon":-122.3331,"state":"WA","metro":"Seattle","climateRegion":"northwest"},
  {"zip":"98102","lat":47.6363,"lon":-122.3215,"state":"WA","metro":"Seattle","climateRegion":"northwest"},
  {"zip":"98103","lat":47.6714,"lon":-122.3428,"state":"WA","metro":"Seattle","climateRegion":"northwest"},
  {"zip":"98104","lat":47.6047,"lon":-122.3340,"state":"WA","metro":"Seattle","climateRegion":"northwest"},
  {"zip":"98105","lat":47.6603,"lon":-122.2776,"state":"WA","metro":"Seattle","climateRegion":"northwest"},
  {"zip":"80201","lat":39.7392,"lon":-104.9903,"state":"CO","metro":"Denver","climateRegion":"mountain"},
  {"zip":"80202","lat":39.7516,"lon":-105.0003,"state":"CO","metro":"Denver","climateRegion":"mountain"},
  {"zip":"80203","lat":39.7316,"lon":-104.9828,"state":"CO","metro":"Denver","climateRegion":"mountain"},
  {"zip":"80204","lat":39.7363,"lon":-105.0208,"state":"CO","metro":"Denver","climateRegion":"mountain"},
  {"zip":"80205","lat":39.7598,"lon":-104.9677,"state":"CO","metro":"Denver","climateRegion":"mountain"},
  {"zip":"55401","lat":44.9818,"lon":-93.2697,"state":"MN","metro":"Minneapolis","climateRegion":"midwest"},
  {"zip":"55402","lat":44.9765,"lon":-93.2756,"state":"MN","metro":"Minneapolis","climateRegion":"midwest"},
  {"zip":"55403","lat":44.9714,"lon":-93.2876,"state":"MN","metro":"Minneapolis","climateRegion":"midwest"},
  {"zip":"55404","lat":44.9620,"lon":-93.2612,"state":"MN","metro":"Minneapolis","climateRegion":"midwest"},
  {"zip":"55405","lat":44.9684,"lon":-93.3020,"state":"MN","metro":"Minneapolis","climateRegion":"midwest"},
  {"zip":"33101","lat":25.7617,"lon":-80.1918,"state":"FL","metro":"Miami","climateRegion":"southeast"},
  {"zip":"33109","lat":25.7610,"lon":-80.1340,"state":"FL","metro":"Miami","climateRegion":"southeast"},
  {"zip":"33125","lat":25.7810,"lon":-80.2340,"state":"FL","metro":"Miami","climateRegion":"southeast"},
  {"zip":"33126","lat":25.7770,"lon":-80.2960,"state":"FL","metro":"Miami","climateRegion":"southeast"},
  {"zip":"33127","lat":25.8110,"lon":-80.2020,"state":"FL","metro":"Miami","climateRegion":"southeast"},
  {"zip":"37201","lat":36.1627,"lon":-86.7816,"state":"TN","metro":"Nashville","climateRegion":"southeast"},
  {"zip":"37203","lat":36.1515,"lon":-86.7959,"state":"TN","metro":"Nashville","climateRegion":"southeast"},
  {"zip":"37204","lat":36.1170,"lon":-86.7870,"state":"TN","metro":"Nashville","climateRegion":"southeast"},
  {"zip":"37205","lat":36.1172,"lon":-86.8580,"state":"TN","metro":"Nashville","climateRegion":"southeast"},
  {"zip":"37206","lat":36.1830,"lon":-86.7390,"state":"TN","metro":"Nashville","climateRegion":"southeast"},
  {"zip":"89101","lat":36.1699,"lon":-115.1398,"state":"NV","metro":"Las Vegas","climateRegion":"desert"},
  {"zip":"89102","lat":36.1554,"lon":-115.1878,"state":"NV","metro":"Las Vegas","climateRegion":"desert"},
  {"zip":"89103","lat":36.1307,"lon":-115.2086,"state":"NV","metro":"Las Vegas","climateRegion":"desert"},
  {"zip":"89104","lat":36.1720,"lon":-115.1190,"state":"NV","metro":"Las Vegas","climateRegion":"desert"},
  {"zip":"89106","lat":36.1870,"lon":-115.1620,"state":"NV","metro":"Las Vegas","climateRegion":"desert"},
  {"zip":"97201","lat":45.5152,"lon":-122.6784,"state":"OR","metro":"Portland","climateRegion":"northwest"},
  {"zip":"97202","lat":45.4810,"lon":-122.6370,"state":"OR","metro":"Portland","climateRegion":"northwest"},
  {"zip":"97203","lat":45.5900,"lon":-122.7520,"state":"OR","metro":"Portland","climateRegion":"northwest"},
  {"zip":"97204","lat":45.5180,"lon":-122.6770,"state":"OR","metro":"Portland","climateRegion":"northwest"},
  {"zip":"97205","lat":45.5200,"lon":-122.6910,"state":"OR","metro":"Portland","climateRegion":"northwest"}
]
```

Note: This is a development starter set. Full ~42k ZIP dataset to be sourced from Census ZCTA data and integrated before production launch. The `seed-knowledge-base.ts` script will log a warning if running with the starter set.

- [ ] **Step 4: Verify ZIP lookup works**

Run: `npx tsx -e "import { lookupZip } from './server/lib/zipLookup.js'; console.log(lookupZip('90001'));"`
Expected: `{ zip: '90001', lat: 33.9425, lon: -118.2551, state: 'CA', metro: 'Los Angeles', climateRegion: 'west_coast' }`

- [ ] **Step 5: Commit**

```bash
git add data/baselines.ts data/zip-geography.json server/lib/zipLookup.ts
git commit -m "feat: add baseline pricing data and ZIP geography lookup"
```

---

### Task 4: Text Extraction (PDF + Image)

**Files:**
- Create: `server/lib/extraction.ts`

- [ ] **Step 1: Create server/lib/extraction.ts**

```typescript
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; method: 'pdf' | 'ocr' }> {
  if (mimeType === 'application/pdf') {
    return extractFromPdf(buffer);
  }
  if (mimeType.startsWith('image/')) {
    return extractFromImage(buffer);
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractFromPdf(buffer: Buffer): Promise<{ text: string; method: 'pdf' }> {
  const result = await pdfParse(buffer);
  const text = result.text.trim();
  if (!text) {
    throw new Error('PDF contained no extractable text');
  }
  return { text, method: 'pdf' };
}

async function extractFromImage(buffer: Buffer): Promise<{ text: string; method: 'ocr' }> {
  const { data } = await Tesseract.recognize(buffer, 'eng');
  const text = data.text.trim();
  if (!text) {
    throw new Error('OCR extracted no readable text from image');
  }
  return { text, method: 'ocr' };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsx -e "import { extractText } from './server/lib/extraction.js'; console.log('import ok');"`
Expected: `import ok`

- [ ] **Step 3: Commit**

```bash
git add server/lib/extraction.ts
git commit -m "feat: add PDF and image text extraction"
```

---

### Task 5: Heuristic Extraction

**Files:**
- Create: `server/lib/heuristicExtraction.ts`

- [ ] **Step 1: Create server/lib/heuristicExtraction.ts**

```typescript
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
  // Fallback: largest dollar amount in the document
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
```

- [ ] **Step 2: Commit**

```bash
git add server/lib/heuristicExtraction.ts
git commit -m "feat: add heuristic regex-based quote extraction"
```

---

### Task 6: LLM Extraction (Claude)

**Files:**
- Create: `server/lib/llmExtraction.ts`

- [ ] **Step 1: Create server/lib/llmExtraction.ts**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic();

const ExtractionSchema = z.object({
  contractorName: z.string().nullable(),
  quotedTotal: z.number().nullable(),
  jobType: z.enum(['new_install', 'replacement', 'repair', 'maintenance']).nullable(),
  systemType: z.enum([
    'central_heat_pump', 'heat_pump_split', 'mini_split',
    'furnace_ac_split', 'ac_only', 'furnace_only', 'package_unit', 'other',
  ]).nullable(),
  equipmentBrand: z.string().nullable(),
  seer2: z.number().nullable(),
  tonnage: z.number().nullable(),
  qualityTierHint: z.enum(['budget', 'mid', 'premium']).nullable(),
  zipCode: z.string().regex(/^\d{5}$/).nullable(),
  warrantyYears: z.number().nullable(),
  permitsIncluded: z.boolean(),
  ductworkIncluded: z.boolean(),
  electricalIncluded: z.boolean(),
  lineItems: z.array(z.object({
    category: z.enum(['equipment', 'labor', 'ductwork', 'electrical', 'permit', 'other']),
    description: z.string(),
    amount: z.number(),
  })),
  confidence: z.number().min(0).max(1),
});

export type LlmExtractionResult = z.infer<typeof ExtractionSchema>;

const EXTRACTION_PROMPT = `Extract structured HVAC quote data from the text below.
Return a single JSON object only. Use null for missing values.

Field definitions:
- contractorName: The company or contractor name
- quotedTotal: The total price quoted in dollars (number, no $ sign)
- jobType: One of "new_install", "replacement", "repair", "maintenance"
- systemType: One of "central_heat_pump", "heat_pump_split", "mini_split", "furnace_ac_split", "ac_only", "furnace_only", "package_unit", "other"
- equipmentBrand: The HVAC equipment manufacturer name
- seer2: SEER or SEER2 efficiency rating (number)
- tonnage: System capacity in tons (number)
- qualityTierHint: Your assessment — "budget", "mid", or "premium" based on brand/specs
- zipCode: 5-digit US ZIP code found in the document
- warrantyYears: Warranty duration in years
- permitsIncluded: Whether permits are included in the quote (boolean)
- ductworkIncluded: Whether ductwork is included (boolean)
- electricalIncluded: Whether electrical work is included (boolean)
- lineItems: Array of {category, description, amount} for each line item found
  - category: One of "equipment", "labor", "ductwork", "electrical", "permit", "other"
- confidence: Your confidence in the overall extraction accuracy (0.0 to 1.0)

Quote text:
`;

export async function extractWithLlm(text: string): Promise<LlmExtractionResult | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + text,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return null;

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = ExtractionSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('LLM extraction validation failed:', validated.error.issues);
      return null;
    }

    return validated.data;
  } catch (err) {
    console.warn('LLM extraction failed:', err);
    return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/lib/llmExtraction.ts
git commit -m "feat: add Claude-based structured quote extraction"
```

---

### Task 7: Normalization

**Files:**
- Create: `server/lib/normalization.ts`

- [ ] **Step 1: Create server/lib/normalization.ts**

```typescript
import type { RawQuote, SystemType } from '../types.js';
import type { LlmExtractionResult } from './llmExtraction.js';
import type { HeuristicResult } from './heuristicExtraction.js';
import { BRAND_TIERS } from '../../data/baselines.js';
import { lookupZip } from './zipLookup.js';
import { v4 as uuid } from 'uuid';

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

function inferQualityTier(
  hint: string | null,
  brand: string | null,
  seer2: number | null
): 'budget' | 'mid' | 'premium' {
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

function resolveGeography(zipCode: string): {
  lat: number;
  lon: number;
  state: string;
  metro: string | null;
  climateRegion: string;
} {
  const entry = lookupZip(zipCode);
  if (entry) {
    return {
      lat: entry.lat,
      lon: entry.lon,
      state: entry.state,
      metro: entry.metro,
      climateRegion: entry.climateRegion,
    };
  }
  // Fallback for unknown ZIPs
  return {
    lat: 39.8283,
    lon: -98.5795,
    state: 'US',
    metro: null,
    climateRegion: 'midwest',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add server/lib/normalization.ts
git commit -m "feat: add extraction merge and normalization logic"
```

---

### Task 8: Validation Gates

**Files:**
- Create: `server/lib/validation.ts`

- [ ] **Step 1: Create server/lib/validation.ts**

```typescript
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { RawQuote, ValidationResult } from '../types.js';
import { COMPONENT_RANGES } from '../../data/baselines.js';

const KB_RAW_DIR = join(process.cwd(), 'knowledge', 'raw');

export function validateForKnowledgeBase(
  quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>
): ValidationResult {
  const failures: string[] = [];

  // Gate 1: Extraction confidence
  if (quote.extractionConfidence < 0.6) {
    failures.push(`Extraction confidence too low: ${quote.extractionConfidence} (min 0.6)`);
  }

  // Gate 2: Range sanity
  if (quote.quotedTotal < 2000 || quote.quotedTotal > 80000) {
    failures.push(`Total price out of plausible range: $${quote.quotedTotal} (expected $2,000-$80,000)`);
  }
  for (const item of quote.lineItems) {
    const range = COMPONENT_RANGES[item.category];
    if (range && item.amount > range.high * 3) {
      failures.push(`Line item "${item.description}" amount $${item.amount} exceeds 3x typical high for ${item.category}`);
    }
  }

  // Gate 3: Completeness
  if (!quote.quotedTotal || quote.quotedTotal === 0) {
    failures.push('Missing quoted total');
  }
  if (quote.systemType === 'other') {
    failures.push('System type could not be determined');
  }
  if (!quote.zipCode || quote.zipCode === '00000') {
    failures.push('Missing ZIP code');
  }

  // Gate 4: Duplicate detection
  if (isDuplicate(quote)) {
    failures.push('Duplicate quote detected (same contractor, similar total, same ZIP within 7 days)');
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

function isDuplicate(
  quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>
): boolean {
  if (!quote.contractorName || !existsSync(KB_RAW_DIR)) return false;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  try {
    const years = readdirSync(KB_RAW_DIR).filter((d) => /^\d{4}$/.test(d));
    for (const year of years) {
      const months = readdirSync(join(KB_RAW_DIR, year)).filter((d) => /^\d{2}$/.test(d));
      for (const month of months) {
        const files = readdirSync(join(KB_RAW_DIR, year, month)).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          const raw = readFileSync(join(KB_RAW_DIR, year, month, file), 'utf-8');
          const existing: RawQuote = JSON.parse(raw);
          const existingTime = new Date(existing.timestamp).getTime();

          if (existingTime < sevenDaysAgo) continue;
          if (existing.zipCode !== quote.zipCode) continue;
          if (!existing.contractorName) continue;
          if (existing.contractorName.toLowerCase() !== quote.contractorName.toLowerCase()) continue;

          const priceDiff = Math.abs(existing.quotedTotal - quote.quotedTotal) / existing.quotedTotal;
          if (priceDiff <= 0.05) return true;
        }
      }
    }
  } catch {
    // If KB doesn't exist yet, no duplicates
  }

  return false;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/lib/validation.ts
git commit -m "feat: add five validation gates for knowledge base entry"
```

---

### Task 9: Knowledge Base Read/Write

**Files:**
- Create: `server/lib/knowledgeBase.ts`

- [ ] **Step 1: Create server/lib/knowledgeBase.ts**

```typescript
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import type { RawQuote } from '../types.js';
import { v4 as uuid } from 'uuid';

const KB_DIR = join(process.cwd(), 'knowledge');
const RAW_DIR = join(KB_DIR, 'raw');
const COMPILED_DIR = join(KB_DIR, 'compiled');

export function storeRawQuote(
  quoteData: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>,
  source: 'user' | 'seed' = 'user',
  trust: 'extracted' | 'user_verified' = 'extracted'
): RawQuote {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const id = uuid();

  const quote: RawQuote = {
    ...quoteData,
    id,
    timestamp: now.toISOString(),
    source,
    trust,
  };

  const dir = join(RAW_DIR, year, month);
  mkdirSync(dir, { recursive: true });
  const filename = `${day}-${id}.json`;
  writeFileSync(join(dir, filename), JSON.stringify(quote, null, 2));

  return quote;
}

export function countRawQuotes(filters?: {
  state?: string;
  metro?: string;
  climateRegion?: string;
  systemType?: string;
}): number {
  return loadRawQuotes(filters).length;
}

export function loadRawQuotes(filters?: {
  state?: string;
  metro?: string;
  climateRegion?: string;
  systemType?: string;
  zipCode?: string;
  maxAgeDays?: number;
}): RawQuote[] {
  const quotes: RawQuote[] = [];
  if (!existsSync(RAW_DIR)) return quotes;

  const cutoff = filters?.maxAgeDays
    ? Date.now() - filters.maxAgeDays * 24 * 60 * 60 * 1000
    : 0;

  const years = readdirSync(RAW_DIR).filter((d) => /^\d{4}$/.test(d));
  for (const year of years) {
    const yearPath = join(RAW_DIR, year);
    const months = readdirSync(yearPath).filter((d) => /^\d{2}$/.test(d));
    for (const month of months) {
      const monthPath = join(yearPath, month);
      const files = readdirSync(monthPath).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const raw = readFileSync(join(monthPath, file), 'utf-8');
          const quote: RawQuote = JSON.parse(raw);

          if (cutoff && new Date(quote.timestamp).getTime() < cutoff) continue;
          if (filters?.state && quote.state !== filters.state) continue;
          if (filters?.metro && quote.metro !== filters.metro) continue;
          if (filters?.climateRegion && quote.climateRegion !== filters.climateRegion) continue;
          if (filters?.systemType && quote.systemType !== filters.systemType) continue;
          if (filters?.zipCode && quote.zipCode !== filters.zipCode) continue;

          quotes.push(quote);
        } catch {
          // Skip malformed files
        }
      }
    }
  }

  return quotes;
}

export function readCompiledArticle(relativePath: string): string | null {
  const fullPath = join(COMPILED_DIR, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf-8');
}

export function writeCompiledArticle(relativePath: string, content: string): void {
  const fullPath = join(COMPILED_DIR, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content);
}

export function readIndex(): string | null {
  const indexPath = join(KB_DIR, 'index.md');
  if (!existsSync(indexPath)) return null;
  return readFileSync(indexPath, 'utf-8');
}

export function writeIndex(content: string): void {
  writeFileSync(join(KB_DIR, 'index.md'), content);
}

export function readConfidenceMap(): string | null {
  const mapPath = join(KB_DIR, 'confidence-map.md');
  if (!existsSync(mapPath)) return null;
  return readFileSync(mapPath, 'utf-8');
}

export function writeConfidenceMap(content: string): void {
  writeFileSync(join(KB_DIR, 'confidence-map.md'), content);
}

export function getKbStats(): { totalQuotes: number; lastCompiled: string | null } {
  const total = loadRawQuotes().length;
  const indexContent = readIndex();
  let lastCompiled: string | null = null;
  if (indexContent) {
    const match = indexContent.match(/lastCompiled:\s*"([^"]+)"/);
    if (match) lastCompiled = match[1];
  }
  return { totalQuotes: total, lastCompiled };
}
```

- [ ] **Step 2: Commit**

```bash
git add server/lib/knowledgeBase.ts
git commit -m "feat: add knowledge base read/write/query operations"
```

---

### Task 10: LLM Analyzer (Claude Analysis Call)

**Files:**
- Create: `server/lib/analyzer.ts`

- [ ] **Step 1: Create server/lib/analyzer.ts**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { RawQuote, AnalysisResult, PaidInsights } from '../types.js';
import {
  readIndex,
  readConfidenceMap,
  readCompiledArticle,
  loadRawQuotes,
} from './knowledgeBase.js';
import {
  SYSTEM_BASELINES,
  CLIMATE_FACTORS,
  STATE_MULTIPLIERS,
  QUALITY_ADJUSTMENTS,
  SIZE_ADJUSTMENTS,
} from '../../data/baselines.js';

const client = new Anthropic();

const AnalysisSchema = z.object({
  rating: z.enum(['Low', 'Fair', 'High']),
  confidence: z.enum(['high', 'medium', 'low']),
  fairRange: z.object({
    low: z.number(),
    mid: z.number(),
    high: z.number(),
  }),
  savingsPotential: z.number(),
  summary: z.string(),
  dataQuality: z.object({
    sampleSize: z.number(),
    geographyPrecision: z.enum(['zip', 'metro', 'state', 'regional', 'national']),
    dataRecency: z.enum(['recent', 'moderate', 'limited']),
  }),
  componentBreakdown: z.array(z.object({
    category: z.string(),
    yourCost: z.number(),
    typicalRange: z.object({ low: z.number(), high: z.number() }),
    assessment: z.string(),
  })).nullable(),
  comparableQuotes: z.string().nullable(),
  negotiationPoints: z.array(z.string()).nullable(),
  detailedExplanation: z.string().nullable(),
});

export async function analyzeQuote(
  quoteData: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>,
  submissionId: string
): Promise<AnalysisResult> {
  const kbContext = buildKbContext(quoteData);
  const prompt = buildAnalysisPrompt(quoteData, kbContext);

  if (!process.env.ANTHROPIC_API_KEY) {
    return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = AnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('Analysis validation failed:', validated.error.issues);
      return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
    }

    const result = validated.data;
    const paidInsights: PaidInsights | null =
      result.rating === 'High' && result.savingsPotential >= 500 && result.componentBreakdown
        ? {
            componentBreakdown: result.componentBreakdown,
            comparableQuotes: result.comparableQuotes ?? '',
            negotiationPoints: result.negotiationPoints ?? [],
            detailedExplanation: result.detailedExplanation ?? '',
          }
        : null;

    return {
      submissionId,
      rating: result.rating,
      confidence: result.confidence,
      quotedTotal: quoteData.quotedTotal,
      fairRange: result.fairRange,
      savingsPotential: result.savingsPotential,
      summary: result.summary,
      extractedData: {
        contractorName: quoteData.contractorName,
        jobType: quoteData.jobType,
        systemType: quoteData.systemType,
        equipmentBrand: quoteData.equipmentBrand,
        seer2: quoteData.seer2,
        tonnage: quoteData.tonnage,
        qualityTier: quoteData.qualityTier,
        sizeBand: quoteData.sizeBand,
        zipCode: quoteData.zipCode,
        warrantyYears: quoteData.warrantyYears,
        permitsIncluded: quoteData.permitsIncluded,
        ductworkIncluded: quoteData.ductworkIncluded,
        electricalIncluded: quoteData.electricalIncluded,
        lineItems: quoteData.lineItems,
      },
      dataQuality: result.dataQuality,
      paidInsights,
    };
  } catch (err) {
    console.warn('Analysis LLM call failed:', err);
    return buildFallbackAnalysis(quoteData, submissionId, kbContext.sampleSize);
  }
}

interface KbContext {
  indexContent: string;
  confidenceMap: string;
  regionalArticle: string;
  systemArticle: string;
  componentArticles: string;
  sampleSize: number;
  relevantQuoteSummary: string;
}

function buildKbContext(quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>): KbContext {
  const indexContent = readIndex() ?? 'No index available. Knowledge base is new.';
  const confidenceMap = readConfidenceMap() ?? 'No confidence map available.';

  // Try to load regional articles (most specific first)
  let regionalArticle = '';
  if (quote.metro) {
    const metroArticle = readCompiledArticle(
      `regions/${quote.climateRegion}/${quote.state.toLowerCase()}/${quote.metro.toLowerCase().replace(/\s+/g, '-')}.md`
    );
    if (metroArticle) regionalArticle += metroArticle + '\n\n';
  }
  const stateArticle = readCompiledArticle(
    `regions/${quote.climateRegion}/${quote.state.toLowerCase()}/overview.md`
  );
  if (stateArticle) regionalArticle += stateArticle + '\n\n';
  const regionArticle = readCompiledArticle(`regions/${quote.climateRegion}/overview.md`);
  if (regionArticle) regionalArticle += regionArticle;
  if (!regionalArticle) regionalArticle = 'No regional pricing articles available yet.';

  const systemArticle = readCompiledArticle(
    `system-types/${quote.systemType.replace(/_/g, '-')}.md`
  ) ?? 'No system type article available.';

  // Load component articles for line items found
  const componentCategories = [...new Set(quote.lineItems.map((i) => i.category))];
  const componentArticles = componentCategories
    .map((cat) => readCompiledArticle(`components/${cat}.md`))
    .filter(Boolean)
    .join('\n\n') || 'No component articles available.';

  // Load relevant raw quotes for context
  const localQuotes = loadRawQuotes({
    state: quote.state,
    systemType: quote.systemType,
    maxAgeDays: 180,
  });
  const sampleSize = localQuotes.length;

  let relevantQuoteSummary = '';
  if (localQuotes.length > 0) {
    const totals = localQuotes.map((q) => q.quotedTotal).sort((a, b) => a - b);
    const min = totals[0];
    const max = totals[totals.length - 1];
    const median = totals[Math.floor(totals.length / 2)];
    relevantQuoteSummary = `Found ${localQuotes.length} comparable quotes in ${quote.state} for ${quote.systemType} (last 180 days). Price range: $${min.toLocaleString()} - $${max.toLocaleString()}, median: $${median.toLocaleString()}.`;

    if (localQuotes.length <= 10) {
      relevantQuoteSummary += '\nIndividual quotes:\n';
      for (const q of localQuotes) {
        relevantQuoteSummary += `- $${q.quotedTotal.toLocaleString()} (${q.qualityTier} ${q.sizeBand}, ${q.metro ?? q.state}, ${q.source})\n`;
      }
    }
  } else {
    relevantQuoteSummary = 'No comparable quotes found in the knowledge base for this region and system type.';
  }

  return { indexContent, confidenceMap, regionalArticle, systemArticle, componentArticles, sampleSize, relevantQuoteSummary };
}

function buildAnalysisPrompt(
  quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>,
  ctx: KbContext
): string {
  return `You are an expert HVAC pricing analyst. Analyze this quote against the knowledge base and produce a pricing assessment.

## Quote to Analyze
- Total: $${quote.quotedTotal.toLocaleString()}
- System: ${quote.systemType} (${quote.qualityTier} tier, ${quote.sizeBand} size)
- Location: ${quote.zipCode}, ${quote.state}${quote.metro ? `, ${quote.metro} metro` : ''}
- Climate: ${quote.climateRegion}
- Brand: ${quote.equipmentBrand ?? 'Unknown'}
- SEER2: ${quote.seer2 ?? 'Unknown'}, Tonnage: ${quote.tonnage ?? 'Unknown'}
- Includes: ${[quote.permitsIncluded && 'permits', quote.ductworkIncluded && 'ductwork', quote.electricalIncluded && 'electrical'].filter(Boolean).join(', ') || 'none specified'}
- Line items: ${quote.lineItems.map((i) => `${i.category}: $${i.amount} (${i.description})`).join('; ') || 'none extracted'}
- Job type: ${quote.jobType}

## Knowledge Base Context

### Market Overview
${ctx.indexContent}

### Data Confidence for This Region
${ctx.confidenceMap}

### Regional Pricing Data
${ctx.regionalArticle}

### System Type Data
${ctx.systemArticle}

### Component Pricing Data
${ctx.componentArticles}

### Comparable Quotes
${ctx.relevantQuoteSummary}

## Instructions
Produce a JSON analysis with these fields:
- rating: "Low" (good deal), "Fair" (reasonable), or "High" (overpaying)
- confidence: "high" (strong data), "medium" (moderate data), "low" (limited data)
- fairRange: {low, mid, high} — the fair price range for this specific job
- savingsPotential: How much the user could save if High (0 if Fair or Low)
- summary: 2-3 sentence plain language assessment explaining your reasoning
- dataQuality: {sampleSize (number of comparable quotes), geographyPrecision ("zip"|"metro"|"state"|"regional"|"national"), dataRecency ("recent"|"moderate"|"limited")}
- componentBreakdown: Array of {category, yourCost, typicalRange: {low, high}, assessment} for each line item (null if no line items)
- comparableQuotes: Summary of similar local quotes if available (null if none)
- negotiationPoints: Specific talking points for negotiation if High (null otherwise)
- detailedExplanation: Detailed pricing analysis (null if Fair or Low)

Consider regional cost factors, quality tier, system size, included services, and available comparable data. Be honest about confidence — if data is thin, say so. Return only the JSON object.`;
}

function buildFallbackAnalysis(
  quote: Omit<RawQuote, 'id' | 'timestamp' | 'source' | 'trust'>,
  submissionId: string,
  sampleSize: number
): AnalysisResult {
  const baseline = SYSTEM_BASELINES[quote.systemType] ?? SYSTEM_BASELINES.other;
  const climateFactor = CLIMATE_FACTORS[quote.climateRegion] ?? 1.0;
  const stateFactor = STATE_MULTIPLIERS[quote.state] ?? 1.0;
  const qualityFactor = QUALITY_ADJUSTMENTS[quote.qualityTier] ?? 1.0;
  const sizeFactor = SIZE_ADJUSTMENTS[quote.sizeBand] ?? 1.0;

  const adjustedBaseline = baseline * climateFactor * stateFactor * qualityFactor * sizeFactor;
  const fairLow = Math.round(adjustedBaseline * 0.85);
  const fairMid = Math.round(adjustedBaseline);
  const fairHigh = Math.round(adjustedBaseline * 1.15);

  let rating: 'Low' | 'Fair' | 'High' = 'Fair';
  let savingsPotential = 0;
  if (quote.quotedTotal < fairLow) rating = 'Low';
  else if (quote.quotedTotal > fairHigh) {
    rating = 'High';
    savingsPotential = Math.round(quote.quotedTotal - fairMid);
  }

  return {
    submissionId,
    rating,
    confidence: 'low',
    quotedTotal: quote.quotedTotal,
    fairRange: { low: fairLow, mid: fairMid, high: fairHigh },
    savingsPotential,
    summary: `Based on national pricing data adjusted for your region (${quote.state}) and system specifications, your quote of $${quote.quotedTotal.toLocaleString()} is ${rating.toLowerCase()} compared to a typical fair range of $${fairLow.toLocaleString()} - $${fairHigh.toLocaleString()}. Note: this estimate uses limited data — confidence will improve as more local quotes are analyzed.`,
    extractedData: {
      contractorName: quote.contractorName,
      jobType: quote.jobType,
      systemType: quote.systemType,
      equipmentBrand: quote.equipmentBrand,
      seer2: quote.seer2,
      tonnage: quote.tonnage,
      qualityTier: quote.qualityTier,
      sizeBand: quote.sizeBand,
      zipCode: quote.zipCode,
      warrantyYears: quote.warrantyYears,
      permitsIncluded: quote.permitsIncluded,
      ductworkIncluded: quote.ductworkIncluded,
      electricalIncluded: quote.electricalIncluded,
      lineItems: quote.lineItems,
    },
    dataQuality: {
      sampleSize,
      geographyPrecision: 'national',
      dataRecency: 'limited',
    },
    paidInsights: null,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add server/lib/analyzer.ts
git commit -m "feat: add LLM-powered quote analyzer with KB context and fallback"
```

---

### Task 11: Processing Pipeline

**Files:**
- Create: `server/lib/pipeline.ts`

- [ ] **Step 1: Create server/lib/pipeline.ts**

```typescript
import type { AnalysisResult, QuoteSubmission } from '../types.js';
import { extractText } from './extraction.js';
import { extractHeuristic } from './heuristicExtraction.js';
import { extractWithLlm } from './llmExtraction.js';
import { mergeExtractions, normalize } from './normalization.js';
import { validateForKnowledgeBase } from './validation.js';
import { storeRawQuote } from './knowledgeBase.js';
import { analyzeQuote } from './analyzer.js';
import { v4 as uuid } from 'uuid';

// In-memory store for submissions (no DB for now)
const submissions = new Map<string, QuoteSubmission>();

export function getSubmission(id: string): QuoteSubmission | undefined {
  return submissions.get(id);
}

export function markPaid(id: string): boolean {
  const sub = submissions.get(id);
  if (!sub) return false;
  sub.paid = true;
  return true;
}

export async function processQuote(
  buffer: Buffer,
  mimeType: string,
  originalFilename: string,
  userZip?: string
): Promise<AnalysisResult> {
  const submissionId = uuid();

  const submission: QuoteSubmission = {
    id: submissionId,
    status: 'received',
    originalFilename,
    mimeType,
    rawText: null,
    analysisResult: null,
    paid: false,
    createdAt: new Date().toISOString(),
  };
  submissions.set(submissionId, submission);

  // Step 1: Extract text
  submission.status = 'processing';
  const { text } = await extractText(buffer, mimeType);
  submission.rawText = text;

  // Step 2: Parallel extraction (heuristic + LLM)
  const [heuristicResult, llmResult] = await Promise.all([
    Promise.resolve(extractHeuristic(text)),
    extractWithLlm(text),
  ]);

  // Step 3: Merge and normalize
  const merged = mergeExtractions(llmResult, heuristicResult);

  // Apply user-provided ZIP if extraction missed it
  if (userZip && (!merged.zipCode || merged.zipCode === '00000')) {
    merged.zipCode = userZip;
  }

  const normalized = normalize(merged);

  // Step 4: Validate and optionally store in KB
  const validation = validateForKnowledgeBase(normalized);
  if (validation.passed) {
    storeRawQuote(normalized, 'user', 'extracted');
  }

  // Step 5: Analyze
  const analysis = await analyzeQuote(normalized, submissionId);

  // Store result
  submission.status = 'processed';
  submission.analysisResult = analysis;

  return analysis;
}

export async function recomputeQuote(
  submissionId: string,
  corrections: Record<string, unknown>
): Promise<AnalysisResult> {
  const submission = submissions.get(submissionId);
  if (!submission || !submission.analysisResult) {
    throw new Error('Submission not found or not yet processed');
  }

  const existing = submission.analysisResult.extractedData;

  // Apply corrections over existing extracted data
  const corrected = {
    ...existing,
    ...corrections,
  };

  // Re-normalize with corrections
  const normalized = normalize({
    contractorName: corrected.contractorName as string | null,
    quotedTotal: submission.analysisResult.quotedTotal,
    jobType: corrected.jobType as string,
    systemType: corrected.systemType as string,
    equipmentBrand: corrected.equipmentBrand as string | null,
    seer2: corrected.seer2 as number | null,
    tonnage: corrected.tonnage as number | null,
    qualityTierHint: corrected.qualityTier as string | null,
    zipCode: corrected.zipCode as string,
    warrantyYears: corrected.warrantyYears as number | null,
    permitsIncluded: corrected.permitsIncluded as boolean,
    ductworkIncluded: corrected.ductworkIncluded as boolean,
    electricalIncluded: corrected.electricalIncluded as boolean,
    lineItems: corrected.lineItems as Array<{ category: string; description: string; amount: number }>,
    confidence: 0.9, // User corrections are high confidence
  });

  // Validate and store corrected version
  const validation = validateForKnowledgeBase(normalized);
  if (validation.passed) {
    storeRawQuote(normalized, 'user', 'user_verified');
  }

  // Re-analyze
  const analysis = await analyzeQuote(normalized, submissionId);
  submission.analysisResult = analysis;

  return analysis;
}
```

- [ ] **Step 2: Commit**

```bash
git add server/lib/pipeline.ts
git commit -m "feat: add quote processing pipeline with in-memory submission store"
```

---

### Task 12: API Routes — Quotes

**Files:**
- Create: `server/routes/quotes.ts`
- Modify: `server/index.ts`

- [ ] **Step 1: Create server/routes/quotes.ts**

```typescript
import { Router } from 'express';
import multer from 'multer';
import { processQuote, recomputeQuote, getSubmission } from '../lib/pipeline.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

const router = Router();

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const userZip = req.body?.userZip as string | undefined;
    const result = await processQuote(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      userZip
    );

    // Strip paidInsights if not paid
    const response = { ...result };
    if (response.paidInsights) {
      const sub = getSubmission(result.submissionId);
      if (!sub?.paid) {
        response.paidInsights = null;
      }
    }

    res.status(201).json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing failed';
    if (message.includes('no extractable text') || message.includes('no readable text')) {
      res.status(422).json({ error: message });
    } else {
      console.error('Upload processing error:', err);
      res.status(500).json({ error: message });
    }
  }
});

router.get('/:id', (req, res) => {
  const submission = getSubmission(req.params.id);
  if (!submission || !submission.analysisResult) {
    res.status(404).json({ error: 'Quote not found or not yet processed' });
    return;
  }

  const response = { ...submission.analysisResult };
  if (response.paidInsights && !submission.paid) {
    response.paidInsights = null;
  }

  res.json(response);
});

router.post('/:id/recompute', async (req, res) => {
  try {
    const result = await recomputeQuote(req.params.id, req.body);

    const response = { ...result };
    const sub = getSubmission(req.params.id);
    if (response.paidInsights && !sub?.paid) {
      response.paidInsights = null;
    }

    res.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recompute failed';
    res.status(400).json({ error: message });
  }
});

export default router;
```

- [ ] **Step 2: Update server/index.ts to mount routes**

```typescript
import 'dotenv/config';
import express from 'express';
import quotesRouter from './routes/quotes.js';
import { getKbStats } from './lib/knowledgeBase.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5178', 10);

app.use(express.json());

app.use('/api/quotes', quotesRouter);

app.get('/api/health', (_req, res) => {
  const kbStats = getKbStats();
  res.json({
    ok: true,
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
    kb: kbStats,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Verify server starts**

Run: `npm run dev:server`
Expected: "Server running on http://localhost:5178"

- [ ] **Step 4: Commit**

```bash
git add server/routes/quotes.ts server/index.ts
git commit -m "feat: add quote upload, get, and recompute API routes"
```

---

### Task 13: Stripe Payment Routes

**Files:**
- Create: `server/lib/stripe.ts`
- Create: `server/routes/payments.ts`
- Modify: `server/index.ts`

- [ ] **Step 1: Create server/lib/stripe.ts**

```typescript
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID;
}

export async function createCheckoutSession(submissionId: string): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    metadata: { submissionId },
    success_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/result/${submissionId}?paid=true`,
    cancel_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/result/${submissionId}`,
  });

  return session.url!;
}

export function verifyWebhookSignature(payload: Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
}
```

- [ ] **Step 2: Create server/routes/payments.ts**

```typescript
import { Router, raw } from 'express';
import { createCheckoutSession, verifyWebhookSignature, isStripeConfigured } from '../lib/stripe.js';
import { getSubmission, markPaid } from '../lib/pipeline.js';

const router = Router();

router.post('/quotes/:id/unlock', async (req, res) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Payments not configured' });
    return;
  }

  const submission = getSubmission(req.params.id);
  if (!submission || !submission.analysisResult) {
    res.status(404).json({ error: 'Quote not found' });
    return;
  }

  if (submission.analysisResult.rating !== 'High' || submission.analysisResult.savingsPotential < 500) {
    res.status(400).json({ error: 'No paid insights available for this quote' });
    return;
  }

  if (submission.paid) {
    res.json({ alreadyPaid: true });
    return;
  }

  try {
    const checkoutUrl = await createCheckoutSession(req.params.id);
    res.json({ checkoutUrl });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.get('/quotes/:id/insights', (req, res) => {
  const submission = getSubmission(req.params.id);
  if (!submission || !submission.analysisResult) {
    res.status(404).json({ error: 'Quote not found' });
    return;
  }

  if (!submission.analysisResult.paidInsights) {
    res.status(404).json({ error: 'No paid insights for this quote' });
    return;
  }

  if (!submission.paid) {
    res.status(402).json({ error: 'Payment required' });
    return;
  }

  res.json(submission.analysisResult.paidInsights);
});

// Stripe webhook — needs raw body
router.post('/webhooks/stripe', raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    const event = verifyWebhookSignature(req.body, sig);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as { metadata?: { submissionId?: string } };
      const submissionId = session.metadata?.submissionId;
      if (submissionId) {
        markPaid(submissionId);
        console.log(`Payment confirmed for submission ${submissionId}`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

export default router;
```

- [ ] **Step 3: Update server/index.ts to mount payment routes**

Add the import and mount after the quotes router:

```typescript
import paymentsRouter from './routes/payments.js';

// Mount BEFORE express.json() for webhook raw body handling
// Actually, mount the webhook route with raw body parser, rest with json
app.use('/api', paymentsRouter);
```

The full updated `server/index.ts`:

```typescript
import 'dotenv/config';
import express from 'express';
import quotesRouter from './routes/quotes.js';
import paymentsRouter from './routes/payments.js';
import { getKbStats } from './lib/knowledgeBase.js';

const app = express();

// Payment routes go first (webhook needs raw body)
app.use('/api', paymentsRouter);

// JSON parsing for everything else
app.use(express.json());

app.use('/api/quotes', quotesRouter);

const PORT = parseInt(process.env.PORT || '5178', 10);

app.get('/api/health', (_req, res) => {
  const kbStats = getKbStats();
  res.json({
    ok: true,
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
    kb: kbStats,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 4: Commit**

```bash
git add server/lib/stripe.ts server/routes/payments.ts server/index.ts
git commit -m "feat: add Stripe $9 unlock payment flow with webhook"
```

---

### Task 14: KB Recompiler & Admin Route

**Files:**
- Create: `server/lib/recompiler.ts`
- Create: `server/routes/admin.ts`
- Modify: `server/index.ts`

- [ ] **Step 1: Create server/lib/recompiler.ts**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import {
  loadRawQuotes,
  writeCompiledArticle,
  writeIndex,
  writeConfidenceMap,
} from './knowledgeBase.js';
import { SYSTEM_BASELINES, CLIMATE_FACTORS } from '../../data/baselines.js';

const client = new Anthropic();

export async function recompileKnowledgeBase(scope?: {
  climateRegion?: string;
  state?: string;
}): Promise<{ articlesWritten: number }> {
  const allQuotes = loadRawQuotes(scope ? { climateRegion: scope.climateRegion, state: scope.state } : undefined);
  let articlesWritten = 0;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('No ANTHROPIC_API_KEY — skipping LLM recompilation');
    return { articlesWritten: 0 };
  }

  // Group quotes by region
  const byRegion = new Map<string, typeof allQuotes>();
  for (const q of allQuotes) {
    const key = q.climateRegion;
    if (!byRegion.has(key)) byRegion.set(key, []);
    byRegion.get(key)!.push(q);
  }

  // Compile regional articles
  for (const [region, quotes] of byRegion) {
    const article = await generateArticle(
      `Regional Pricing: ${region}`,
      quotes,
      `Analyze HVAC pricing patterns for the ${region} climate region.`
    );
    writeCompiledArticle(`regions/${region}/overview.md`, article);
    articlesWritten++;

    // State-level articles within region
    const byState = new Map<string, typeof allQuotes>();
    for (const q of quotes) {
      if (!byState.has(q.state)) byState.set(q.state, []);
      byState.get(q.state)!.push(q);
    }

    for (const [state, stateQuotes] of byState) {
      if (stateQuotes.length >= 3) {
        const stateArticle = await generateArticle(
          `State Pricing: ${state}`,
          stateQuotes,
          `Analyze HVAC pricing patterns for ${state}.`
        );
        writeCompiledArticle(`regions/${region}/${state.toLowerCase()}/overview.md`, stateArticle);
        articlesWritten++;
      }
    }
  }

  // Compile system type articles
  const bySystem = new Map<string, typeof allQuotes>();
  for (const q of allQuotes) {
    if (!bySystem.has(q.systemType)) bySystem.set(q.systemType, []);
    bySystem.get(q.systemType)!.push(q);
  }

  for (const [systemType, quotes] of bySystem) {
    const article = await generateArticle(
      `System Type: ${systemType}`,
      quotes,
      `Analyze pricing for ${systemType} HVAC systems.`
    );
    writeCompiledArticle(`system-types/${systemType.replace(/_/g, '-')}.md`, article);
    articlesWritten++;
  }

  // Compile component articles
  const componentData = new Map<string, { amounts: number[]; quotes: number }>();
  for (const q of allQuotes) {
    for (const item of q.lineItems) {
      if (!componentData.has(item.category)) {
        componentData.set(item.category, { amounts: [], quotes: 0 });
      }
      const data = componentData.get(item.category)!;
      data.amounts.push(item.amount);
      data.quotes++;
    }
  }

  for (const [category, data] of componentData) {
    if (data.amounts.length >= 3) {
      const sorted = data.amounts.sort((a, b) => a - b);
      const content = `---
lastCompiled: "${new Date().toISOString()}"
sampleSize: ${data.quotes}
---

# Component Pricing: ${category}

## Summary
Based on ${data.quotes} quotes with ${category} line items.
Range: $${sorted[0].toLocaleString()} - $${sorted[sorted.length - 1].toLocaleString()}
Median: $${sorted[Math.floor(sorted.length / 2)].toLocaleString()}

## Data Points
${sorted.map((a) => `- $${a.toLocaleString()}`).join('\n')}
`;
      writeCompiledArticle(`components/${category}.md`, content);
      articlesWritten++;
    }
  }

  // Update index
  const indexContent = `---
lastCompiled: "${new Date().toISOString()}"
totalQuotes: ${allQuotes.length}
---

# HVAC Price Agent Knowledge Base Index

Total quotes: ${allQuotes.length}
Regions covered: ${[...byRegion.keys()].join(', ')}
System types: ${[...bySystem.keys()].join(', ')}
Date range: ${allQuotes.length > 0 ? allQuotes.sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0].timestamp.slice(0, 10) : 'N/A'} to ${new Date().toISOString().slice(0, 10)}
`;
  writeIndex(indexContent);

  // Update confidence map
  const confidenceLines: string[] = [];
  for (const [region, quotes] of byRegion) {
    const confidence = quotes.length >= 20 ? 'high' : quotes.length >= 5 ? 'medium' : 'low';
    confidenceLines.push(`- ${region}: ${confidence} (${quotes.length} quotes)`);
  }
  writeConfidenceMap(`# Data Confidence Map\n\n${confidenceLines.join('\n')}\n`);

  return { articlesWritten };
}

async function generateArticle(
  title: string,
  quotes: Array<{ quotedTotal: number; qualityTier: string; sizeBand: string; systemType: string; state: string; metro: string | null; source: string }>,
  instruction: string
): Promise<string> {
  const totals = quotes.map((q) => q.quotedTotal).sort((a, b) => a - b);
  const summary = `${quotes.length} quotes, range $${totals[0]?.toLocaleString()} - $${totals[totals.length - 1]?.toLocaleString()}, median $${totals[Math.floor(totals.length / 2)]?.toLocaleString()}`;

  const quoteDetails = quotes.slice(0, 30).map((q) =>
    `$${q.quotedTotal.toLocaleString()} (${q.qualityTier} ${q.sizeBand} ${q.systemType}, ${q.metro ?? q.state}, src:${q.source})`
  ).join('\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0,
      messages: [{
        role: 'user',
        content: `${instruction}

Data: ${summary}

Individual quotes:
${quoteDetails}

Write a concise markdown article with frontmatter (lastCompiled, sampleSize, dataRange), a Summary section with key price ranges, a Detailed Breakdown section with patterns, and a Confidence Notes section. Focus on actionable pricing insights.`,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') return content.text;
  } catch (err) {
    console.warn(`Article generation failed for ${title}:`, err);
  }

  // Fallback: simple statistical article
  return `---
lastCompiled: "${new Date().toISOString()}"
sampleSize: ${quotes.length}
---

# ${title}

## Summary
${summary}

## Confidence Notes
This article was generated from limited data. Accuracy improves with more quotes.
`;
}
```

- [ ] **Step 2: Create server/routes/admin.ts**

```typescript
import { Router } from 'express';
import { recompileKnowledgeBase } from '../lib/recompiler.js';

const router = Router();

router.post('/recompile', async (req, res) => {
  const adminKey = req.headers['x-admin-key'] as string;
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const scope = req.body?.scope as { climateRegion?: string; state?: string } | undefined;
    const result = await recompileKnowledgeBase(scope);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Recompilation error:', err);
    res.status(500).json({ error: 'Recompilation failed' });
  }
});

export default router;
```

- [ ] **Step 3: Update server/index.ts to mount admin routes**

Add import and mount:

```typescript
import adminRouter from './routes/admin.js';
// ... after other route mounts
app.use('/api/admin', adminRouter);
```

- [ ] **Step 4: Commit**

```bash
git add server/lib/recompiler.ts server/routes/admin.ts server/index.ts
git commit -m "feat: add KB recompiler and admin recompile endpoint"
```

---

### Task 15: Seed Knowledge Base Script

**Files:**
- Create: `scripts/seed-knowledge-base.ts`

- [ ] **Step 1: Create scripts/seed-knowledge-base.ts**

This script generates ~100 Tier 2 seed quotes across 20 metros and all system types, then runs KB recompilation to produce Tier 3 compiled articles.

```typescript
import 'dotenv/config';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { storeRawQuote } from '../server/lib/knowledgeBase.js';
import { recompileKnowledgeBase } from '../server/lib/recompiler.js';
import {
  SYSTEM_BASELINES,
  CLIMATE_FACTORS,
  STATE_MULTIPLIERS,
  QUALITY_ADJUSTMENTS,
  SIZE_ADJUSTMENTS,
} from '../data/baselines.js';
import { lookupZip } from '../server/lib/zipLookup.js';

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

  // Ensure KB directories exist
  mkdirSync(join(process.cwd(), 'knowledge', 'raw'), { recursive: true });
  mkdirSync(join(process.cwd(), 'knowledge', 'compiled'), { recursive: true });

  let count = 0;

  for (const zip of SEED_ZIPS) {
    const geo = lookupZip(zip);
    if (!geo) {
      console.warn(`ZIP ${zip} not found in geography data, skipping`);
      continue;
    }

    // Generate 5 quotes per metro (100 total)
    for (let i = 0; i < 5; i++) {
      const systemType = randomElement(SYSTEM_TYPES);
      const qualityTier = randomElement(QUALITY_TIERS);
      const sizeBand = randomElement(SIZE_BANDS);

      const baseline = SYSTEM_BASELINES[systemType];
      const climateFactor = CLIMATE_FACTORS[geo.climateRegion] ?? 1.0;
      const stateFactor = STATE_MULTIPLIERS[geo.state] ?? 1.0;
      const qualityFactor = QUALITY_ADJUSTMENTS[qualityTier];
      const sizeFactor = SIZE_ADJUSTMENTS[sizeBand];

      const fairPrice = baseline * climateFactor * stateFactor * qualityFactor * sizeFactor;
      // Add ±15% random variation to simulate real market spread
      const quotedTotal = randomVariation(fairPrice, 0.15);

      const ductworkIncluded = Math.random() > 0.6;
      const electricalIncluded = Math.random() > 0.7;
      const permitsIncluded = Math.random() > 0.3;

      let ductworkCost = 0;
      let electricalCost = 0;
      let permitCost = 0;
      let equipmentCost = Math.round(quotedTotal * 0.4);
      let laborCost = Math.round(quotedTotal * 0.25);

      if (ductworkIncluded) {
        ductworkCost = randomVariation(2800, 0.2);
      }
      if (electricalIncluded) {
        electricalCost = randomVariation(1400, 0.2);
      }
      if (permitsIncluded) {
        permitCost = randomVariation(500, 0.3);
      }

      const lineItems = [
        { category: 'equipment' as const, description: 'HVAC unit and components', amount: equipmentCost },
        { category: 'labor' as const, description: 'Installation labor', amount: laborCost },
      ];
      if (ductworkIncluded) lineItems.push({ category: 'ductwork' as const, description: 'Ductwork modifications', amount: ductworkCost });
      if (electricalIncluded) lineItems.push({ category: 'electrical' as const, description: 'Electrical work', amount: electricalCost });
      if (permitsIncluded) lineItems.push({ category: 'permit' as const, description: 'Permits and inspections', amount: permitCost });

      const tonnage = sizeBand === 'small' ? 2.0 : sizeBand === 'large' ? 5.0 : 3.0;
      const seer2 = qualityTier === 'premium' ? 20 : qualityTier === 'budget' ? 14 : 16;

      storeRawQuote(
        {
          extractionConfidence: 0.95,
          zipCode: zip,
          latitude: geo.lat,
          longitude: geo.lon,
          state: geo.state,
          metro: geo.metro,
          climateRegion: geo.climateRegion,
          contractorName: null,
          quotedTotal,
          jobType: 'replacement',
          systemType: systemType as any,
          equipmentBrand: null,
          seer2,
          tonnage,
          qualityTier,
          sizeBand,
          lineItems,
          warrantyYears: qualityTier === 'premium' ? 12 : qualityTier === 'budget' ? 5 : 10,
          permitsIncluded,
          ductworkIncluded,
          electricalIncluded,
        },
        'seed',
        'extracted'
      );

      count++;
    }
  }

  console.log(`Created ${count} seed quotes.`);

  // Run recompilation to generate compiled articles
  console.log('Recompiling knowledge base...');
  const result = await recompileKnowledgeBase();
  console.log(`Recompilation complete. ${result.articlesWritten} articles written.`);
}

main().catch(console.error);
```

- [ ] **Step 2: Run the seed script**

Run: `npm run seed`
Expected: "Created 100 seed quotes." followed by "Recompilation complete. N articles written."

- [ ] **Step 3: Verify KB was populated**

Run: `ls knowledge/raw/2026/`
Expected: Directory listing with month folders containing JSON files.

Run: `ls knowledge/compiled/`
Expected: Directories for `regions/`, `system-types/`, `components/`, plus `index.md` and similar.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-knowledge-base.ts
git commit -m "feat: add KB seed script generating 100 quotes across 20 metros"
```

---

### Task 16: Frontend — Utility Functions

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/api.ts`

- [ ] **Step 1: Create src/lib/format.ts**

```typescript
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function titleCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
```

- [ ] **Step 2: Create src/lib/api.ts**

```typescript
import type { AnalysisResult, UserCorrections, PaidInsights } from '../types';

const API_BASE = '/api';

export async function uploadQuote(file: File, userZip?: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (userZip) formData.append('userZip', userZip);

  const res = await fetch(`${API_BASE}/quotes/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function getQuote(id: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/quotes/${id}`);
  if (!res.ok) throw new Error('Quote not found');
  return res.json();
}

export async function recomputeQuote(id: string, corrections: UserCorrections): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/quotes/${id}/recompute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corrections),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Recompute failed' }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function unlockInsights(id: string): Promise<{ checkoutUrl?: string; alreadyPaid?: boolean }> {
  const res = await fetch(`${API_BASE}/quotes/${id}/unlock`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unlock failed' }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function getInsights(id: string): Promise<PaidInsights> {
  const res = await fetch(`${API_BASE}/quotes/${id}/insights`);
  if (!res.ok) {
    if (res.status === 402) throw new Error('Payment required');
    throw new Error('Insights not available');
  }
  return res.json();
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/format.ts src/lib/api.ts
git commit -m "feat: add frontend utility functions and API client"
```

---

### Task 17: Frontend — Components

**Files:**
- Create: `src/components/UploadZone.tsx`
- Create: `src/components/ProcessingSteps.tsx`
- Create: `src/components/RatingBadge.tsx`
- Create: `src/components/FairRangeBar.tsx`
- Create: `src/components/EditableFields.tsx`
- Create: `src/components/ResultsCard.tsx`
- Create: `src/components/PaidInsights.tsx`

- [ ] **Step 1: Create src/components/UploadZone.tsx**

```tsx
import { useCallback, useState } from 'react';

interface Props {
  onFileSelected: (file: File) => void;
  disabled: boolean;
}

export default function UploadZone({ onFileSelected, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="space-y-4">
        <div className="text-4xl">📄</div>
        <div>
          <p className="text-lg font-medium text-gray-900">
            Drop your HVAC quote here
          </p>
          <p className="text-sm text-gray-500 mt-1">
            PDF or photo of your quote — we'll extract everything automatically
          </p>
        </div>
        <label className={`inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
          ${disabled ? '' : 'hover:bg-blue-700 cursor-pointer'}`}>
          Choose File
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleChange}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ProcessingSteps.tsx**

```tsx
const STEPS = [
  'Reading document',
  'Extracting details',
  'Analyzing price',
  'Done',
];

interface Props {
  currentStep: number; // 0-3
}

export default function ProcessingSteps({ currentStep }: Props) {
  return (
    <div className="space-y-3 py-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${i < currentStep ? 'bg-green-500 text-white' :
              i === currentStep ? 'bg-blue-500 text-white animate-pulse' :
              'bg-gray-200 text-gray-500'}`}>
            {i < currentStep ? '✓' : i + 1}
          </div>
          <span className={`text-sm ${i <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/RatingBadge.tsx**

```tsx
interface Props {
  rating: 'Low' | 'Fair' | 'High';
}

const STYLES = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Fair: 'bg-blue-100 text-blue-800 border-blue-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

const LABELS = {
  Low: 'Good Price',
  Fair: 'Fair Price',
  High: 'High Price',
};

export default function RatingBadge({ rating }: Props) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${STYLES[rating]}`}>
      {LABELS[rating]}
    </span>
  );
}
```

- [ ] **Step 4: Create src/components/FairRangeBar.tsx**

```tsx
import { formatMoney } from '../lib/format';

interface Props {
  low: number;
  mid: number;
  high: number;
  quoted: number;
}

export default function FairRangeBar({ low, mid, high, quoted }: Props) {
  const min = Math.min(low * 0.8, quoted * 0.9);
  const max = Math.max(high * 1.2, quoted * 1.1);
  const range = max - min;

  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;
  const quotedPct = Math.min(Math.max(((quoted - min) / range) * 100, 2), 98);

  return (
    <div className="space-y-2">
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        {/* Fair range band */}
        <div
          className="absolute top-0 bottom-0 bg-blue-100 border-x-2 border-blue-300"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        {/* Quoted price marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900"
          style={{ left: `${quotedPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatMoney(low)}</span>
        <span className="font-medium text-gray-700">Fair: {formatMoney(mid)}</span>
        <span>{formatMoney(high)}</span>
      </div>
      <p className="text-center text-sm text-gray-600">
        Your quote: <span className="font-semibold text-gray-900">{formatMoney(quoted)}</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create src/components/EditableFields.tsx**

```tsx
import { useState } from 'react';
import type { ExtractedData, UserCorrections } from '../types';
import { titleCase } from '../lib/format';

interface Props {
  data: ExtractedData;
  onSave: (corrections: UserCorrections) => void;
  saving: boolean;
}

const SYSTEM_TYPES = [
  'central_heat_pump', 'heat_pump_split', 'mini_split',
  'furnace_ac_split', 'ac_only', 'furnace_only', 'package_unit', 'other',
];

export default function EditableFields({ data, onSave, saving }: Props) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    zipCode: data.zipCode,
    systemType: data.systemType,
    tonnage: data.tonnage ?? '',
    seer2: data.seer2 ?? '',
    qualityTier: data.qualityTier,
    permitsIncluded: data.permitsIncluded,
    ductworkIncluded: data.ductworkIncluded,
    electricalIncluded: data.electricalIncluded,
  });

  const handleSave = () => {
    const corrections: UserCorrections = {};
    if (fields.zipCode !== data.zipCode) corrections.zipCode = fields.zipCode;
    if (fields.systemType !== data.systemType) corrections.systemType = fields.systemType;
    if (fields.tonnage !== '' && fields.tonnage !== data.tonnage) corrections.tonnage = Number(fields.tonnage);
    if (fields.seer2 !== '' && fields.seer2 !== data.seer2) corrections.seer2 = Number(fields.seer2);
    if (fields.qualityTier !== data.qualityTier) corrections.qualityTier = fields.qualityTier;
    if (fields.permitsIncluded !== data.permitsIncluded) corrections.permitsIncluded = fields.permitsIncluded;
    if (fields.ductworkIncluded !== data.ductworkIncluded) corrections.ductworkIncluded = fields.ductworkIncluded;
    if (fields.electricalIncluded !== data.electricalIncluded) corrections.electricalIncluded = fields.electricalIncluded;

    if (Object.keys(corrections).length > 0) {
      onSave(corrections);
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Extracted Details</h3>
          <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:text-blue-800">
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">ZIP:</span> {data.zipCode}</div>
          <div><span className="text-gray-500">System:</span> {titleCase(data.systemType)}</div>
          <div><span className="text-gray-500">Brand:</span> {data.equipmentBrand ?? 'Unknown'}</div>
          <div><span className="text-gray-500">Quality:</span> {titleCase(data.qualityTier)}</div>
          <div><span className="text-gray-500">Tonnage:</span> {data.tonnage ?? 'Unknown'}</div>
          <div><span className="text-gray-500">SEER2:</span> {data.seer2 ?? 'Unknown'}</div>
          <div><span className="text-gray-500">Permits:</span> {data.permitsIncluded ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-500">Ductwork:</span> {data.ductworkIncluded ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-500">Electrical:</span> {data.electricalIncluded ? 'Yes' : 'No'}</div>
          {data.contractorName && <div className="col-span-2"><span className="text-gray-500">Contractor:</span> {data.contractorName}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Correct Details</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-gray-500">ZIP Code</span>
          <input type="text" value={fields.zipCode} onChange={(e) => setFields({ ...fields, zipCode: e.target.value })}
            className="block w-full border rounded px-2 py-1" maxLength={5} />
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">System Type</span>
          <select value={fields.systemType} onChange={(e) => setFields({ ...fields, systemType: e.target.value })}
            className="block w-full border rounded px-2 py-1">
            {SYSTEM_TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">Tonnage</span>
          <input type="number" step="0.5" value={fields.tonnage} onChange={(e) => setFields({ ...fields, tonnage: e.target.value ? Number(e.target.value) : '' })}
            className="block w-full border rounded px-2 py-1" />
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">SEER2</span>
          <input type="number" step="0.1" value={fields.seer2} onChange={(e) => setFields({ ...fields, seer2: e.target.value ? Number(e.target.value) : '' })}
            className="block w-full border rounded px-2 py-1" />
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">Quality Tier</span>
          <select value={fields.qualityTier} onChange={(e) => setFields({ ...fields, qualityTier: e.target.value })}
            className="block w-full border rounded px-2 py-1">
            <option value="budget">Budget</option>
            <option value="mid">Mid</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <div className="space-y-2 pt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fields.permitsIncluded} onChange={(e) => setFields({ ...fields, permitsIncluded: e.target.checked })} />
            <span className="text-gray-600">Permits included</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fields.ductworkIncluded} onChange={(e) => setFields({ ...fields, ductworkIncluded: e.target.checked })} />
            <span className="text-gray-600">Ductwork included</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fields.electricalIncluded} onChange={(e) => setFields({ ...fields, electricalIncluded: e.target.checked })} />
            <span className="text-gray-600">Electrical included</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Re-analyzing...' : 'Save & Re-analyze'}
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-2 text-gray-600 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create src/components/ResultsCard.tsx**

```tsx
import type { AnalysisResult, UserCorrections } from '../types';
import RatingBadge from './RatingBadge';
import FairRangeBar from './FairRangeBar';
import EditableFields from './EditableFields';
import { formatMoney } from '../lib/format';

interface Props {
  result: AnalysisResult;
  onCorrections: (corrections: UserCorrections) => void;
  onUnlock: () => void;
  correcting: boolean;
}

export default function ResultsCard({ result, onCorrections, onUnlock, correcting }: Props) {
  const { rating, confidence, quotedTotal, fairRange, savingsPotential, summary, extractedData, dataQuality } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Your quoted price</p>
          <p className="text-3xl font-bold text-gray-900">{formatMoney(quotedTotal)}</p>
        </div>
        <RatingBadge rating={rating} />
      </div>

      {/* Summary */}
      <p className="text-gray-700">{summary}</p>

      {/* Fair Range */}
      <FairRangeBar low={fairRange.low} mid={fairRange.mid} high={fairRange.high} quoted={quotedTotal} />

      {/* Savings CTA */}
      {rating === 'High' && savingsPotential >= 500 && !result.paidInsights && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-semibold">
            You may be overpaying by up to {formatMoney(savingsPotential)}
          </p>
          <button
            onClick={onUnlock}
            className="mt-3 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Unlock detailed savings report — $9
          </button>
        </div>
      )}

      {/* Data Quality */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>Confidence: <span className="font-medium">{confidence}</span></span>
        <span>Sample: <span className="font-medium">{dataQuality.sampleSize} quotes</span></span>
        <span>Precision: <span className="font-medium">{dataQuality.geographyPrecision}</span></span>
      </div>

      {/* Line Items */}
      {extractedData.lineItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Detected Line Items</h3>
          <div className="space-y-1">
            {extractedData.lineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.description}</span>
                <span className="font-medium">{formatMoney(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Fields */}
      <EditableFields data={extractedData} onSave={onCorrections} saving={correcting} />
    </div>
  );
}
```

- [ ] **Step 7: Create src/components/PaidInsights.tsx**

```tsx
import type { PaidInsights as PaidInsightsType } from '../types';
import { formatMoney } from '../lib/format';
import { titleCase } from '../lib/format';

interface Props {
  insights: PaidInsightsType;
}

export default function PaidInsights({ insights }: Props) {
  return (
    <div className="space-y-6 bg-white border-2 border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900">Detailed Savings Report</h3>

      {/* Component Breakdown */}
      {insights.componentBreakdown.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Component Breakdown</h4>
          <div className="space-y-2">
            {insights.componentBreakdown.map((comp, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <span className="font-medium">{titleCase(comp.category)}</span>
                  <span className="text-gray-500 ml-2">
                    (typical: {formatMoney(comp.typicalRange.low)} - {formatMoney(comp.typicalRange.high)})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatMoney(comp.yourCost)}</span>
                  <p className="text-xs text-gray-500">{comp.assessment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparable Quotes */}
      {insights.comparableQuotes && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Local Comparisons</h4>
          <p className="text-sm text-gray-600">{insights.comparableQuotes}</p>
        </div>
      )}

      {/* Negotiation Points */}
      {insights.negotiationPoints.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Negotiation Talking Points</h4>
          <ul className="space-y-1">
            {insights.negotiationPoints.map((point, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-green-600 font-bold">→</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Explanation */}
      {insights.detailedExplanation && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Detailed Analysis</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{insights.detailedExplanation}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/
git commit -m "feat: add all frontend components (upload, results, editable fields, paid insights)"
```

---

### Task 18: Frontend — Main App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace src/App.tsx with full app**

```tsx
import { useState, useCallback } from 'react';
import type { AnalysisResult, UserCorrections, PaidInsights as PaidInsightsType } from './types';
import UploadZone from './components/UploadZone';
import ProcessingSteps from './components/ProcessingSteps';
import ResultsCard from './components/ResultsCard';
import PaidInsights from './components/PaidInsights';
import { uploadQuote, recomputeQuote, unlockInsights, getInsights } from './lib/api';

type Screen = 'upload' | 'processing' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [paidInsightsData, setPaidInsightsData] = useState<PaidInsightsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setScreen('processing');
    setProcessingStep(0);

    try {
      // Simulate step progression
      setProcessingStep(1);
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStep(2);

      const analysis = await uploadQuote(file);

      setProcessingStep(3);
      await new Promise((r) => setTimeout(r, 300));

      setResult(analysis);
      setScreen('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setScreen('upload');
    }
  }, []);

  const handleCorrections = useCallback(async (corrections: UserCorrections) => {
    if (!result) return;
    setCorrecting(true);
    try {
      const updated = await recomputeQuote(result.submissionId, corrections);
      setResult(updated);
      setPaidInsightsData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recompute failed');
    } finally {
      setCorrecting(false);
    }
  }, [result]);

  const handleUnlock = useCallback(async () => {
    if (!result) return;
    try {
      const response = await unlockInsights(result.submissionId);
      if (response.alreadyPaid) {
        const insights = await getInsights(result.submissionId);
        setPaidInsightsData(insights);
      } else if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setScreen('upload');
    setResult(null);
    setPaidInsightsData(null);
    setError(null);
    setProcessingStep(0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HVAC Price Agent</h1>
          <p className="text-gray-500 mt-1">Upload your quote. Get the truth.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline">Dismiss</button>
          </div>
        )}

        {/* Screens */}
        {screen === 'upload' && (
          <UploadZone onFileSelected={handleUpload} disabled={false} />
        )}

        {screen === 'processing' && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-lg font-semibold text-gray-900">Analyzing your quote...</h2>
            <ProcessingSteps currentStep={processingStep} />
          </div>
        )}

        {screen === 'results' && result && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <ResultsCard
                result={result}
                onCorrections={handleCorrections}
                onUnlock={handleUnlock}
                correcting={correcting}
              />
            </div>

            {paidInsightsData && (
              <PaidInsights insights={paidInsightsData} />
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Analyze another quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the full app compiles**

Run: `npm run dev:client`
Expected: Vite dev server starts, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up main App with upload, processing, and results screens"
```

---

### Task 19: Eval Framework — Extraction Evals

**Files:**
- Create: `evals/fixtures/expected/sample-heat-pump.json`
- Create: `evals/extraction.test.ts`

- [ ] **Step 1: Create a sample expected extraction fixture**

```json
{
  "description": "Standard heat pump replacement quote from sample text",
  "inputText": "ABC Heating & Cooling\n123 Main St, Austin TX 78701\n\nEstimate for: Heat Pump Replacement\n\nCarrier 25VNA036A003 - 3 Ton 18 SEER2 Heat Pump\nEquipment: $5,200.00\nLabor & Installation: $3,800.00\nDuctwork Modifications: $2,100.00\nElectrical Panel Upgrade: $1,400.00\nPermits & Inspections: $450.00\n\nTotal: $12,950.00\n\n10 Year Warranty Included",
  "expected": {
    "contractorName": "ABC Heating & Cooling",
    "quotedTotal": 12950,
    "jobType": "replacement",
    "systemType": "central_heat_pump",
    "equipmentBrand": "Carrier",
    "seer2": 18,
    "tonnage": 3,
    "zipCode": "78701",
    "warrantyYears": 10,
    "permitsIncluded": true,
    "ductworkIncluded": true,
    "electricalIncluded": true,
    "lineItemCount": 5
  }
}
```

- [ ] **Step 2: Create evals/extraction.test.ts**

```typescript
import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { extractHeuristic } from '../server/lib/heuristicExtraction.js';
import { extractWithLlm } from '../server/lib/llmExtraction.js';
import { mergeExtractions } from '../server/lib/normalization.js';

const FIXTURES_DIR = join(process.cwd(), 'evals', 'fixtures', 'expected');

interface Fixture {
  description: string;
  inputText: string;
  expected: {
    contractorName?: string | null;
    quotedTotal: number;
    jobType?: string;
    systemType?: string;
    equipmentBrand?: string | null;
    seer2?: number | null;
    tonnage?: number | null;
    zipCode?: string;
    warrantyYears?: number | null;
    permitsIncluded?: boolean;
    ductworkIncluded?: boolean;
    electricalIncluded?: boolean;
    lineItemCount?: number;
  };
}

async function runExtractionEvals() {
  const files = readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.json'));
  let passed = 0;
  let failed = 0;
  const results: Array<{ fixture: string; passed: boolean; failures: string[] }> = [];

  for (const file of files) {
    const fixture: Fixture = JSON.parse(readFileSync(join(FIXTURES_DIR, file), 'utf-8'));
    const failures: string[] = [];

    // Run heuristic extraction
    const heuristic = extractHeuristic(fixture.inputText);

    // Run LLM extraction (if API key available)
    const llm = await extractWithLlm(fixture.inputText);

    // Merge
    const merged = mergeExtractions(llm, heuristic);

    // Check fields
    const { expected } = fixture;

    if (expected.quotedTotal !== undefined) {
      const diff = Math.abs(merged.quotedTotal - expected.quotedTotal) / expected.quotedTotal;
      if (diff > 0.05) failures.push(`quotedTotal: got ${merged.quotedTotal}, expected ${expected.quotedTotal} (${(diff * 100).toFixed(1)}% off)`);
    }

    if (expected.jobType !== undefined && merged.jobType !== expected.jobType) {
      failures.push(`jobType: got "${merged.jobType}", expected "${expected.jobType}"`);
    }

    if (expected.systemType !== undefined && merged.systemType !== expected.systemType) {
      failures.push(`systemType: got "${merged.systemType}", expected "${expected.systemType}"`);
    }

    if (expected.equipmentBrand !== undefined) {
      const gotBrand = merged.equipmentBrand?.toLowerCase() ?? null;
      const expectBrand = expected.equipmentBrand?.toLowerCase() ?? null;
      if (gotBrand !== expectBrand) {
        failures.push(`equipmentBrand: got "${merged.equipmentBrand}", expected "${expected.equipmentBrand}"`);
      }
    }

    if (expected.seer2 !== undefined && merged.seer2 !== expected.seer2) {
      failures.push(`seer2: got ${merged.seer2}, expected ${expected.seer2}`);
    }

    if (expected.tonnage !== undefined && merged.tonnage !== expected.tonnage) {
      failures.push(`tonnage: got ${merged.tonnage}, expected ${expected.tonnage}`);
    }

    if (expected.zipCode !== undefined && merged.zipCode !== expected.zipCode) {
      failures.push(`zipCode: got "${merged.zipCode}", expected "${expected.zipCode}"`);
    }

    if (expected.permitsIncluded !== undefined && merged.permitsIncluded !== expected.permitsIncluded) {
      failures.push(`permitsIncluded: got ${merged.permitsIncluded}, expected ${expected.permitsIncluded}`);
    }

    if (expected.ductworkIncluded !== undefined && merged.ductworkIncluded !== expected.ductworkIncluded) {
      failures.push(`ductworkIncluded: got ${merged.ductworkIncluded}, expected ${expected.ductworkIncluded}`);
    }

    if (expected.electricalIncluded !== undefined && merged.electricalIncluded !== expected.electricalIncluded) {
      failures.push(`electricalIncluded: got ${merged.electricalIncluded}, expected ${expected.electricalIncluded}`);
    }

    if (expected.lineItemCount !== undefined && merged.lineItems.length !== expected.lineItemCount) {
      failures.push(`lineItemCount: got ${merged.lineItems.length}, expected ${expected.lineItemCount}`);
    }

    const pass = failures.length === 0;
    if (pass) passed++;
    else failed++;

    results.push({ fixture: file, passed: pass, failures });
    console.log(`${pass ? '✓' : '✗'} ${fixture.description}`);
    for (const f of failures) console.log(`  - ${f}`);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${files.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runExtractionEvals().catch(console.error);
```

- [ ] **Step 3: Run extraction evals**

Run: `npm run eval:extraction`
Expected: "✓ Standard heat pump replacement quote from sample text" and "Results: 1 passed, 0 failed"

- [ ] **Step 4: Commit**

```bash
git add evals/
git commit -m "feat: add extraction eval framework with sample fixture"
```

---

### Task 20: Eval Framework — Validation Gate Evals

**Files:**
- Create: `evals/validation.test.ts`

- [ ] **Step 1: Create evals/validation.test.ts**

```typescript
import 'dotenv/config';
import { validateForKnowledgeBase } from '../server/lib/validation.js';

interface TestCase {
  description: string;
  shouldPass: boolean;
  quote: Parameters<typeof validateForKnowledgeBase>[0];
}

const testCases: TestCase[] = [
  {
    description: 'Valid quote passes all gates',
    shouldPass: true,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central',
      contractorName: 'Test HVAC Co',
      quotedTotal: 14000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Carrier',
      seer2: 16,
      tonnage: 3,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [
        { category: 'equipment', description: 'Heat pump unit', amount: 5200 },
        { category: 'labor', description: 'Installation', amount: 3800 },
      ],
      warrantyYears: 10,
      permitsIncluded: true,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Low confidence rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.3,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central',
      contractorName: null,
      quotedTotal: 14000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Absurdly high price rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.9,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central',
      contractorName: 'Scam Corp',
      quotedTotal: 150000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Missing ZIP rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '00000',
      latitude: 0,
      longitude: 0,
      state: 'US',
      metro: null,
      climateRegion: 'midwest',
      contractorName: null,
      quotedTotal: 12000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Unknown system type rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central',
      contractorName: null,
      quotedTotal: 12000,
      jobType: 'replacement',
      systemType: 'other',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Zero total rejected',
    shouldPass: false,
    quote: {
      extractionConfidence: 0.8,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central',
      contractorName: null,
      quotedTotal: 0,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: null,
      seer2: null,
      tonnage: null,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: null,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
];

function runValidationEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = validateForKnowledgeBase(tc.quote);
    const actualPass = result.passed;
    const correct = actualPass === tc.shouldPass;

    if (correct) {
      passed++;
      console.log(`✓ ${tc.description}`);
    } else {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  Expected ${tc.shouldPass ? 'PASS' : 'FAIL'}, got ${actualPass ? 'PASS' : 'FAIL'}`);
      if (result.failures.length) {
        for (const f of result.failures) console.log(`  - ${f}`);
      }
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runValidationEvals();
```

- [ ] **Step 2: Run validation evals**

Run: `npm run eval:gates`
Expected: All 6 test cases pass.

- [ ] **Step 3: Commit**

```bash
git add evals/validation.test.ts
git commit -m "feat: add validation gate evals with 6 test cases"
```

---

### Task 21: Eval Framework — Analysis Evals

**Files:**
- Create: `evals/analysis.test.ts`

- [ ] **Step 1: Create evals/analysis.test.ts**

```typescript
import 'dotenv/config';
import { analyzeQuote } from '../server/lib/analyzer.js';

interface TestCase {
  description: string;
  expectedRating: 'Low' | 'Fair' | 'High';
  quote: Parameters<typeof analyzeQuote>[0];
}

const testCases: TestCase[] = [
  {
    description: 'Fair-priced mid-tier heat pump in Austin',
    expectedRating: 'Fair',
    quote: {
      extractionConfidence: 0.85,
      zipCode: '78701',
      latitude: 30.27,
      longitude: -97.74,
      state: 'TX',
      metro: 'Austin',
      climateRegion: 'south_central',
      contractorName: 'Austin HVAC',
      quotedTotal: 13500,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Rheem',
      seer2: 16,
      tonnage: 3,
      qualityTier: 'mid',
      sizeBand: 'medium',
      lineItems: [
        { category: 'equipment', description: 'Heat pump', amount: 5400 },
        { category: 'labor', description: 'Install', amount: 3600 },
      ],
      warrantyYears: 10,
      permitsIncluded: true,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Overpriced budget unit in cheap market',
    expectedRating: 'High',
    quote: {
      extractionConfidence: 0.9,
      zipCode: '77001',
      latitude: 29.75,
      longitude: -95.35,
      state: 'TX',
      metro: 'Houston',
      climateRegion: 'south_central',
      contractorName: 'Houston Air',
      quotedTotal: 22000,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Goodman',
      seer2: 14,
      tonnage: 3,
      qualityTier: 'budget',
      sizeBand: 'medium',
      lineItems: [],
      warrantyYears: 5,
      permitsIncluded: false,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
  {
    description: 'Good deal on premium system',
    expectedRating: 'Low',
    quote: {
      extractionConfidence: 0.9,
      zipCode: '55401',
      latitude: 44.98,
      longitude: -93.27,
      state: 'MN',
      metro: 'Minneapolis',
      climateRegion: 'midwest',
      contractorName: 'North Star HVAC',
      quotedTotal: 10500,
      jobType: 'replacement',
      systemType: 'central_heat_pump',
      equipmentBrand: 'Carrier',
      seer2: 20,
      tonnage: 3,
      qualityTier: 'premium',
      sizeBand: 'medium',
      lineItems: [
        { category: 'equipment', description: 'Carrier heat pump', amount: 6500 },
        { category: 'labor', description: 'Install', amount: 4000 },
      ],
      warrantyYears: 12,
      permitsIncluded: true,
      ductworkIncluded: false,
      electricalIncluded: false,
    },
  },
];

async function runAnalysisEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = await analyzeQuote(tc.quote, `eval-${Date.now()}`);
    const correct = result.rating === tc.expectedRating;

    if (correct) {
      passed++;
      console.log(`✓ ${tc.description} → ${result.rating}`);
    } else {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  Expected ${tc.expectedRating}, got ${result.rating}`);
      console.log(`  Fair range: $${result.fairRange.low} - $${result.fairRange.high}`);
      console.log(`  Summary: ${result.summary}`);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runAnalysisEvals().catch(console.error);
```

- [ ] **Step 2: Run analysis evals**

Run: `npm run eval:analysis`
Expected: All 3 test cases pass (results may vary depending on KB state and Claude API availability — fallback mode should still produce correct ratings).

- [ ] **Step 3: Commit**

```bash
git add evals/analysis.test.ts
git commit -m "feat: add analysis eval framework with 3 test cases"
```

---

### Task 22: Eval Framework — End-to-End

**Files:**
- Create: `evals/e2e.test.ts`

- [ ] **Step 1: Create evals/e2e.test.ts**

```typescript
import 'dotenv/config';
import { processQuote } from '../server/lib/pipeline.js';

interface TestCase {
  description: string;
  text: string;
  expectedRating: 'Low' | 'Fair' | 'High';
  expectedSystemType: string;
}

const testCases: TestCase[] = [
  {
    description: 'E2E: Full heat pump quote text → Fair rating',
    text: `Cool Air Solutions
456 Oak Ave, Denver CO 80202

HVAC Replacement Estimate

System: Rheem RP17AZ36AJ - 3 Ton 17 SEER2 Heat Pump
Equipment and Materials: $5,600.00
Installation Labor: $3,400.00
Permits: $550.00

Subtotal: $9,550.00
Total Due: $9,550.00

10 Year Parts Warranty
Licensed & Insured - CO License #12345`,
    expectedRating: 'Fair',
    expectedSystemType: 'central_heat_pump',
  },
  {
    description: 'E2E: Overpriced mini split quote → High rating',
    text: `Premium HVAC LLC
789 Palm Dr, Phoenix AZ 85001

Ductless Mini Split Installation

Mitsubishi MZ-FH18NA - 1.5 Ton 20 SEER2
Equipment: $8,500.00
Installation: $5,500.00
Electrical Panel Upgrade: $2,800.00
Permits: $600.00

Grand Total: $17,400.00

12 Year Warranty`,
    expectedRating: 'High',
    expectedSystemType: 'mini_split',
  },
];

async function runE2eEvals() {
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const buffer = Buffer.from(tc.text, 'utf-8');

    try {
      const result = await processQuote(buffer, 'text/plain', 'test.txt');

      const ratingCorrect = result.rating === tc.expectedRating;
      const systemCorrect = result.extractedData.systemType === tc.expectedSystemType;
      const correct = ratingCorrect && systemCorrect;

      if (correct) {
        passed++;
        console.log(`✓ ${tc.description}`);
      } else {
        failed++;
        console.log(`✗ ${tc.description}`);
        if (!ratingCorrect) console.log(`  Rating: got ${result.rating}, expected ${tc.expectedRating}`);
        if (!systemCorrect) console.log(`  System: got ${result.extractedData.systemType}, expected ${tc.expectedSystemType}`);
      }
    } catch (err) {
      failed++;
      console.log(`✗ ${tc.description}`);
      console.log(`  Error: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runE2eEvals().catch(console.error);
```

Note: The E2E test passes plain text as `text/plain` — the extraction module needs a small update to handle this. Add a text/plain case to `server/lib/extraction.ts`:

```typescript
// Add at the beginning of extractText:
if (mimeType === 'text/plain') {
  const text = buffer.toString('utf-8').trim();
  if (!text) throw new Error('Empty text document');
  return { text, method: 'pdf' as const };
}
```

- [ ] **Step 2: Update extraction.ts to handle text/plain**

Add the text/plain handler before the PDF check in `server/lib/extraction.ts`.

- [ ] **Step 3: Run E2E evals**

Run: `npm run eval:e2e`
Expected: Both test cases pass.

- [ ] **Step 4: Commit**

```bash
git add evals/e2e.test.ts server/lib/extraction.ts
git commit -m "feat: add end-to-end eval framework with 2 test cases"
```

---

### Task 23: Integration Test & Final Verification

- [ ] **Step 1: Start the full dev server**

Run: `npm run dev`
Expected: Both Vite and Express start without errors.

- [ ] **Step 2: Verify health endpoint**

Run: `curl http://localhost:5178/api/health`
Expected: JSON with `ok: true` and KB stats.

- [ ] **Step 3: Verify frontend loads**

Open `http://localhost:5173` in browser.
Expected: "HVAC Price Agent" header with upload zone.

- [ ] **Step 4: Test upload flow with a text quote**

```bash
echo 'Test HVAC Co\n123 Main St, Austin TX 78701\n\nHeat Pump Replacement\nCarrier 3 Ton 16 SEER2\nTotal: $13,500.00' > /tmp/test-quote.txt
curl -X POST http://localhost:5178/api/quotes/upload \
  -F "file=@/tmp/test-quote.txt;type=text/plain"
```
Expected: JSON response with `rating`, `fairRange`, `summary`, etc.

- [ ] **Step 5: Run all evals**

```bash
npm run eval:extraction && npm run eval:gates && npm run eval:analysis && npm run eval:e2e
```
Expected: All evals pass.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: HVAC Price Agent MVP — complete pipeline, KB, evals, and frontend"
```
