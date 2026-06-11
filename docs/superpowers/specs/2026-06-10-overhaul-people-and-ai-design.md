# HVAC Quote Check — Overhaul Design (People + AI)

Date: 2026-06-10
Status: Approved for implementation (Rick granted full design freedom; decisions recorded here)

## Why overhaul now

Audit findings (2026-06-10):

1. **Model retirement (urgent).** All LLM calls use `claude-sonnet-4-20250514`, deprecated and **retired June 15, 2026** — five days after this design. The pipeline's LLM path dies then.
2. **Results are ephemeral.** Submissions live in an in-memory `Map`. Server restart loses every result; Stripe webhooks mark payments on objects that vanish; result links don't survive.
3. **Stripe return flow is broken.** Checkout `success_url` → `/result/:id?paid=true`, but the client has no routing — a paying customer lands on a blank upload screen.
4. **The LLM decides the numbers.** Rating, fair range, and savings come from a freeform LLM completion parsed with a `\{[\s\S]*\}` regex. Nondeterministic, unexplainable, eval-hostile, and the cause of prompt-anchoring hacks ("IMPORTANT: stay close to the statistical range").
5. **Scanned PDFs fail.** `pdf-parse` throws on image-based PDFs; tesseract.js only handles bare images, is huge, and slow.
6. **Processing UI is theater.** Steps advance on `setTimeout`, not on actual pipeline stages.
7. **No text input.** Quotes that arrive in email bodies can't be pasted.
8. **Nothing for AI consumers.** Multipart-only upload, no OpenAPI, no llms.txt, no MCP.
9. **Stale operating docs.** CLAUDE.md describes a Supabase/benchmarkEngine architecture that no longer exists — it actively misleads coding agents.
10. **Eval drift.** `localized-pricing.test.ts` re-implements the pricing formula inline; analysis evals call the live LLM when a key is present (slow, paid, nondeterministic).

What's worth keeping: the pipeline shape (extract → normalize → validate → analyze → store), the CBSA cost index (well-researched, 500+ metros), the file-based knowledge base, the validation gates, the warm visual identity, the $9 unlock model.

## Design principle

**Numbers from a deterministic engine. Words from the LLM. Everything explainable, to humans and machines.**

The rating must be reproducible, auditable, and testable without an API key. The LLM does what only it can do: read messy documents and write clear explanations.

## Architecture

```
input (file | pasted text | JSON)            ── humans use the web app; AI agents use JSON/MCP
   │
   ▼
extraction
   • text/plain → as-is
   • PDF → pdf-parse for raw text; the PDF itself goes to Claude as a document block
     (scanned PDFs therefore work; tesseract.js removed)
   • image → Claude image block
   • LLM: claude-opus-4-8, structured outputs (zodOutputFormat + messages.parse)
   • heuristic regex extraction always runs → merge, and is the no-API-key fallback
   ▼
normalize (quality tier, size band, ZIP→geo)         [unchanged]
   ▼
validation gates → knowledge base write              [unchanged]
   ▼
pricingEngine.ts  ──────────────  DETERMINISTIC SOURCE OF TRUTH
   • fairRange/rating/savings = baseline × metroIndex × quality × size × scope
   • blends median of real user quotes (state+system, 180d) when n ≥ 5,
     weight = min(n/20, 0.5); seed quotes excluded (they derive from the formula)
   • emits factors[]: machine-readable math trace, methodologyVersion
   ▼
analyzer.ts — LLM writes the narrative ONLY
   • summary, negotiation points, per-line-item assessments, comparables text
   • numbers are passed in and fixed; template fallback without a key
   ▼
submissionStore.ts — JSON file per submission (data/submissions/), survives restarts
   ▼
result envelope → web UI | JSON API | MCP tool
```

## API surface (humans + AI)

| Endpoint | Purpose |
|---|---|
| `POST /api/quotes/analyze` | **New.** Accepts multipart file **or** JSON `{text, zipCode?}`. With `Accept: text/event-stream`, streams real stage events then the result. |
| `POST /api/quotes/upload` | Kept as alias (multipart) for compatibility. |
| `GET /api/quotes/:id` | Stored result (now survives restarts). |
| `POST /api/quotes/:id/recompute` | User corrections → re-normalize → re-price → re-narrate. |
| `POST /api/quotes/:id/unlock`, `GET .../insights`, Stripe webhook | Unchanged flow, now backed by persistent store. |
| `GET /api/openapi.json` | OpenAPI 3.1 description of the above. |
| `GET /llms.txt` | Plain-text instructions for AI agents (what this service does, how to call it). |
| `POST /api/mcp` | MCP streamable-HTTP endpoint (stateless) exposing one tool: `analyze_hvac_quote(text, zipCode?)`. Any MCP-capable agent can use the service directly. |
| `GET /api/health` | + methodologyVersion, model, KB stats. |

Result envelope additions (client fields stay backward-compatible):

```ts
pricing: {
  methodologyVersion: string;       // e.g. "2026-06"
  factors: Array<{ label: string; detail: string; multiplier: number }>;
  marketContext: { metroName: string | null; compositeIndex: number; comparableCount: number };
}
generatedAt: string;
```

## Frontend (delightful, honest)

- **Input**: two tabs — *Upload file* / *Paste text* — plus an optional ZIP field (quotes often omit it). No registration, no other fields.
- **Progress**: real SSE stages (Reading document → Extracting details with AI → Pricing against your market → Writing your report). No fake timers.
- **Results**: rating + fair-range bar hero; plain-language summary; **"How we priced this"** expandable table showing the actual factor math (the engine trace — same data AI consumers get); extracted details with correct-and-reanalyze; line items; savings teaser (real component ranges from baselines — no fabricated "Overpriced" verdicts under the blur); copy-link share.
- **Routing**: `/result/:id` via History API (no router lib). Fixes the Stripe return path; results are shareable.
- **Keep** the warm cream/serif identity; tighten hierarchy; no new chrome.

## Evals

- `localized-pricing.test.ts` imports the engine (no duplicated formula).
- `analysis.test.ts` asserts exact deterministic ratings from the engine — no LLM, no key needed.
- `e2e.test.ts` unchanged in spirit; rating assertions are now stable given extraction.
- Extraction eval still exercises the live LLM (requires key).

## Out of scope

PDF report download, accounts, contractor directory, KB recompilation changes, multi-system quotes, real Stripe end-to-end verification (needs webhook delivery; documented as unverified in dev).

## Cleanups

- Remove `tesseract.js`; add `@modelcontextprotocol/sdk`; upgrade `@anthropic-ai/sdk` (0.39 → current) for structured outputs.
- Delete stale `server-dist/` build artifacts (compiled remnants of the pre-migration architecture).
- Rewrite `CLAUDE.md` and `README.md` to match reality (AI-friendliness includes coding agents).
