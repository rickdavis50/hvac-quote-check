import type { PricingFactor } from '../types';
import { formatMoney } from '../lib/format';

interface Props {
  factors: PricingFactor[];
  methodologyVersion: string;
}

// The engine's math trace, shown to the customer. Same data AI consumers get
// from the API — transparency is the product.
export default function PricingFactors({ factors, methodologyVersion }: Props) {
  return (
    <details className="group border border-cream-300 rounded-xl bg-cream-50/60">
      <summary className="cursor-pointer list-none px-5 py-3.5 flex items-center justify-between text-sm font-medium text-warm-700 hover:text-warm-900 transition-colors">
        How we priced this
        <svg className="w-4 h-4 text-warm-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div className="px-5 pb-4">
        <div className="space-y-2.5 pt-1">
          {factors.map((factor, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 text-sm border-b border-cream-200 pb-2.5 last:border-0">
              <div>
                <span className="font-medium text-warm-800">{factor.label}</span>
                <p className="text-xs text-warm-500 font-light mt-0.5">{factor.detail}</p>
              </div>
              <span className="font-mono text-xs text-warm-700 whitespace-nowrap">
                {factor.amount ? formatMoney(factor.amount) : `× ${factor.multiplier.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-warm-500/80 font-light mt-3">
          Deterministic pricing methodology v{methodologyVersion} — same inputs always give the same answer.
        </p>
      </div>
    </details>
  );
}
