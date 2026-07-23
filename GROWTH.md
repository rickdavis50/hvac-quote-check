# GROWTH.md — Quote Check

Distribution plan for a free heat-pump pricing-transparency tool (fair-price lookup + quote
gouge-check) that never captures a phone number and monetizes only when it finds a homeowner is
being overcharged. Compiled July 2026 from a sourced channel sweep (see `scratchpad/research-*`).

Every tactic here is **value-first and disclosed** — no sockpuppets, no vote manipulation, no fake
reviews, no hidden affiliation, no feeding users into lead-gen marketplaces. The plan's credibility
*is* the growth engine, so protecting it is strategy, not just compliance.

---

## The one bet

**Weaponize the proprietary price dataset as an owned, compounding "what should this cost?" surface
— programmatic city × system pages — and ignite it with a data-PR launch.**

Rationale: the dataset (real quotes → engine-anchored fair ranges) is the one asset contractors and
lead-gen marketplaces **cannot replicate**. It exactly matches the query the buyer already types
("heat pump cost [city]," "average cost to replace HVAC"), produces **free compounding traffic**
instead of per-click spend, and simultaneously fuels every other channel — it's the credible answer
you paste into a Reddit thread, the story that earns press backlinks, the page ads point to, and the
hook a YouTuber demos. Reddit value-first participation is the fastest **parallel** wedge (highest-
intent audience literally asking your question, at zero CAC), but SEO-plus-data is the bet that keeps
paying after you stop pushing.

---

## Positioning wedge (why we win)

1. **The number comes first.** Every competitor hides price behind a form that ends in a sales call.
   "See the fair price, no phone number" is the whole differentiator — lead with it everywhere.
2. **We don't sell you to contractors.** Thumbtack/Angi monetize *you* as a lead. We don't. That
   contrast is a headline, not a footnote.
3. **We show the math.** The receipt/factor-trace is proof, not marketing. It's what makes the data
   press-worthy and Reddit-upvotable.

---

## Channels, prioritized

### 1. Programmatic SEO — the moat (highest long-term payoff)
- **Build:** one page per `city × system` — "What should a [3-ton heat pump] cost in [Columbus]?" —
  each rendered from the real engine + real local quotes. This is thin-content-proof precisely
  *because* every page carries unique computed data.
- **Doubles as ad landing pages** (see Google Ads below) and as the link you drop in Reddit answers.
- **Effort:** high (build once). **Cost:** low. **Payoff:** compounding. **Risk:** slow (3–6 mo to
  rank) + Google "scaled content" scrutiny → mitigate with genuinely unique data per page, not spun text.
- Instrument each page with the `fair_price_lookup` event already wired.

### 2. Data-PR — the ignition (biggest awareness spike + the backlinks SEO needs)
- **Story:** "Same heat-pump job, $2,000–$70,000 — we have the receipts." You already cite the
  ~21,000-install TECH Clean California spread; package it as a dataset + charts.
- **Pitch:** Canary Media, The Cool Down, local-TV consumer desks, Consumerist-style outlets. These
  aggregate exactly this ("homeowner stunned by $48k quote") already.
- **Why now:** no competitor has your dataset; the numbers are defensible because they come from the
  deterministic engine. **Risk:** one-shot if not serialized — plan a cadence (quarterly "price index").

### 3. Reddit — the fastest parallel wedge (highest-intent, $0 CAC)
The core audience is concentrated and receptive:

| Subreddit | ~Members | Play |
|---|---|---|
| **r/hvacadvice** | ~256k | **Best fit.** Endless "is this quote fair?" threads. Answer them. |
| **r/heatpumps** | ~52k | **Highest intent.** Exactly your buyer, mid-decision. |
| **r/homeowners** | ~3.0M | Big-ticket-repair anxiety. Good fit. |
| r/personalfinance, r/Frugal, r/HomeImprovement | large | Adjacent; "don't overpay on $15k" framing. Strict on promo. |
| City subs (r/Seattle, r/Portland…) | varies | Underrated — pricing is metro-local. Very strict on promo. |
| ~~r/HVAC~~ | ~236k | **Pros, not buyers. Hostile to a gouge-check. Lurk, don't post.** |

**Rules of the road (non-negotiable):**
- **90/10 rule** across your whole account history — ≤10% of activity touches your product. Build
  2–4 weeks of genuine, helpful history *before* linking anything.
- **Disclose you're the founder, every time.** "Full disclosure, I built this, so I'm biased, but…"
  raises trust; hiding it is the fast path to a ban.
- **Answer first, link maybe.** Give the real fair-range reasoning *in the comment*; link the tool
  only when it genuinely adds ("if you want the math on your own numbers, free, no email").
- **Post the dataset as content, not a pitch** ("I analyzed N real heat-pump quotes — here's the
  spread for a 3-ton by metro"). That's a contribution these subs upvote.
- **Earn an AMA** once you have standing: "I have data on N real HVAC quotes — AMA." Coordinate with mods.
- **Never:** multiple accounts, vote rings, identical cross-posted promo, pretending to be a happy
  user. Any one of these is a permanent-suspension pattern and torches the brand's whole premise.

### 4. Google Ads — buy the high-intent moment (test copy + creative here)
Frame: the $29–$77 CPCs you'll read about are what **contractors** pay for **commercial** intent
(they want a booked job). A free tool bidding on **informational** intent competes far less — stay
out of the contractor bloodbath by structuring the account that way.

- **Campaign A — "Fair price" (informational, cheapest, core).** Ad groups: *heat pump cost*,
  *average cost to replace HVAC*, *[brand] heat pump price* (Carrier/Trane/Mitsubishi/Bosch),
  *how much should a 3-ton heat pump cost*. → land on the **ZIP fair-price** surface (or the matching
  programmatic city page).
- **Campaign B — "Is my quote fair?" (highest conversion intent).** Ad groups: *is my HVAC quote too
  high*, *HVAC quote too expensive*, *am I being overcharged HVAC*, *HVAC quote reddit*. → land on the
  **quote-check upload** surface.
- **Campaign C — brand/defensive** (your product name), tiny budget.
- **Exclude** repair/emergency/commercial intent. Heavy negatives: `near me`, `companies`,
  `contractor`, `hiring`, `jobs`, `salary`, `repair`, `installation service`.
- **Settings:** Search-only, exact + phrase. **No** Performance Max / broad match during the test —
  they spray budget onto commercial terms.
- **Budget:** $30–$50/day, split A/B, 3–4 weeks to reach signal.
- **Policy gotchas:** Google's *Dishonest Pricing Practices* update (Oct 28 2025) — present the tool as
  free and the $9 unlock as clearly optional; never imply "free" while hiding a cost. *Unreliable/false
  claims* — no "save $5,000 guaranteed"; phrase as "see if you're overpaying."

#### Ad copy / creative test matrix
Test one angle per ad group with Google's Responsive Search Ads + ad-variation experiments; pin the
sharpest differentiator as a headline.

| # | Angle | Headline to test | Hypothesis |
|---|---|---|---|
| 1 | Relief / instant answer | "See the fair price for your ZIP — before any quote" | Instant-answer beats "get a quote" fatigue |
| 2 | Anti-gouge | "Got an HVAC quote? Find out if you're overpaying." | Names the fear directly → higher CTR on Campaign B |
| 3 | Data / authority | "We analyzed real HVAC quotes. See what yours should cost." | Authority converts the skeptical researcher |
| 4 | Contrast vs lead-gen | "We don't sell your info to contractors. Just the fair price." | The trust wedge is the click |
| 5 | Privacy pin | "Free. No phone number. No email." | The sharpest differentiator vs Angi/Thumbtack landing pages |

On-site, the **A/B framework already shipped** (`src/lib/experiments.ts`) tests the *landing* copy
independently — the live `hero_copy` experiment (villain-framing vs benefit-framing) is the on-site
counterpart to these ad tests. Match a winning ad angle to a matching hero variant.

### 5. Supporting channels

| Channel | Effort | Cost | Payoff | Top risk |
|---|---|---|---|---|
| **YouTube partnerships** — homeowner-education channels (Word of Advice TV ~651k, The DIY HVAC Guy ~300k, Heat Geek). "Paste your real quote into this free tool on camera." | Med | Low–med | Warm, high-trust demos | Pick *homeowner* channels, not contractor/tech channels |
| **Rewiring America + Facebook groups** — electrify-your-home / heat-pump / homeowner groups; their "electric coaches" and contractor-finder are a natural home for the tool | Med | Free | High-intent, pro-electrification, cost-anxious | Group admins ban promo fast — partner org-to-org, don't blast |
| **Nextdoor** — hyperlocal, matches metro pricing | Low–med | Free/ads | 79–81% act on neighbor recs | Respond to "what should this cost?" asks only; no blasting |
| **Share-your-result card** — lightweight referral | Med (build) | Free | Moderate | HVAC is a rare purchase → low repeat frequency; keep it a share card, not a program |
| **Email** | Low | Free | Weak by design (no capture) | Keep strictly opt-in ("email my result / rebate-change alerts"); never gate |

### Dead end (validated, not assumed): Thumbtack / Angi
Both are lead-gen marketplaces that monetize the homeowner by **selling them to pros** ($25–$150+/lead).
Every integration they offer pushes homeowner leads *into* the marketplace — the exact opposite of our
promise. A partnership would create a conflict with the contractors our tool implicitly polices and
cannibalize the trust that is the moat. **Use them only as a messaging contrast** ("unlike lead-gen
sites, we don't sell your info"), never as a channel.

---

## Measurement (backbone already shipped)

GA4 is wired (`src/lib/analytics.ts`) with the full funnel: `page_view`, `fair_price_lookup`,
`quote_submit`, `quote_result` (rating + savings), `unlock_click`, `teardown_enter`, `guide_view`,
plus `experiment_impression` for A/B segmentation.

- **Macro-conversion:** tool completion (`fair_price_lookup` / `quote_result`) — since there's no
  phone/email, this *is* your conversion.
- **North-star:** `unlock_click` → the $9 savings-found purchase. Import it as a Google Ads conversion
  and move to value-based bidding once volume allows.
- **Segment everything by experiment variant** (the user-property is set automatically).
- Activate GA by setting `VITE_GA_MEASUREMENT_ID` (see `.env.example`).

---

## 90-day sequence

**Weeks 1–2 — Credibility + assets**
- Stand up a transparent founder Reddit account; spend this stretch *purely answering* "is my quote
  fair?" posts in r/hvacadvice, r/heatpumps, r/homeowners (build the 90/10 history, no links yet).
- Confirm GA4 is live and the $9-unlock conversion is importing to Google Ads.
- Package the price-spread dataset into a shareable "what a heat pump should cost" data story + charts
  (this one asset feeds SEO, PR, Reddit, and YouTube).

**Weeks 3–6 — Ignite the moat**
- Launch the data-PR story ("$2k–$70k for the same job — the receipts") to Canary Media / The Cool
  Down / local consumer desks. Chase backlinks.
- Ship the first batch of programmatic city × system pages (start the ranking clock; they double as ad
  landing pages).
- Turn on the Google Ads test ($30–$50/day, Campaigns A + B, exact/phrase, heavy negatives). Read
  CPC + conversion signal against the copy matrix.
- Begin now-credible Reddit sharing; pitch one YouTube collab + the Rewiring America community.

**Weeks 7–12 — Double down on what converts**
- Reallocate ad budget to the winning campaign/angle; introduce value-based bidding on the $9 signal.
- Expand programmatic SEO to more metros/systems; interlink with the PR backlinks.
- Run a Reddit AMA once your history + dataset give standing.
- Formalize one YouTube partnership; ship the share-your-result card.

---

## Guardrails
The brand is "we're on your side, and we prove it." Any growth tactic that requires deception (fake
accounts, undisclosed promotion, guaranteed-savings claims, selling users to contractors) is not a
shortcut — it's a self-inflicted wound to the only thing we're selling. When in doubt, disclose.
