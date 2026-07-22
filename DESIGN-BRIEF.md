# DESIGN BRIEF — Quote Check (HVAC price transparency)

The contract for every design decision in this repo. A build that contradicts this brief is
off-spec even if it is pretty. Produced by the design method (Phases 0–5 below), fed by a
97-agent research sweep (claims verified adversarially; digest in the 2026-07-12 session).

## Phase 0 — Brief

- **What:** the web experience for the heat-pump pricing-transparency product: fair local
  price before any quote exists, a quote gouge-check, and a scroll-driven 3D teardown that
  explains the machine.
- **For whom:** US homeowners facing a $10k–$30k heat-pump decision, starting from either
  "my furnace died and these quotes feel insane" or "what should a heat pump cost me?"
- **The job:** arm the buyer. Persuade + explain + protect: turn an anxious, information-poor
  buyer into the best-informed person in the room when the contractor arrives.

## Phase 1 — Immersion

### The audience portrait

**Dana, 41, Columbus, Ohio.** Nineteen-year-old furnace, two quotes in hand: $12,400 and
$19,800 for what looks like the same job. She believes contractors price the house, not the
job. She reveres receipts, Consumer Reports, and her Zestimate. She is numb to van-wrap
branding, curated review walls, "free estimate" forms that end in a sales call, and stock
photos of techs in booties. She would screenshot and send to a friend: an actual number with
the math shown. She fears signing at $19k for a $13k job, and half-believes her
brother-in-law's claim that heat pumps die below freezing.

Research grounding: 69% of consumers say they don't know enough about heat pumps; saving
money is the #1 motivation (65%), ahead of climate (49%); 84% of HVAC discovery is mobile;
homeowners eliminate 60% of contractors before ever calling; the HVAC consideration cycle
runs ~90 days; written authoritative education outperforms word-of-mouth.

### The sea of sameness (kill list)

1. **Van-wrap SaaS** — royal blue + orange, smiling tech hero photo, "Your Comfort Is Our
   Business," phone number in a red pill.
2. **The coupon strip** — $79 tune-up, $500 off, "as low as $89/mo" with no principal.
3. **The fake quote form** — "FREE estimate!" → nine fields → "a comfort advisor will call
   you." The price never appears; the form is the product.
4. **The trust-badge wall** — BBB, Angi, factory-authorized logos in place of information.
5. **The green-halo eco site** — leaves, polar bears, "sustainable comfort," no dollar signs.
6. **Gov/utility PDF-brain** — rebate tables in 9pt, acronym soup, zero narrative.
7. **Corporate SaaS default** — gradient glow, hero + three cards + CTA. (Anti-language.)

### The felt job

- **5 seconds:** "Whoa. They'll just tell me the number?" Disbelief tipping into relief.
- **24 hours:** "The site that showed me what the thing actually costs, inside and out. I'm
  not walking in blind again."

## Phase 2 — The tension

**Every HVAC site hides the price behind a phone call, because the business model is your
ignorance. We open with the number and show the math like a receipt.** The design argues
that information asymmetry is the villain, and the cure is showing the machine and the
market both stripped naked.

## Phase 3 — Concepts (three, generated; one survives)

1. **THE X-RAY (Literalism)** — everything the industry sells as a sealed mystery (the
   machine, the market, the quote) is shown split open into labeled parts anyone can
   inspect. Hero moment: the heat pump pulled apart in space as you scroll, each organ named
   and priced, and then the same knife dissects the quote itself. Stops Dana because nobody
   has ever shown her the inside of the thing she is about to pay $19k for.
2. **THE COUNTY RECORD (Monument)** — the fair price as posted civic information, like a
   land record. Killed: authority without education; the concept covers half the product;
   certificate aesthetics slide into parody. Its artifact survives: the shareable,
   date-stamped "posted price" sheet.
3. **THE BACK ROOM (World/Inversion)** — walk into the room where your price gets made and
   watch the contractor's worksheet fill in. Killed: heist theater undermines the civic
   authority that makes a fair-price signal work (the Zestimate effect is uncertainty
   *reduction*), dark-terminal staging repeats the last build's gravity, and it can
   intimidate the anxious mobile buyer. Its mechanism survives: the price assembling
   factor-by-factor before your eyes.

**Winner: THE X-RAY**, carrying the County Record's shareable sheet and the Back Room's
live factor assembly. One continuous gesture: dissect the machine, dissect the market,
dissect your quote.

## Phase 4 — Crit verdicts

- Stranger: machine splayed open with prices pinned to organs reads in five seconds. Pass.
- Rival: the scary move is pointing the diagram language at the money — the unexplained
  $12,000 as a first-class UI object, and the site vowing to never ask for a phone number.
  Pushed in.
- Cliché Hunter: exploded 3D views are Awwwards-common; ours survives because every part
  carries a price and the dissection continues past the machine into the quote. Argument,
  not spectacle.
- Audience's Advocate: respect (real engineering) plus utility (usable numbers). Pass.
- Editor: one gesture spans all three surfaces; nothing extra. Pass.
- Historian: scientific-diagram + patent-drawing language, recombined with live 3D, live
  market data, and consumer-rights heat. Fresh subject for an old language; not pastiche.

## Phase 5 — The language

Hybridization: **structure of the scientific/technical diagram × material of Didone
editorial × the subject's own vernacular (the receipt).** The twist: the receipt — normally
the contractor's tool of obfuscation — is turned around and used to explain; the patent
sheet is aimed at consumer price justice.

- **Type:** Playfair Display for display and hero numbers at extreme scale — because the
  concept treats the truth as the headline, and the price is the headline. IBM Plex Mono for
  labels, annotations, data, and controls — because the concept dissects and labels, and
  mono is the native tongue of receipts and instrument readouts. Tabular numerals always.
- **Palette:** warm technical paper `#FAF7F2` as ground; warm ink `#161310` for type,
  hairlines, and the one dark chamber (the teardown); **copper `#B87333`** as the single
  accent — because copper is the machine's own veins and the color of money-marked lines.
  Verdict colors (muted green / rust red) appear only inside rating moments and are never
  the accent. 60/30/10: paper / ink / copper.
- **Space/grid:** 12-column sheet with a visible hairline frame and a functional title block
  (sheet number, methodology version, date) on major sections — because the concept
  certifies findings like numbered patent drawings. Asymmetric editorial split; a reserved
  annotation rail; leader lines connect labels to parts and line items to verdicts.
- **Imagery/material:** no photography. The machine is rendered — matte dark metal, copper
  lines, hairline callouts — because the concept shows evidence, not advertising. Paper
  grain at the threshold of perception.
- **Motion:** in the dark chamber only: scroll-scrubbed dissection with drafting-table
  easing (no bounce) — because the concept is a controlled dissection, not a product ad.
  Elsewhere, near-stillness; a computed price assembles once, factor by factor. Honor
  `prefers-reduced-motion` with static exploded posters. Tool surfaces are never
  scroll-jacked (research: task-oriented users abandon hijacked scroll; keep CTAs outside).
- **Copy voice:** consumer-rights plain talk, surgically specific, second person, short
  declaratives — because the concept hands the reader the scalpel. Numbers are always
  exact. Banned diction: "comfort," "trusted," "solutions," "unlock," "empower," coupon
  language, hedges. House vows said out loud: "We never ask for your phone number."

## The hero moment

Type a ZIP, get the number. The fair range renders enormous on a certified sheet — and the
digits are set so large they bleed past the sheet's hairline frame. A visitor remembers
tomorrow: "it just told me the number, and showed the math like a receipt."

## The composition plan

- Real 12-col grid; hairline sheet frames; one dominant element per view at ~10:1 —
  the NUMBER on tool surfaces, the MACHINE in the chamber.
- Focal path: claim → number → proof (factors) → next action. Z-pattern on sheets.
- Density rhythm: sparse hero sheet → dense annotation cluster → sparse verdict.
- **The one deliberate transgression:** the hero fair-price digits break the sheet frame —
  every other element respects the hairline border; the truth doesn't fit in their box.
- Mobile-first mandate (84% mobile discovery): the teardown chamber degrades to lightweight
  scrub / static frames; tools stay instant and light (0.1s speed ≈ +21.6% lead-gen
  progression).

## The gates

- **Anti-taste nevers:** no gradient-glow AI slop; no eyebrow kickers (title-block metadata
  must be real, functional data); no Inter-because-safe; no bland statement copy; no crowded
  visuals; no gray-on-gray; no safe SaaS layouts.
- **Generic tells:** no centered-everything, no hero+three-cards, no even margins
  everywhere, body measure ≤ 75ch, real scale contrast (display 80–140px vs 13–16px body).
- **Anti-sameness:** last build was dark editorial-industrial (Didone over mono on black).
  This one inverts the ground: paper-light with one dark chamber; copper, not red; patent
  sheet, not telemetry.
- **Felt gate (intended 5-second feeling):** *"They'll just tell me the number"* — relief
  with an edge of disbelief. If a cold viewer reads "nice minimal site" instead, it failed.
- **Scroll-UX laws from research:** story chamber entered by choice; price lookup never
  scrollytold; no text overlaid on changing figures; reduced-motion respected.

## The quality bar

- Exemplars: af-site's editorial-industrial discipline (structure only, not its wardrobe),
  the Lifespan Dashboard's one-accent restraint, Sagmeister & Walsh's thesis-made-physical.
- Zero placeholder data: every number on every surface is computed by the real engine or
  cited from the research digest. No lorem, no fake testimonials, no padded grids.
- Verified in a real browser, desktop + mobile, zero console errors, before "done."
