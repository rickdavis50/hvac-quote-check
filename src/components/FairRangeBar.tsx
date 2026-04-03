import { formatMoney } from '../lib/format';

interface Props {
  low: number;
  mid: number;
  high: number;
  quoted: number;
}

export default function FairRangeBar({ low, mid, high, quoted }: Props) {
  const min = Math.min(low * 0.8, quoted * 0.9);
  const max = Math.max(high * 1.2, quoted * 1.1);
  const range = max - min || 1;

  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;
  const quotedPct = Math.min(Math.max(((quoted - min) / range) * 100, 2), 98);

  return (
    <div className="space-y-2">
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
        {/* Fair range band */}
        <div
          className="absolute top-0 bottom-0 bg-blue-100 border-x-2 border-blue-300"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        {/* Quoted price marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900"
          style={{ left: `${quotedPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatMoney(low)}</span>
        <span className="font-medium text-gray-700">Fair: {formatMoney(mid)}</span>
        <span>{formatMoney(high)}</span>
      </div>
      <p className="text-center text-sm text-gray-600">
        Your quote: <span className="font-semibold text-gray-900">{formatMoney(quoted)}</span>
      </p>
    </div>
  );
}
