# HVAC Quote Check

Free fair-price analysis for US HVAC quotes — heat pumps, AC, furnaces, mini-splits.
Upload a quote (PDF, photo, scanned document) or paste the text; get a deterministic
**Low / Fair / High** rating, a fair price range for your local market, the factor-by-factor
pricing math, and a plain-language summary. When a quote is High by $500+, a $9 unlock
reveals the component breakdown and negotiation scripts.

Built for humans **and** AI agents:

- **Humans** — web app with live progress, shareable result links, correct-and-reanalyze
- **AI agents** — JSON API (`POST /api/quotes/analyze`), MCP endpoint (`POST /api/mcp`,
  tool `analyze_hvac_quote`), `GET /llms.txt`, `GET /api/openapi.json`

## How pricing works

Numbers come from a **deterministic, versioned pricing engine** — never from an LLM:

```
fair mid = national baseline (data/baselines.ts)
         × metro cost index   (data/cbsa-cost-index.ts, 500+ CBSAs)
         × equipment tier     (budget 0.92 / mid 1.00 / premium 1.14)
         × system size        (small 0.90 / medium 1.00 / large 1.18)
         × scope of work      (+10% ductwork, +7% electrical, +3% permits)
         ⤳ blended with the median of real local user quotes when n ≥ 5
fair range = mid × [0.82, 1.22]
```

Every response includes the full factor trace (`pricing.factors`) so people and machines
can audit the answer. The LLM (claude-opus-4-8) does two jobs only: reading messy quote
documents (vision + structured outputs — scanned PDFs work) and writing the prose.

## Quick start

```bash
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY (Stripe keys optional)
npm run dev            # Vite on 5173 + Express API on 5178
```

Without an API key the app still works — heuristic extraction + template summaries.

Try it from the command line:

```bash
curl -X POST localhost:5178/api/quotes/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text":"Goodman 3 ton heat pump replacement, total $14,500", "zipCode":"30301"}'
```

## Evals

```bash
npm run eval:analysis     # engine ratings — hermetic, instant, no key
npm run eval:gates        # validation gates — hermetic
npx tsx evals/localized-pricing.test.ts   # metro pricing sanity — hermetic
npm run eval:extraction   # live LLM extraction accuracy (needs key)
npm run eval:e2e          # full pipeline (needs key)
```

## More

Operating details, API table, file map, and gotchas: see [CLAUDE.md](CLAUDE.md).
Design rationale: `docs/superpowers/specs/2026-06-10-overhaul-people-and-ai-design.md`.
