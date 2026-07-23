import type { FairPriceQuery } from '../lib/urlState';
import type { AnalyzeInput, StageEvent } from '../lib/api';
import type { CheckPhase } from '../App';
import FairPriceTool from '../components/FairPriceTool';
import QuoteInput from '../components/QuoteInput';
import ProcessingSteps from '../components/ProcessingSteps';
import { useExperiment } from '../lib/experiments';

interface Props {
  initialQuery: Partial<FairPriceQuery>;
  onNavigate: (path: string) => void;
  onSubmit: (input: AnalyzeInput) => void;
  checkPhase: CheckPhase;
  stage: StageEvent['stage'] | null;
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

// A/B test: villain-framing (control) vs. benefit-framing (benefit) hero copy.
// Variant assignment + conversion segmenting run through GA4 (see experiments.ts).
const HERO_COPY: Record<string, { h1: string; sub: string }> = {
  control: {
    h1: 'Every HVAC quote hides the price behind a phone call.',
    sub: 'A heat pump is a $10,000-to-$30,000 decision sold to you like a mystery. Put the quote you were handed under the x-ray: the engine prices the same job in your market and rates it Low, Fair, or High, with every factor shown like a receipt. No phone number, no sales call.',
  },
  benefit: {
    h1: 'Know what your heat pump should cost, before the contractor does.',
    sub: 'Upload the quote you were handed. The engine prices the same job in your market and rates it Low, Fair, or High, with every factor shown like a receipt. Free, no phone number, no sales call.',
  },
};

const VOWS = [
  ['The number comes first.', 'The fair price lands the moment your quote does, before anyone gets your name.'],
  ['The math is public.', 'Every estimate ships with its full factor trace and a version number.'],
  ['We never ask for your phone number.', 'This site has no sales team to forward you to.'],
  ['Same inputs, same answer.', 'Prices come from a deterministic engine, not a negotiation.'],
] as const;

export default function Landing({ initialQuery, onNavigate, onSubmit, checkPhase, stage }: Props) {
  const hero = HERO_COPY[useExperiment('hero_copy')] ?? HERO_COPY.control;
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
      {/* Claim */}
      <section className="pb-10 pt-14 sm:pt-20">
        <h1 className="max-w-[18ch] font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-7xl">
          {hero.h1}
        </h1>
        <p className="mt-6 max-w-[54ch] text-[15px] leading-relaxed text-ink-soft">
          {hero.sub}
        </p>
      </section>

      {/* The tool — the hero: quote dissection */}
      <section id="check">
        {checkPhase === 'input' ? (
          <>
            <QuoteInput onSubmit={onSubmit} />
            <p className="mt-4 max-w-[68ch] text-[11px] leading-snug text-ink-mute">
              Your quote may contain personal details. We use it only to produce your analysis,
              store it securely, auto-delete it after 90 days, and never sell it.{' '}
              <button onClick={() => onNavigate('/privacy')} className="underline hover:text-ink">
                How we handle your data
              </button>
            </p>
          </>
        ) : (
          <div className="sheet px-6 py-8 sm:px-8">
            <h2 className="font-display text-2xl text-ink">Dissecting your quote…</h2>
            <ProcessingSteps currentStage={stage} />
          </div>
        )}
      </section>

      {/* No quote yet — the fair-price path, demoted but preserved */}
      <section id="fair-price" className="mt-24">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-3xl tracking-tight text-ink">No quote yet?</h2>
          <p className="text-[13px] text-ink-mute">
            See the fair price for your ZIP first, then come back and check every quote you collect.
          </p>
        </div>
        <FairPriceTool initial={initialQuery} onNavigate={onNavigate} />
      </section>

      {/* Evidence ledger */}
      <section className="mt-24">
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
      <section className="mt-24 bg-chamber px-6 py-14 text-paper sm:px-10">
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

      {/* House rules — the mission, made into rules */}
      <section className="mt-24 grid gap-10 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-micro text-ink-mute">House rules</p>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-ink">
            Pricing transparency, made into rules.
          </h2>
        </div>
        <ul className="space-y-4 sm:border-l sm:border-ink/20 sm:pl-10">
          {VOWS.map(([rule, detail]) => (
            <li key={rule} className="text-[13px] leading-relaxed">
              <span className="font-medium text-ink">{rule}</span>{' '}
              <span className="text-ink-mute">{detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
