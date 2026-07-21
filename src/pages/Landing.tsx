import type { FairPriceQuery } from '../lib/urlState';
import FairPriceTool from '../components/FairPriceTool';

interface Props {
  initialQuery: Partial<FairPriceQuery>;
  onNavigate: (path: string) => void;
}

// Research-verified figures. Sources in DESIGN-BRIEF.md / the research digest.
const EVIDENCE = [
  {
    figure: '$2,000–$70,000',
    text: 'the spread of real whole-home heat-pump prices across ~21,000 installs in one state program (TECH Clean California, 2021–2024). Same machine category. 35× apart.',
  },
  {
    figure: '60%',
    text: 'of contractors are eliminated by homeowners before the first phone call. The research phase is the negotiation. Walk in armed.',
  },
  {
    figure: '$15,393',
    text: 'the national average installed price of a whole-home air-source heat pump (EnergySage marketplace, early 2026). The hardware inside wholesales for $3,200–$4,500.',
  },
];

const VOWS = [
  ['The number comes first.', 'You get the fair price before anyone gets your name.'],
  ['The math is public.', 'Every estimate ships with its full factor trace and a version number.'],
  ['We never ask for your phone number.', 'This site has no sales team to forward you to.'],
  ['Same inputs, same answer.', 'Prices come from a deterministic engine, not a negotiation.'],
] as const;

export default function Landing({ initialQuery, onNavigate }: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
      {/* Claim */}
      <section className="pb-10 pt-14 sm:pt-20">
        <h1 className="max-w-[17ch] font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-7xl">
          Every HVAC quote hides the price behind a phone call.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft">
          A heat pump is a $10,000-to-$30,000 decision sold to you like a mystery. We open with
          the number for your ZIP code and show the math like a receipt. What you do to the
          salesman afterward is your business.
        </p>
      </section>

      {/* The tool — the hero */}
      <section id="fair-price">
        <FairPriceTool initial={initialQuery} onNavigate={onNavigate} />
      </section>

      {/* Evidence ledger */}
      <section className="mt-20">
        <p className="mb-2 text-[11px] uppercase tracking-micro text-ink-mute">
          Why this site exists
        </p>
        <div className="border-t border-ink/20">
          {EVIDENCE.map((row) => (
            <div
              key={row.figure}
              className="grid gap-x-8 gap-y-1 border-b border-ink/15 py-6 sm:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] sm:items-baseline"
            >
              <p className="font-display text-3xl tracking-tight text-ink sm:text-4xl">{row.figure}</p>
              <p className="max-w-[62ch] text-[13px] leading-relaxed text-ink-soft">{row.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Teardown door — the one dark band */}
      <section className="mt-20 bg-chamber px-6 py-14 text-paper sm:px-10">
        <h2 className="max-w-[24ch] font-display text-3xl leading-tight sm:text-5xl">
          You're about to spend $15,000 on a machine you've never seen inside.
        </h2>
        <p className="mt-5 max-w-[52ch] text-[13px] leading-relaxed text-paper/70">
          Scroll a heat pump apart, part by part, price by price: the compressor, the coils, the
          one brass valve that makes winter run backwards. Five minutes, and the quote on your
          kitchen table stops being a mystery.
        </p>
        <button
          onClick={() => onNavigate('/teardown')}
          className="mt-8 inline-block border border-copper bg-copper px-5 py-2.5 text-[13px] font-medium tracking-wide text-chamber transition-colors hover:bg-copper-bright"
        >
          Enter the teardown →
        </button>
      </section>

      {/* Quote door */}
      <section className="mt-20 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl tracking-tight text-ink">
            Already holding a quote?
          </h2>
          <p className="mt-4 max-w-[46ch] text-[13px] leading-relaxed text-ink-soft">
            Put it under the x-ray. Upload the PDF or paste the text; the engine prices the same
            job in your market and rates the quote Low, Fair, or High, with a factor-by-factor
            trace. Photographs of crumpled paper work fine.
          </p>
          <button onClick={() => onNavigate('/check')} className="btn-ink mt-6">
            Check my quote
          </button>
        </div>
        <div className="border-t border-ink/20 pt-6 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0">
          <p className="mb-4 text-[11px] uppercase tracking-micro text-ink-mute">House rules</p>
          <ul className="space-y-4">
            {VOWS.map(([rule, detail]) => (
              <li key={rule} className="text-[13px] leading-relaxed">
                <span className="font-medium text-ink">{rule}</span>{' '}
                <span className="text-ink-mute">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
