# HVAC Quote Check — Operating Context

Full-stack React+Vite client + Express/TypeScript server. Upload or paste an HVAC quote,
get a deterministic fair-price assessment for the local US market. Built for humans (web UI)
and AI agents (JSON API, MCP endpoint, llms.txt).

## Core principle

**Numbers from a deterministic engine, words from the LLM.**
`server/lib/pricingEngine.ts` is the single source of truth for rating / fair range / savings
and emits a machine-readable factor trace. The LLM (claude-opus-4-8) only reads documents
(extraction) and writes prose (summary, negotiation points). Never let the LLM produce prices.

## Pipeline

1. Input: file (PDF/PNG/JPEG/WebP/TXT) or raw text (+ optional ZIP)
2. Extraction: pdf-parse for text PDFs; the original document also goes to Claude as a
   document/image block, so **scanned PDFs and photos work** (no OCR library). Structured
   outputs via `messages.parse` + `zodOutputFormat`. Heuristic regex extraction always runs
   as merge partner and no-API-key fallback.
3. Normalize (quality tier, size band, ZIP→geo via `data/zip3-prefix.ts` + `data/cbsa-cost-index.ts`)
4. Validation gates → file-based knowledge base write (`knowledge/raw/YYYY/MM/*.json`)
5. `pricingEngine.ts`: baseline × metro index × tier × size × scope, blended with the median
   of real user quotes (state+system, 180d) when n ≥ 5. Methodology version: see
   `METHODOLOGY_VERSION`.
6. `analyzer.ts`: LLM narrative around the fixed numbers (template fallback without a key)
7. `submissionStore.ts`: one JSON file per submission in `data/submissions/` (gitignored) —
   results, share links, and payment state survive restarts

## Stack

| Component | Tech |
|-----------|------|
| Frontend | React 18 + Vite 5 + TypeScript strict + Tailwind 3 (no router; History API for `/result/:id`) |
| Backend | Express 5 + TypeScript + @anthropic-ai/sdk (structured outputs) |
| AI surface | `@modelcontextprotocol/sdk` (stateless streamable HTTP at `POST /api/mcp`) |
| Persistence | Files: `knowledge/` (benchmark KB) + `data/submissions/` (results) |
| Payments | Stripe Checkout, $9 unlock when rating High by $500+ |

## Entry points

- Client: `src/main.tsx` → `src/App.tsx`
- Server: `server/index.ts` (Express on **API_PORT**, default 5178)
- Build: Vite → `dist/client/`, tsc → `dist/server/`

## Run commands

```bash
npm run dev              # Both (Vite 5173 + Express 5178 concurrently)
npm run dev:client      # Vite only (respects PORT env; defaults 5173)
npm run dev:server      # Express only (5178, tsx watch)
npm run build           # vite build + tsc -p tsconfig.server.json
npm run start           # node dist/server/server/index.js (production)
npm run seed            # seed knowledge base (synthetic, source:'seed')
```

## API surface (also: GET /api/openapi.json, GET /llms.txt)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/quotes/analyze` | multipart `file` OR JSON `{text, zipCode?}`; SSE stages with `Accept: text/event-stream` |
| POST | `/api/quotes/upload` | back-compat alias of analyze |
| GET | `/api/quotes/:id` | stored result (disk-backed) |
| POST | `/api/quotes/:id/recompute` | user corrections → re-price + re-narrate |
| POST | `/api/quotes/:id/unlock` | Stripe Checkout session |
| GET | `/api/quotes/:id/insights` | paid insights (402 until paid) |
| POST | `/api/mcp` | MCP tool `analyze_hvac_quote(quoteText, zipCode?)` |
| GET | `/api/health` | status, model, methodologyVersion, KB stats |

## Key files

| File | Purpose |
|------|---------|
| `server/lib/pricingEngine.ts` | THE pricing math + factor trace (deterministic) |
| `server/lib/pipeline.ts` | orchestration + stage events + `QuoteProcessingError` |
| `server/lib/llmExtraction.ts` | claude-opus-4-8 vision extraction, structured outputs |
| `server/lib/analyzer.ts` | LLM narrative around fixed numbers; paid insights assembly |
| `server/lib/submissionStore.ts` | disk-backed submissions |
| `server/routes/quotes.ts` | analyze (JSON/multipart/SSE), get, recompute |
| `server/routes/mcp.ts` | stateless MCP endpoint |
| `server/routes/meta.ts` | OpenAPI spec |
| `data/baselines.ts` | national medians + tier/size adjustments |
| `data/cbsa-cost-index.ts` | 500+ metro cost indexes |
| `public/llms.txt` | agent-facing usage doc |

## Evals (quality gates)

```bash
npm run eval:analysis    # deterministic engine ratings — hermetic, no API key
tsx evals/localized-pricing.test.ts  # engine fair-mids across metros — hermetic
npm run eval:gates       # validation gate rules — hermetic
npm run eval:extraction  # live LLM extraction accuracy (needs ANTHROPIC_API_KEY)
npm run eval:e2e         # full pipeline (needs key); sets HVAC_DISABLE_KB_WRITES
```

## Testing fixtures

`public/fixtures/quotes/` — the central-heatpump trio is calibrated to Seattle (98109):
`-low.txt` → Low, `-fair.txt` → Fair, `-high.txt` → High (triggers the $9 teaser).

## Gotchas

1. **Never put sampling params (`temperature`) or `budget_tokens` on claude-opus-4-8 calls** — the API rejects them. Use `thinking: {type: 'adaptive'}`.
2. **Evals and tests must set `HVAC_DISABLE_KB_WRITES=1`** (e2e does) or they pollute `knowledge/raw/` and skew future benchmarks. The engine only blends `source:'user'` quotes, so `npm run seed` data never double-counts.
3. **Changing `data/baselines.ts` changes ratings** — re-run `eval:analysis` + `localized-pricing` and recalibrate the fixture trio if needed.
4. Stripe webhook (`checkout.session.completed`) marks paid; in local dev the webhook doesn't fire without `stripe listen` — the `/result/:id?paid=true` return path then shows "payment processing".
5. Vite dev port: 5173 preferred, auto-assigned if busy (`PORT` env respected); Express reads `API_PORT` first so the two never collide.
6. Runtime state (`knowledge/`, `data/submissions/`) is gitignored. In production point `HVAC_SUBMISSIONS_DIR` / `HVAC_KNOWLEDGE_DIR` at a mounted volume so paid reports and accumulated benchmark quotes survive redeploys.
