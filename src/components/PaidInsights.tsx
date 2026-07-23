import type { PaidInsights as PaidInsightsType } from '../types';
import { formatMoney, titleCase } from '../lib/format';

interface Props {
  insights: PaidInsightsType;
}

export default function PaidInsights({ insights }: Props) {
  return (
    <div className="sheet">
      <div className="sheet-titleblock">
        <span>Sheet Nº 003 · the itemized case</span>
        <span className="ml-auto">paid report</span>
      </div>

      <div className="space-y-8 px-5 py-7 sm:px-8">
        {insights.componentBreakdown.length > 0 && (
          <div>
            <h4 className="mb-3 font-display text-xl text-ink">Line-item verdicts</h4>
            <div className="space-y-3 text-[13px]">
              {insights.componentBreakdown.map((comp, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3">
                  <div>
                    <span className="font-medium text-ink">{titleCase(comp.category)}</span>
                    <span className="ml-2 text-[11px] text-ink-mute">
                      typical here: {formatMoney(comp.typicalRange.low)} – {formatMoney(comp.typicalRange.high)}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-display text-lg tracking-tight text-ink">{formatMoney(comp.yourCost)}</span>
                    <p className="text-[11px] text-ink-mute">{comp.assessment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.comparableQuotes && (
          <div>
            <h4 className="mb-2 font-display text-xl text-ink">Nearby quotes</h4>
            <p className="text-[13px] leading-relaxed text-ink-soft">{insights.comparableQuotes}</p>
          </div>
        )}

        {insights.negotiationPoints.length > 0 && (
          <div>
            <h4 className="mb-3 font-display text-xl text-ink">Say this before you sign</h4>
            <ul className="space-y-2.5">
              {insights.negotiationPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-ink-soft">
                  <span className="shrink-0 tabular-nums text-copper-deep">{String(i + 1).padStart(2, '0')}</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.detailedExplanation && (
          <div>
            <h4 className="mb-2 font-display text-xl text-ink">The full read</h4>
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
              {insights.detailedExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
