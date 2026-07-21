import type { PricingFactor } from '../types';
import { formatMoney } from '../lib/format';

interface Props {
  factors: PricingFactor[];
  fairRange: { low: number; mid: number; high: number };
  methodologyVersion: string;
}

// The pricing math printed like the receipt contractors won't give you:
// baseline × every multiplier, dotted leaders, a ruled total.
export default function FactorReceipt({ factors, fairRange, methodologyVersion }: Props) {
  return (
    <div className="text-[13px] leading-relaxed">
      <div className="mb-3 flex items-baseline justify-between text-[11px] uppercase tracking-micro text-ink-mute">
        <span>The math, in full</span>
        <span>method v{methodologyVersion}</span>
      </div>

      <ul>
        {factors.map((factor) => (
          <li key={factor.label} className="flex items-baseline py-1.5">
            <span className="shrink-0 text-ink">{factor.label}</span>
            <span className="leader" />
            <span className="shrink-0 tabular-nums text-ink">
              {factor.amount !== undefined ? formatMoney(factor.amount) : `× ${factor.multiplier.toFixed(2)}`}
            </span>
          </li>
        ))}
      </ul>
      <ul className="mt-1 border-t border-ink/20 pt-2">
        <li className="flex items-baseline py-1">
          <span className="shrink-0 font-medium text-ink">Fair midpoint</span>
          <span className="leader" />
          <span className="shrink-0 font-medium tabular-nums text-copper-deep">{formatMoney(fairRange.mid)}</span>
        </li>
        <li className="flex flex-wrap items-baseline py-1 text-ink-mute">
          <span className="shrink-0">Fair range (0.82×–1.22×)</span>
          <span className="leader min-w-[2rem]" />
          <span className="shrink-0 tabular-nums">
            {formatMoney(fairRange.low)} – {formatMoney(fairRange.high)}
          </span>
        </li>
      </ul>

      <div className="mt-3 space-y-1 text-[11px] leading-snug text-ink-mute">
        {factors.map((factor) => (
          <p key={factor.label}>
            <span className="text-ink-soft">{factor.label}:</span> {factor.detail}
          </p>
        ))}
      </div>
    </div>
  );
}
