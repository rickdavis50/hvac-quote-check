# HVAC Price Agent — Design Specification

## Vision

An autonomous pricing transparency agent for HVAC heat pump installations. Users upload a quote, the agent analyzes it against a growing knowledge base of real pricing data, and tells them whether they're getting a fair deal. When the agent detects overpaying ($500+), users pay $9 to unlock specific savings breakdowns and negotiation guidance.

The goal: do for home improvement quotes what online car pricing did for consumers negotiating against dealers. True transparency protects consumers.

## Architecture Overview

Three-layer system: web interface → API server → knowledge base.

```
┌─────────────────────────────────────────────────────────┐
│  Web Interface (React + Vite + Tailwind)                │
│  Upload quote → See rating → Correct fields → Pay $9    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────┐
│  API Server (Express + TypeScript)                       │
│  Routes: upload, analyze, recompute, unlock, health      │
│  Pipeline: extract → validate → analyze → store          │
└──────┬──────────────┬──────────────────┬────────────────┘
       │              │                  │
┌──────▼─────┐ ┌──────▼──────┐ ┌────────▼───────┐
│  Claude API │ │ Knowledge   │ │ Stripe         │
│  (Extract + │ │ Base        │ │ ($9 checkout)  │
│   Analyze)  │ │ (files)     │ │                │
└────────────┘ └─────────────┘ └────────────────┘
```

## Knowledge Base Structure

File-based, LLM-maintained. The agent reads and writes this — humans rarely touch it directly.

```
knowledge/
  raw/                              # Every validated quote as JSON
    2026/04/
      03-{uuid}.json                # Dated, unique per quote

  compiled/                         # LLM-generated analysis articles
    national/
      baselines.md                  # National pricing by system type
      component-ranges.md           # Per-component typical ranges
    regions/
      {climate-region}/
        overview.md                 # Regional pricing patterns
        {state}/
          overview.md               # State-level patterns
          {metro}.md                # Metro-level (when enough data)
    system-types/
      central-heat-pump.md          # Deep dive per system type
      mini-split.md
      heat-pump-split.md
      (etc.)
    components/
      ductwork.md                   # Component-level pricing knowledge
      electrical.md
      labor.md
      permits.md
      equipment.md
    trends/
      seasonal.md                   # Seasonal pricing patterns
      brand-premiums.md             # Brand-to-brand comparisons

  index.md                          # Master index with summary stats
  confidence-map.md                 # Where we have strong vs weak data
```

### Raw Quote Schema

Each file in `raw/` is a JSON object:

```typescript
interface RawQuote {
  id: string                        // UUID
  timestamp: string                 // ISO 8601
  source: 'user' | 'seed'          // How it entered the system
  trust: 'extracted' | 'user_verified'  // User corrections = higher trust
  extractionConfidence: number      // 0-1

  // Location
  zipCode: string
  latitude: number
  longitude: number
  state: string
  metro: string | null
  climateRegion: string

  // Quote details
  contractorName: string | null
  quotedTotal: number
  jobType: 'new_install' | 'replacement' | 'repair' | 'maintenance'
  systemType: 'central_heat_pump' | 'heat_pump_split' | 'mini_split' | 'furnace_ac_split' | 'ac_only' | 'furnace_only' | 'package_unit' | 'other'

  // Equipment
  equipmentBrand: string | null
  seer2: number | null
  tonnage: number | null
  qualityTier: 'budget' | 'mid' | 'premium'
  sizeBand: 'small' | 'medium' | 'large'

  // Components
  lineItems: Array<{
    category: 'equipment' | 'labor' | 'ductwork' | 'electrical' | 'permit' | 'other'
    description: string
    amount: number
  }>

  // Flags
  warrantyYears: number | null
  permitsIncluded: boolean
  ductworkIncluded: boolean
  electricalIncluded: boolean
}
```

### Compiled Article Format

Each `.md` file in `compiled/` follows this structure:

```markdown
---
lastCompiled: "2026-04-03T12:00:00Z"
sampleSize: 47
dataRange: "2026-01-15 to 2026-04-03"
---

# {Topic Title}

## Summary
{2-3 sentence overview with key price ranges}

## Detailed Breakdown
{Structured pricing data, patterns, notable findings}

## Confidence Notes
{What we're confident about, where data is thin}
```

## Seed Data Strategy

The agent must be useful on day one. Three tiers of seed data:

### Tier 1: Hardcoded Baselines (ships with the app)

National averages by system type:
| System Type | Baseline |
|-------------|----------|
| central_heat_pump | $13,250 |
| heat_pump_split | $14,900 |
| mini_split | $11,900 |
| furnace_ac_split | $11,800 |
| ac_only | $8,200 |
| furnace_only | $7,600 |
| package_unit | $14,500 |

Component typical ranges:
| Component | Low | Mid | High |
|-----------|-----|-----|------|
| Equipment (unit) | $3,500 | $5,800 | $9,500 |
| Labor | $2,000 | $3,500 | $6,000 |
| Ductwork | $1,500 | $2,800 | $4,500 |
| Electrical | $800 | $1,400 | $2,200 |
| Permits | $200 | $500 | $1,200 |

Climate zone adjustment factors (applied to national baselines):
| Zone | Factor | Rationale |
|------|--------|-----------|
| northeast | 1.08 | Higher labor costs, heating demand |
| southeast | 0.97 | Moderate costs, high competition |
| midwest | 0.95 | Lower cost of living |
| south_central | 0.96 | Moderate market |
| mid_atlantic | 1.06 | Higher labor, urban density |
| mountain | 1.02 | Moderate, some remote premium |
| desert | 1.05 | Cooling demand premium |
| west_coast | 1.15 | High cost of living, labor |
| northwest | 1.04 | Moderate-high labor |

State-level cost multipliers (50 states, derived from BLS regional price parities).

Brand tier classifications:
- Premium: Carrier, Trane, Lennox, Daikin, Mitsubishi, Bosch
- Mid: Rheem, Ruud, York, Amana, Bryant, Heil
- Budget: Goodman, Payne, AirQuest

Quality tier adjustments: premium +14%, budget -8%.
Size band adjustments: large (>4 ton) +18%, small (<2.5 ton) -10%.

### Tier 2: Curated Seed Quotes (~100 JSON files)

Synthetic but realistic quotes sourced from public pricing data (HomeAdvisor ranges, DOE data, manufacturer MSRPs). Distributed across:
- 20 major metros (NYC, LA, Chicago, Houston, Phoenix, etc.)
- All 7 system types
- Mix of quality tiers and sizes
- Marked as `source: "seed"` — weighted lower than real user quotes in analysis

### Tier 3: Compiled Knowledge Articles

Generated once at build time from Tier 1 + Tier 2 data. The LLM reads the seed data and produces the initial `compiled/` articles. These are the starting point that real data enriches over time.

## Quote Processing Pipeline

### Step 1: File Upload & Text Extraction

Accepted formats:
- PDF → `pdf-parse` library for text extraction
- Images (PNG, JPG, JPEG) → Tesseract.js OCR
- Max file size: 50MB

### Step 2: LLM Extraction (Claude)

Single Claude API call with structured output. The prompt provides the raw text and asks for the `RawQuote` schema fields. Temperature = 0 for deterministic extraction. Zod validates the response.

Heuristic extraction runs in parallel as fallback:
- Regex patterns for dollar amounts, brand names, model numbers, tonnage, SEER ratings
- ZIP code detection
- Line item parsing by currency pattern matching

Merge strategy: LLM fields take priority where available, heuristic fills gaps.

### Step 3: Normalization

From extracted data, infer:
- **Quality tier** from brand name or SEER2 rating (≥18 = premium, ≤14 = budget)
- **Size band** from tonnage (≤2.5 = small, 2.5-4.0 = medium, >4.0 = large)
- **Geography** from ZIP code → lat/lon, state, metro, climate region (bundled JSON lookup)

### Step 4: Validation Gates

Five gates determine whether the quote enters the knowledge base:

1. **Extraction confidence ≥ 0.6** — LLM self-reports confidence score
2. **Range sanity** — total between $2,000-$80,000; individual components within 3x of typical range
3. **Completeness** — must have: quoted total, system type, ZIP code
4. **Duplicate detection** — same contractor name + total within ±5% + same ZIP within 7 days = duplicate
5. **User corrections** — when user corrects fields and re-analyzes, the corrected version enters KB with `trust: "user_verified"`, replacing the original extraction

Quotes that fail validation are still analyzed (user gets their result) but do not enter the KB.

### Step 5: Knowledge Base Query

The LLM reads relevant knowledge files to build context for analysis:
1. `compiled/index.md` — overall data landscape
2. `compiled/confidence-map.md` — how strong is data for this region
3. Regional article for the user's climate region and state
4. Metro article if it exists
5. System type article matching the quote
6. Component articles for any line items found
7. Count of raw quotes matching the region/system (for sample size reporting)

This context is assembled into a single prompt along with the extracted quote data.

### Step 6: LLM Analysis (Claude)

Second Claude API call. Given the quote data and knowledge base context, the LLM produces:

```typescript
interface AnalysisResult {
  rating: 'Low' | 'Fair' | 'High'
  confidence: 'high' | 'medium' | 'low'
  quotedTotal: number
  fairRange: { low: number; mid: number; high: number }
  savingsPotential: number              // 0 if Fair or Low

  // Free tier
  summary: string                       // 2-3 sentence plain language assessment
  extractedData: {                      // What we found in the quote
    contractorName: string | null
    jobType: string
    systemType: string
    equipmentBrand: string | null
    seer2: number | null
    tonnage: number | null
    qualityTier: string
    sizeBand: string
    zipCode: string
    warrantyYears: number | null
    permitsIncluded: boolean
    ductworkIncluded: boolean
    electricalIncluded: boolean
    lineItems: Array<{ category: string; description: string; amount: number }>
  }
  dataQuality: {
    sampleSize: number                  // How many comparable quotes in KB
    geographyPrecision: string          // "zip" | "metro" | "state" | "regional" | "national"
    dataRecency: string                 // "recent" | "moderate" | "limited"
  }

  // Paid tier (only populated when rating=High and savingsPotential >= 500)
  paidInsights: {
    componentBreakdown: Array<{
      category: string
      yourCost: number
      typicalRange: { low: number; high: number }
      assessment: string
    }>
    comparableQuotes: string            // Summary of similar local quotes
    negotiationPoints: string[]         // Specific talking points
    detailedExplanation: string         // Deep analysis
  } | null
}
```

### Step 7: Store & Respond

- If quote passes validation → write to `knowledge/raw/{date}-{uuid}.json`
- Check if recompilation threshold is met (10 new quotes in region or 50 nationally)
- Return `AnalysisResult` to frontend
- If `paidInsights` exists, the `paidInsights` field is stripped from the response until payment

## Knowledge Base Recompilation

Triggered when thresholds are met (not on every request):

- **10 new validated quotes in a region** → recompile that region's articles
- **50 new quotes nationally** → recompile national baselines and index
- **Manual trigger** via `POST /api/admin/recompile`

Recompilation process:
1. Read all raw quotes matching the scope
2. Claude generates updated compiled articles with current data
3. Update `index.md` and `confidence-map.md`
4. Log the recompilation event

## Monetization: The $9 Unlock

**Trigger:** Rating is "High" AND `savingsPotential >= 500`.

**Free tier always shows:**
- Rating pill (Low / Fair / High)
- Fair price range
- "You may be overpaying by up to $X"
- Extraction summary
- Confidence indicator
- User correction fields

**$9 unlock reveals:**
- Component-level breakdown (which parts are overpriced and by how much)
- Local comparable data summary
- Specific negotiation talking points
- Detailed written analysis

**Payment flow:**
1. Frontend shows "Unlock detailed savings report — $9"
2. Stripe Checkout session created server-side
3. On success, Stripe webhook marks the submission as paid
4. Frontend re-fetches and receives full `paidInsights`

No subscriptions, no accounts. One-time payment per quote analysis.

## API Endpoints

### `POST /api/quotes/upload`
Multipart form: `file` field + optional `userZip` field.
Returns: `AnalysisResult` (with `paidInsights` stripped if unpaid).

### `POST /api/quotes/:id/recompute`
Body: user corrections (zipCode, systemType, tonnage, seer2, etc.).
Re-runs normalization + analysis with corrected data.
If corrections pass validation, updates the KB entry.

### `GET /api/quotes/:id`
Returns stored `AnalysisResult` for a previous submission.

### `POST /api/quotes/:id/unlock`
Creates Stripe Checkout session for $9 payment.
Returns: Stripe checkout URL.

### `POST /api/webhooks/stripe`
Stripe webhook handler. On `checkout.session.completed`, marks submission as paid.

### `GET /api/quotes/:id/insights`
Returns `paidInsights` if payment confirmed. 402 if unpaid. 404 if not High.

### `GET /api/health`
Returns: `{ ok: true, services: { claude: boolean, stripe: boolean }, kb: { totalQuotes: number, lastCompiled: string } }`

### `POST /api/admin/recompile`
Manual trigger for KB recompilation. Protected by admin key.

## Frontend

### Screens

**1. Upload Screen (default)**
- Large drop zone for PDF/image
- "Upload your HVAC quote for a free price check"
- No registration, no forms — just upload

**2. Processing Screen**
- Progress steps: Reading document → Extracting details → Analyzing price → Done
- Brief animation/skeleton while pipeline runs

**3. Results Screen — Free Tier**
- Rating pill: green (Low), blue (Fair), red (High)
- Fair price range bar visualization
- Extracted details card (contractor, system type, brand, tonnage, SEER, etc.)
- Editable fields — user can correct any extracted value and re-analyze
- Confidence indicator with plain-language explanation ("Based on 23 similar installs in your metro area")
- If High by $500+: prominent CTA "You may be overpaying by ~$X — Unlock full report for $9"

**4. Results Screen — Paid Tier**
- Everything from free tier, plus:
- Component breakdown table (your cost vs typical range, with per-component assessment)
- Negotiation talking points section
- Detailed written analysis
- "Download Report" button (PDF generation, later phase)

### No Accounts
No user registration. Quote results are stored server-side by submission ID. The URL contains the ID for bookmarking. Session storage for back/forward navigation within the current session.

## Eval Strategy

### Extraction Evals
- **Test suite:** 20+ quote fixtures (PDFs and images) with known ground truth JSON
- **Metrics:** Per-field accuracy (exact match for enums, ±5% for numbers), overall extraction completeness, confidence calibration
- **Run when:** Extraction prompt changes, Claude model version changes

### Analysis Evals
- **Test suite:** 30+ test cases pairing a quote + KB state with expected rating
- **KB states tested:**
  - Empty KB (cold start — seed data only)
  - Sparse region (5 quotes in state, none in ZIP)
  - Rich region (20+ quotes in metro)
  - Outlier quote (absurdly high or low)
- **Metrics:** Rating accuracy (Low/Fair/High), fair range calibration (actual price falls within range X% of the time), explanation quality (manual review)
- **Run when:** Analysis prompt changes, KB recompilation logic changes

### Validation Gate Evals
- **Test suite:** 15+ cases — known-good quotes that should pass, known-bad quotes that should be rejected (garbage text, absurd prices, duplicates, incomplete data)
- **Metrics:** False positive rate (bad data entering KB), false negative rate (good data rejected)
- **Run when:** Validation logic changes

### End-to-End Evals
- **Test suite:** 10 quotes run through the full pipeline (upload → extract → analyze → rate)
- **Regression:** Any quote that previously got the correct rating must continue to
- **Run when:** Any pipeline component changes

### Eval Infrastructure
- Evals run as a CLI script: `npm run eval:extraction`, `npm run eval:analysis`, `npm run eval:gates`, `npm run eval:e2e`
- Results output as JSON with pass/fail per test case
- CI-friendly exit codes

## File Map

```
├── server/
│   ├── index.ts                    # Express app setup, middleware
│   ├── types.ts                    # All TypeScript interfaces
│   ├── routes/
│   │   ├── quotes.ts               # Upload, recompute, get, unlock, insights
│   │   ├── webhooks.ts             # Stripe webhook handler
│   │   └── admin.ts                # Recompile trigger
│   └── lib/
│       ├── pipeline.ts             # Orchestrates extract → validate → analyze → store
│       ├── extraction.ts           # File text extraction (PDF, image)
│       ├── llmExtraction.ts        # Claude structured extraction
│       ├── heuristicExtraction.ts  # Regex fallback extraction
│       ├── normalization.ts        # Infer quality tier, size band, geography
│       ├── validation.ts           # Five validation gates
│       ├── knowledgeBase.ts        # Read/write/query the KB files
│       ├── analyzer.ts             # Claude analysis call (reads KB, produces rating)
│       ├── recompiler.ts           # KB recompilation logic
│       ├── stripe.ts               # Stripe checkout + webhook handling
│       └── zipLookup.ts            # Bundled ZIP → geography lookup
├── src/
│   ├── App.tsx                     # Main React app
│   ├── main.tsx                    # Entry point
│   ├── types.ts                    # Frontend type definitions
│   ├── components/
│   │   ├── UploadZone.tsx          # File upload drop zone
│   │   ├── ProcessingSteps.tsx     # Progress indicator
│   │   ├── ResultsCard.tsx         # Free tier results display
│   │   ├── PaidInsights.tsx        # Paid tier details
│   │   ├── EditableFields.tsx      # User correction form
│   │   ├── RatingBadge.tsx         # Low/Fair/High pill
│   │   └── FairRangeBar.tsx        # Visual range indicator
│   └── lib/
│       ├── api.ts                  # API client
│       └── format.ts              # Currency formatting, etc.
├── knowledge/
│   ├── raw/                        # Validated quote JSON files
│   ├── compiled/                   # LLM-generated articles
│   ├── index.md                    # Master index
│   └── confidence-map.md           # Data coverage map
├── data/
│   ├── zip-geography.json          # Full US ZIP database (~42k entries)
│   ├── seed-quotes/                # Tier 2 seed quote JSON files
│   └── baselines.ts                # Tier 1 hardcoded constants
├── evals/
│   ├── fixtures/
│   │   ├── quotes/                 # Test quote PDFs and images
│   │   └── expected/               # Expected extraction/analysis results
│   ├── extraction.test.ts          # Extraction eval runner
│   ├── analysis.test.ts            # Analysis eval runner
│   ├── validation.test.ts          # Validation gate eval runner
│   └── e2e.test.ts                 # End-to-end eval runner
├── scripts/
│   ├── seed-knowledge-base.ts      # Generate Tier 2+3 seed data
│   └── recompile.ts                # CLI for manual KB recompilation
├── index.html                      # Vite entry HTML
├── vite.config.ts
├── tsconfig.json
├── tsconfig.server.json
├── tailwind.config.ts
├── package.json
└── .env.example
```

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...        # Claude API
STRIPE_SECRET_KEY=sk_...            # Stripe payments
STRIPE_WEBHOOK_SECRET=whsec_...     # Stripe webhook verification
STRIPE_PRICE_ID=price_...           # $9 price object ID
ADMIN_KEY=...                       # Admin endpoint protection
PORT=5178                           # Server port (default)
```

## Out of Scope (Future)

- PDF report download
- User accounts / quote history across devices
- Contractor directory / referrals
- Background KB linting passes (autonomous self-improvement)
- Mobile app
- A/B testing analysis prompts
- Multi-system quote support (single system per analysis for now)
