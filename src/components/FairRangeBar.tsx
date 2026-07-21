import { formatMoney } from '../lib/format';

interface Props {
  low: number;
  mid: number;
  high: number;
  quoted: number;
}

// A drafted gauge: hairline track, hatched fair zone, one marker for the quote.
export default function FairRangeBar({ low, mid, high, quoted }: Props) {
  const fairSpan = high - low || 1;
  const belowRange = quoted < low;
  const aboveRange = quoted > high;
  const padAmount = fairSpan * 0.35;
  const barMin = low - padAmount;
  const barMax = high + padAmount;
  const barSpan = barMax - barMin;

  const toPct = (val: number) => ((val - barMin) / barSpan) * 100;
  const fairLowPct = toPct(low);
  const fairHighPct = toPct(high);
  const fairMidPct = toPct(mid);
  const quotedClamped = Math.max(barMin, Math.min(barMax, quoted));
  const quotedPct = Math.min(Math.max(toPct(quotedClamped), 2), 98);

  const tone = belowRange ? 'text-verdict-good' : aboveRange ? 'text-verdict-high' : 'text-ink';
  const markerBg = belowRange ? 'bg-verdict-good' : aboveRange ? 'bg-verdict-high' : 'bg-ink';

  return (
    <div>
      {(belowRange || aboveRange) && (
        <p className={`mb-2 text-[13px] font-medium ${tone}`}>
          {belowRange
            ? `${formatMoney(low - quoted)} below the fair range`
            : `${formatMoney(quoted - high)} above the fair range`}
        </p>
      )}

      <div className="relative h-12">
        {/* Track */}
        <div className="absolute inset-x-0 top-6 border-t border-ink/25" />

        {/* Fair zone: hatched band */}
        <div
          className="absolute top-3.5 h-5 border-x border-ink/40"
          style={{
            left: `${fairLowPct}%`,
            width: `${fairHighPct - fairLowPct}%`,
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(22,19,16,0.14) 0 1px, transparent 1px 5px)',
          }}
        />

        {/* Midpoint tick */}
        <div className="absolute top-2.5 h-7 w-px bg-copper" style={{ left: `${fairMidPct}%` }} />

        {/* Quote marker */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${quotedPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className={`h-2.5 w-2.5 rotate-45 ${markerBg}`} />
          <div className={`h-6 w-px ${markerBg}`} />
        </div>
      </div>

      <div className="flex justify-between text-[11px] text-ink-mute">
        <span className="tabular-nums">{formatMoney(low)}</span>
        <span className="tabular-nums text-copper-deep">fair midpoint {formatMoney(mid)}</span>
        <span className="tabular-nums">{formatMoney(high)}</span>
      </div>

      <p className="mt-3 text-center text-[13px] text-ink-mute">
        your quote{' '}
        <span className={`font-display text-2xl tracking-tight ${tone}`}>{formatMoney(quoted)}</span>
      </p>
    </div>
  );
}
