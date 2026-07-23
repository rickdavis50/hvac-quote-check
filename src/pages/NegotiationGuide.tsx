interface Props {
  onNavigate: (path: string) => void;
}

// Every figure here is attributed. Sources listed in full at the foot of the page.
// Rebate/credit facts verified against IRS FS-2025-05 (July 2025) and DOE/EnergySage
// (May–June 2026). This is general information, not tax, legal, or financial advice.

const INDEX = [
  ['when', 'When to buy'],
  ['quotes', 'Get three quotes'],
  ['levers', 'The levers'],
  ['rebates', 'Rebates in 2026'],
  ['scams', 'Scams to spot'],
  ['diy', 'Buy it yourself?'],
] as const;

// Scam → the one move that defends against it.
const SCAMS: Array<{ flag: string; defense: string }> = [
  {
    flag: '“Your heat exchanger is cracked. You need a whole new furnace.”',
    defense:
      'A cracked exchanger is genuinely dangerous, and a genuinely popular scare-upsell. Make them show you the crack with a photo or a scope camera, then get an independent second opinion before you replace anything.',
  },
  {
    flag: '“You just need a refrigerant recharge.”',
    defense:
      'Refrigerant is not a consumable. If it is low, you have a leak, and recharging without finding it is paying to leak again. Weigh the jug before and after too. Charging for refrigerant you never got is an old trick.',
  },
  {
    flag: '“There’s carbon monoxide. This has to be replaced today.”',
    defense:
      'An unannounced tech declaring a CO emergency and demanding same-day replacement is a documented pressure tactic. Verify with an independent inspection before you sign a thing.',
  },
  {
    flag: '“Sign today and I’ll take $2,000 off.”',
    defense:
      'Real pricing does not evaporate overnight. A discount that only exists if you sign now is a leverage grab. Collect your other bids first; a fair price is still fair next week.',
  },
  {
    flag: 'A $47 tune-up that finds “several critical problems.”',
    defense:
      'The cheap visit is the door; the panic-upsell is the product. Slow it down and get the “critical” findings confirmed by someone who is not selling you the repair.',
  },
  {
    flag: 'A vague, non-itemized bid.',
    defense:
      'No breakdown, no deal. Insist on a written estimate with labor, parts, exact model numbers, and the permit line spelled out. Hidden fees and phantom parts live in the round-number quote.',
  },
  {
    flag: '“I need the full amount upfront.”',
    defense:
      'A deposit is normal. Paying 100% before the work is done is not. It destroys your only leverage and is how disappear-jobs start.',
  },
  {
    flag: 'No license, no permit, “to save you money.”',
    defense:
      'Verify the license number against your state board before anything else. Unlicensed work and skipped permits can void your equipment warranty AND your homeowners insurance, and they surface again when you sell the house.',
  },
];

// The buy-it-yourself verdict, by buyer.
const DIY_VERDICT: Array<{ tone: 'good' | 'mid' | 'bad'; verdict: string; who: string }> = [
  {
    tone: 'good',
    verdict: 'Worth it',
    who: 'A handy DIYer putting in a single- or small-multi-zone pre-charged mini-split (MrCool DIY or similar) in a moderate climate. The sealed line set keeps you out of refrigerant-handling territory and the warranty survives self-installation.',
  },
  {
    tone: 'mid',
    verdict: 'Marginal',
    who: 'Buying the equipment online and hiring labor-only. You can save roughly $1,300–$3,500 on a 3-ton, if you can find one of the minority of licensed pros who will install your gear, accept a ~30-day labor warranty, and get the sizing right yourself.',
  },
  {
    tone: 'bad',
    verdict: 'Not worth it',
    who: 'A whole-home ducted heat pump, DIY. It is effectively illegal to finish without EPA-608 refrigerant certification, most licensed contractors will not touch it, and the warranty, permit, and insurance downside dwarfs the saving.',
  },
];

function SectionHead({ n, id, title }: { n: string; id: string; title: string }) {
  return (
    <h2 id={id} className="scroll-mt-8 flex items-baseline gap-3 font-mono text-[12px] uppercase tracking-micro text-ink-mute">
      <span className="text-copper-deep">{n}</span>
      <span className="text-ink">{title}</span>
    </h2>
  );
}

export default function NegotiationGuide({ onNavigate }: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 sm:px-8">
      <div className="sheet mt-10">
        <div className="sheet-titleblock">
          <span>Sheet Nº 006 · negotiation strategy</span>
          <span className="ml-auto">for the buyer, not the seller</span>
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-12">
          <h1 className="max-w-[18ch] font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Walk in knowing more than the salesman.
          </h1>
          <p className="mt-5 max-w-[64ch] text-[14px] leading-relaxed text-ink-soft">
            A heat pump is a $10,000–$30,000 purchase sold to you like a mystery. Here is how to
            time it, read the quote, spot the scam, and claim the money that is actually still on
            the table in 2026, pulled from contractors, building scientists, the IRS, and
            homeowners who posted their receipts. Run your quote through the{' '}
            <button onClick={() => onNavigate('/check')} className="underline decoration-copper/60 underline-offset-2 hover:text-ink">
              x-ray
            </button>{' '}
            first, then bring this to the table.
          </p>

          {/* Index */}
          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-ink/15 py-4 text-[12px]">
            {INDEX.map(([id, label], i) => (
              <a key={id} href={`#${id}`} className="text-ink-mute transition-colors hover:text-ink">
                <span className="mr-1.5 tabular-nums text-copper-deep">0{i + 1}</span>
                {label}
              </a>
            ))}
          </nav>

          <div className="mt-10 space-y-12">
            {/* 01 — When to buy */}
            <section className="space-y-4">
              <SectionHead n="01" id="when" title="When to buy" />
              <p className="max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                Buy in the shoulder seasons: early spring for a heat pump or AC, late summer into
                early fall for a furnace. Contractors are slow and hungry, and most importantly, you
                still have your leverage. Watch for end-of-model-year closeouts in September and
                October. Industry guides put off-season savings around 10–20%; no public dataset
                pins the number down, so treat it as a rule of thumb, not a promise.
              </p>
              <div className="flex flex-col gap-4 border-l-2 border-copper/40 pl-5 sm:flex-row sm:items-center sm:gap-8">
                <p className="font-display text-3xl leading-none tracking-tight text-ink sm:text-4xl">
                  Leverage
                </p>
                <p className="max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
                  is the whole game, and an emergency destroys it. With no heat in January you can’t
                  walk away, can’t get three bids, and can’t wait for a promo; the emergency
                  premium is real. Replace a dying system on your schedule, not the weather’s.
                </p>
              </div>
            </section>

            {/* 02 — Three quotes */}
            <section className="space-y-4">
              <SectionHead n="02" id="quotes" title="Get three quotes. Compare scope, not the bottom line." />
              <p className="max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                Get at least three bids. Two isn’t enough to know the range, and the first quote is
                the one you overpay on. Then compare them honestly: most people think they’re
                comparing price when they’re really comparing scope. Get exact model numbers and
                confirm every bid covers the same job.
              </p>
              <ul className="grid gap-x-8 gap-y-2 text-[13px] text-ink-soft sm:grid-cols-2">
                {['Permit pulled and inspection', 'Startup, commissioning, and testing', 'Thermostat and controls', 'Duct or airflow corrections', 'Refrigerant line-set work', 'Old-equipment haul-away', 'Written warranty terms', 'Electrical / disconnect work'].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-[7px] h-1 w-1 shrink-0 bg-copper" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-2 border border-ink/15 bg-paper-deep/40 px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-micro text-ink-mute">The sizing lever · Manual J</p>
                <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                  A real load calculation (ACCA Manual J) sizes the equipment to your actual house.
                  Most contractors skip it and reach for “one ton per 400–600 square feet,” which is
                  why, in the words of building scientist Allison Bailes, the vast majority of
                  systems are oversized. Oversizing short-cycles the unit, leaves the air humid,
                  raises your bills, and shortens the equipment’s life; it also conveniently sells
                  you more tonnage. A quote sized off square footage alone is a red flag. Demand a
                  room-by-room Manual J, especially for a heat pump, whose capacity falls as it gets
                  colder out.
                </p>
              </div>
              <div className="mt-2">
                <p className="font-mono text-[11px] uppercase tracking-micro text-ink-mute">Reading the efficiency numbers</p>
                <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                  <span className="text-ink">SEER2</span> is cooling efficiency; <span className="text-ink">HSPF2</span> is
                  heating. Higher means more output per kilowatt, and in a cold climate HSPF2 is the
                  one to weight. The federal test got tougher in 2023, so the same box now shows a
                  lower number: don’t compare a SEER2 rating against an old SEER rating. The federal
                  floor for a split heat pump is <span className="tabular-nums text-ink">14.3 SEER2 / 7.5 HSPF2</span>;
                  ENERGY STAR sits at <span className="tabular-nums text-ink">15.2 / 7.8</span>; “high efficiency” means
                  roughly <span className="tabular-nums text-ink">17+ SEER2</span>. Gains past the ENERGY STAR tier have
                  long paybacks. See the next section.
                </p>
              </div>
            </section>

            {/* 03 — Levers */}
            <section className="space-y-4">
              <SectionHead n="03" id="levers" title="The levers" />
              <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                <div>
                  <p className="font-display text-2xl tracking-tight text-ink">Ask for the cash price.</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    “0% financing” is rarely free. The contractor pays the lender a fee to buy down
                    the rate and folds it into the equipment price, so cash buyers quietly subsidize
                    financed ones. Ask for the written cash price next to the financed price. The
                    gap is the financing fee in disguise.
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl tracking-tight text-ink">Materials are negotiable.</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    One homeowner was quoted <span className="tabular-nums">$300</span>/lb for refrigerant that
                    wholesales near <span className="tabular-nums">$30</span>, a ~900% markup. Equipment itself is
                    commonly marked up 20–100%. These are line items, and line items can be
                    questioned.
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl tracking-tight text-ink">Buy mid-tier, not the flagship.</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    Moving from an old 8-SEER unit to a modern ~15-SEER2 system captures about half
                    the available energy savings; efficiency above the ENERGY STAR tier pays back
                    slowly. Buy the system your home actually needs. The national average install
                    runs about <span className="tabular-nums">$15,400</span>.
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl tracking-tight text-ink">Time it to the promos.</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                    Manufacturers run instant rebates in spring and fall. Recent examples reached
                    up to <span className="tabular-nums">$1,650</span> (Carrier), <span className="tabular-nums">$1,200</span>{' '}
                    (Lennox), and <span className="tabular-nums">$900</span> (Trane). Stack that timing with the
                    contractor’s slow season.
                  </p>
                </div>
              </div>
            </section>

            {/* 04 — Rebates */}
            <section className="space-y-4">
              <SectionHead n="04" id="rebates" title="Rebates & credits, 2026" />
              <div className="border border-verdict-high/40 bg-verdict-high/[0.06] px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-micro text-verdict-high">2026 update · read this</p>
                <p className="mt-2 max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                  <span className="text-ink">The federal 25C heat-pump tax credit is gone.</span> The 30%
                  credit worth up to <span className="tabular-nums">$2,000</span> was terminated early by the law
                  signed in July 2025; the IRS states it “will not be allowed for any property placed
                  in service after December 31, 2025.” Installation had to be finished by that date,
                  not merely paid for. If a 2026 quote still dangles the $2,000 federal credit, that
                  line is stale at best.
                </p>
              </div>
              <p className="max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                Real money is still on the table. It just moved:
              </p>
              <ul className="space-y-3 text-[13px] leading-relaxed text-ink-soft">
                <li className="flex gap-3">
                  <span className="mt-[7px] h-1 w-1 shrink-0 bg-copper" />
                  <span>
                    <span className="text-ink">IRA Home Energy Rebates (HEEHRA / HEAR).</span> These are
                    state-run grants, not tax credits, and they survived the 2025 law: up to{' '}
                    <span className="tabular-nums">$8,000</span> if your household is under 80% of area median
                    income, up to <span className="tabular-nums">$4,000</span> from 80–150%. They’re live in only
                    about a dozen states so far and the money runs out. California’s was fully
                    reserved within roughly three months of launch. Apply early.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] h-1 w-1 shrink-0 bg-copper" />
                  <span>
                    <span className="text-ink">State and utility rebates.</span> Nearly every state (49 plus
                    D.C.) has its own heat-pump incentive, and these stack with the IRA rebates where
                    both exist.
                  </span>
                </li>
              </ul>
              <p className="max-w-[64ch] text-[12px] leading-relaxed text-ink-mute">
                Program status changes month to month, so verify before you sign. The canonical
                database is{' '}
                <a href="https://www.dsireusa.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                  DSIRE
                </a>{' '}
                (dsireusa.org), alongside your state energy office. None of this is tax advice.
              </p>
            </section>

            {/* 05 — Scams */}
            <section className="space-y-4">
              <SectionHead n="05" id="scams" title="Scams to spot" />
              <div className="border-t border-ink/15">
                {SCAMS.map((s) => (
                  <div
                    key={s.flag}
                    className="grid gap-x-8 gap-y-1.5 border-b border-ink/15 py-5 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                  >
                    <p className="text-[13px] font-medium leading-snug text-verdict-high">{s.flag}</p>
                    <p className="text-[13px] leading-relaxed text-ink-soft">{s.defense}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 06 — Buy it yourself */}
            <section className="space-y-4">
              <SectionHead n="06" id="diy" title="Should you buy the equipment yourself?" />
              <p className="max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                The pitch is seductive: sites like HVACDirect sell you the equipment at
                wholesale, so you skip the contractor’s 40–100% markup. The reality is narrower.
                Equipment is only about half of a ducted install; the labor, refrigerant,
                electrical, permit, and commissioning don’t go away, so the realistic saving on a
                self-supplied 3-ton, labor-only, is roughly <span className="tabular-nums">$1,300–$3,500</span>, not
                the whole sticker gap.
              </p>
              <p className="max-w-[64ch] text-[13px] leading-relaxed text-ink-soft">
                And the catches are real. Most licensed contractors won’t install equipment you
                supplied (liability, and they lose their margin), and those who will give about a
                30-day labor warranty. Parts warranties generally require a licensed installer plus
                registration; the premium brands (Carrier, Trane, Lennox) can deny warranty on
                units bought outside their dealers. A traditional ducted system legally needs
                EPA-608 refrigerant certification to finish, and unpermitted work can void your
                homeowners insurance. The one genuinely homeowner-friendly path is a pre-charged
                mini-split like the MrCool DIY line: sealed connections, no refrigerant handling,
                and the warranty survives self-installation.
              </p>
              <div className="border border-ink/20">
                <p className="border-b border-ink/15 bg-paper-deep/40 px-5 py-2.5 font-mono text-[11px] uppercase tracking-micro text-ink-mute">
                  The verdict: self-supply is a mini-split move, not a whole-home-ducted move
                </p>
                <div className="divide-y divide-ink/10">
                  {DIY_VERDICT.map((row) => (
                    <div key={row.verdict} className="grid gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]">
                      <p
                        className={`font-display text-xl tracking-tight ${
                          row.tone === 'good' ? 'text-verdict-good' : row.tone === 'bad' ? 'text-verdict-high' : 'text-ink'
                        }`}
                      >
                        {row.verdict}
                      </p>
                      <p className="text-[13px] leading-relaxed text-ink-soft">{row.who}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="max-w-[64ch] text-[12px] leading-relaxed text-ink-mute">
                On HVACDirect specifically: it’s a legitimate 20-year Ohio retailer (~4.5/5 across
                ~1,850 reviews) selling Goodman, MrCool, and Trane alongside its house-brand ACiQ.
                Watch for freight damage and hard returns, and remember the warranty still needs a
                licensed pro to commission the unit and a registration on file.
              </p>
            </section>
          </div>

          {/* Close */}
          <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/15 pt-8">
            <button onClick={() => onNavigate('/check')} className="btn-ink">
              Check a quote against the fair price
            </button>
            <button onClick={() => onNavigate('/')} className="btn-line">
              ← Back to the fair price
            </button>
          </div>

          {/* Sources & disclaimer */}
          <div className="mt-10 border-t border-ink/15 pt-5">
            <p className="font-mono text-[11px] uppercase tracking-micro text-ink-mute">Sources & method</p>
            <p className="mt-3 max-w-[72ch] text-[11px] leading-relaxed text-ink-mute">
              Tax-credit status: IRS Fact Sheet FS-2025-05 (Public Law 119-21, July 2025) and
              EnergySage (May 2026). Rebates: U.S. Department of Energy, state energy offices, and
              the California Energy Commission. Efficiency standards: ENERGY STAR and AHRI. Sizing:
              ACCA Manual J, Energy Vanguard, and NYSERDA. Pricing, seasonality, financing, and
              scam tactics: CBS News (2026), HVAC.com, EnergySage, and homeowner reports. Buy-online
              analysis: manufacturer warranty terms, HVACDirect, and professional installer
              forums. Figures marked as ranges or rules of thumb are industry estimates, not
              audited data. This guide is general information, not tax, legal, or financial advice.
              Verify current rebate programs and any contractor’s license before you sign.{' '}
              <button onClick={() => onNavigate('/legal')} className="underline hover:text-ink">
                Terms &amp; disclaimer
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
