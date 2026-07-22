# Fair Air (hvac) — Operating Context

Heat-pump pricing-transparency product ("TrueCar for HVAC"): see the fair local price
BEFORE any contractor quote, gouge-check a quote in hand, and learn the machine via a
scroll-driven 3D teardown. Full-stack React 18 + Vite + TS strict + Tailwind 3 client,
Express 5 + TS server, deterministic pricing engine, Claude for reading documents and
writing prose only. Built for humans (web) and AI agents (JSON API, MCP, llms.txt).

## Personal Context

My personal wiki is at ~/Documents/Rickipedia/. Read index.md for who I am and how I work.
Key pages: me/preferences.md, me/working-style.md, me/design-method.md,
me/greenfield-canon.md.

## The design contract

**DESIGN-BRIEF.md is law.** Concept: THE X-RAY — dissect the machine, the market, and the
quote with one gesture; patent-sheet structure × Didone editorial × receipt vernacular.
Load-bearing rules, inlined:

- Numbers from the deterministic engine, words from the LLM. **The LLM never produces
  prices** (`server/lib/pricingEngine.ts` is the only source of dollars).
- Type: Playfair Display (display/numbers) + IBM Plex Mono (labels/data/UI). Tabular nums.
- Palette: paper `#FAF7F2`, ink `#161310`, copper `#B87333` accent; verdict green/red only
  inside rating moments. The teardown chamber is the one dark surface.
- The tool surfaces (fair price, quote check) are instant and never scroll-jacked; the
  story chamber is opt-in, honors `prefers-reduced-motion`, and degrades on mobile.
- No photography, no coupon language, no phone-number capture, no SaaS template layouts.
- Verify visually in a real browser (desktop + mobile) before "done"; ship v1 with real
  data; terse status; React work follows the `react-vite-conventions` skill.

**What good looks like here:** af-site's compositional discipline (not its wardrobe),
Lifespan Dashboard's one-accent restraint, and a felt gate of "they'll just tell me the
number" relief on first load.

## Pipeline (quote check)

1. Input: file (PDF/PNG/JPEG/WebP/TXT) or raw text (+ optional ZIP)
2. Extraction: pdf-parse for text PDFs; original document also goes to Claude as a
   document/image block (scanned PDFs and photos work). Structured outputs via
   `messages.parse` + `zodOutputFormat`. Heuristic regex extraction always runs as merge
   partner and no-API-key fallback.
3. Normalize (tier, size band, ZIP→geo via `data/zip3-prefix.ts` + `data/cbsa-cost-index.ts`)
4. Validation gates → KB write (`knowledge/raw/YYYY/MM/*.json`)
5. `pricingEngine.ts`: baseline × metro index × tier × size × scope, blended with median of
   real user quotes (state+system, 180d) when n ≥ 5. See `METHODOLOGY_VERSION`.
6. `analyzer.ts`: LLM narrative around the fixed numbers (template fallback without a key).
   **Executor/advisor:** both extraction + narrative run on `EXECUTOR_MODEL` (Sonnet 5,
   `server/lib/llmExtraction.ts`) and only escalate to `ADVISOR_MODEL` (Opus 4.8) when
   stuck (extraction: `isStuck` = no total / low confidence; narrative: hard parse fail).
7. `submissionStore.ts`: one JSON per submission in `data/submissions/` (gitignored)

**Fair price (no quote):** `server/lib/fairPrice.ts` → same normalize→price chain with
`quotedTotal: 0` (the engine never reads the total for the fair range). Exposed at
`GET /api/fair-price` and MCP tool `get_fair_price`.

## Entry points & key files

- Client: `src/main.tsx` → `src/App.tsx` (no router; History API via `src/lib/urlState.ts`)
- Server: `server/index.ts` (Express on **API_PORT**, default 5178)
- `server/lib/pricingEngine.ts` — THE pricing math + factor trace (deterministic)
- `server/lib/fairPrice.ts` — quote-free fair range (zip + optional params)
- `server/lib/pipeline.ts` — orchestration + stage events + `QuoteProcessingError`
- `server/routes/{quotes,fairPrice,payments,mcp,meta}.ts` — API surface
- `data/baselines.ts` — national medians + tier/size adjustments (changing it changes
  ratings: re-run evals + recalibrate fixtures)
- `public/llms.txt` — agent-facing usage doc

## API surface (also: GET /api/openapi.json, GET /llms.txt)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/fair-price` | fair range from `zip` (+ systemType, tonnage, qualityTier, ductwork, electrical, permits) — no quote, no LLM |
| POST | `/api/quotes/analyze` | multipart `file` OR JSON `{text, zipCode?}`; SSE stages with `Accept: text/event-stream` |
| GET | `/api/quotes/:id` | stored result |
| POST | `/api/quotes/:id/recompute` | user corrections → re-price + re-narrate |
| POST | `/api/quotes/:id/unlock` | Stripe Checkout ($9, when High by $500+) |
| GET | `/api/quotes/:id/insights` | paid insights (402 until paid) |
| POST | `/api/mcp` | MCP tools: `analyze_hvac_quote`, `get_fair_price` |
| GET | `/api/health` | status, model, methodologyVersion, KB stats |

## Run commands

```bash
npm run dev              # Both (Vite 5173 + Express 5178 concurrently)
npm run build            # vite build + tsc -p tsconfig.server.json
npm run start            # node dist/server/server/index.js (production)
npm run seed             # seed KB (synthetic, source:'seed', never blended)
```

## Evals (quality gates)

```bash
npm run eval:analysis      # engine ratings — hermetic
npm run eval:gates         # validation gates — hermetic
npm run eval:fair-price    # quote-free estimates — hermetic
tsx evals/localized-pricing.test.ts  # metro fair-mids — hermetic
npm run eval:extraction    # live LLM extraction (needs ANTHROPIC_API_KEY)
npm run eval:e2e           # full pipeline (needs key; sets HVAC_DISABLE_KB_WRITES)
```

Fixtures: `public/fixtures/quotes/` — central-heatpump trio calibrated to Seattle 98109
(`-low` → Low, `-fair` → Fair, `-high` → High, triggers the $9 teaser).

## Gotchas

1. **Never put sampling params (`temperature`) or `budget_tokens` on `claude-opus-4-8`
   OR `claude-sonnet-5` calls** — both reject non-default sampling (400). Use
   `thinking: {type: 'adaptive'}`. (Sonnet 5 is the executor; see pipeline step 6.)
2. **Evals/tests must set `HVAC_DISABLE_KB_WRITES=1`** or they pollute `knowledge/raw/`
   (the dev server does NOT set it — delete any fixture entries you create by hand-testing).
3. Changing `data/baselines.ts` changes ratings — re-run eval:analysis + localized-pricing.
4. Stripe webhook marks paid; without `stripe listen` locally the `?paid=true` return shows
   "payment processing".
5. Vite dev port 5173 (auto-assigned if busy; `PORT` env respected); Express reads
   `API_PORT` first.
6. Runtime state (`knowledge/`, `data/submissions/`) is gitignored. Persistence auto-selects:
   set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (+ optional `HVAC_SUBMISSIONS_TABLE`,
   default `submissions`) and the submission store uses Supabase Postgres (Vercel/serverless);
   otherwise it uses `HVAC_SUBMISSIONS_DIR` on disk (Railway/local). `server/app.ts` is the
   Express app; `api/index.js` re-exports it as the Vercel function (`vercel.json`).
7. Three.js stack pinned to React 18 line: `@react-three/fiber@8`, `@react-three/drei@9`,
   `three@0.169`. The teardown lazy-loads (`React.lazy`) so tool surfaces stay fast.
