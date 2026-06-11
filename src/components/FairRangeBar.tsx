import { formatMoney } from '../lib/format';

interface Props {
  low: number;
  mid: number;
  high: number;
  quoted: number;
}

export default function FairRangeBar({ low, mid, high, quoted }: Props) {
  const fairSpan = high - low || 1;
  const belowRange = quoted < low;
  const aboveRange = quoted > high;
  // The fair range always occupies the center 60% of the bar.
  // We extend 20% on each side for context.
  const padAmount = fairSpan * 0.35;
  const barMin = low - padAmount;
  const barMax = high + padAmount;
  const barSpan = barMax - barMin;

  const toPct = (val: number) => ((val - barMin) / barSpan) * 100;
  const fairLowPct = toPct(low);
  const fairHighPct = toPct(high);
  const fairMidPct = toPct(mid);

  // Clamp quoted to bar bounds for the marker, but show arrow if off-chart
  const quotedClamped = Math.max(barMin, Math.min(barMax, quoted));
  const quotedPct = Math.min(Math.max(toPct(quotedClamped), 3), 97);

  // Color coding for the quote position
  const markerColor = belowRange
    ? 'text-rating-good'
    : aboveRange
    ? 'text-rating-high'
    : 'text-warm-900';

  const markerBg = belowRange
    ? 'bg-rating-good'
    : aboveRange
    ? 'bg-rating-high'
    : 'bg-warm-900';

  return (
    <div className="space-y-2">
      {/* Off-range callout */}
      {belowRange && (
        <div className="flex items-center gap-2 text-sm text-rating-good mb-1">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="font-medium">
            {formatMoney(low - quoted)} below fair range
          </span>
        </div>
      )}
      {aboveRange && (
        <div className="flex items-center gap-2 text-sm text-rating-high mb-1">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span className="font-medium">
            {formatMoney(quoted - high)} above fair range
          </span>
        </div>
      )}

      {/* Bar */}
      <div className="relative h-12">
        {/* Background track */}
        <div className="absolute inset-x-0 top-4 h-4 bg-cream-200 rounded-full" />

        {/* Fair range zone */}
        <div
          className="absolute top-4 h-4 bg-cream-300 rounded-full"
          style={{ left: `${fairLowPct}%`, width: `${fairHighPct - fairLowPct}%` }}
        />

        {/* Fair midpoint tick */}
        <div
          className="absolute top-4 h-4 w-px bg-warm-500/25"
          style={{ left: `${fairMidPct}%` }}
        />

        {/* Left arrow if quote is way below */}
        {quoted < barMin && (
          <div className="absolute top-3.5 left-0 flex items-center gap-1">
            <svg className={`w-5 h-5 ${markerColor}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Right arrow if quote is way above */}
        {quoted > barMax && (
          <div className="absolute top-3.5 right-0 flex items-center gap-1">
            <svg className={`w-5 h-5 ${markerColor}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Quote marker */}
        <div
          className="absolute top-1 flex flex-col items-center"
          style={{ left: `${quotedPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className={`w-3 h-3 rounded-full ${markerBg} ring-2 ring-cream-50 shadow-sm`} />
          <div className={`w-0.5 h-5 ${markerBg}`} />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-warm-500 font-light px-1">
        <span>{formatMoney(low)}</span>
        <span className="font-medium text-warm-700">Fair: {formatMoney(mid)}</span>
        <span>{formatMoney(high)}</span>
      </div>

      {/* Your quote */}
      <p className={`text-center text-sm ${markerColor.replace('text-', 'text-')}`}>
        Your quote: <span className={`font-serif text-xl ${markerColor}`}>{formatMoney(quoted)}</span>
      </p>
    </div>
  );
}
