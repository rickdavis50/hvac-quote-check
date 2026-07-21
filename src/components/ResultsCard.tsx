import type { AnalysisResult, UserCorrections } from '../types';
import RatingBadge from './RatingBadge';
import FairRangeBar from './FairRangeBar';
import EditableFields from './EditableFields';
import SavingsTeaser from './SavingsTeaser';
import FactorReceipt from './FactorReceipt';
import { formatMoney } from '../lib/format';

interface Props {
  result: AnalysisResult;
  onCorrections: (corrections: UserCorrections) => void;
  onUnlock: () => void;
  correcting: boolean;
}

export default function ResultsCard({ result, onCorrections, onUnlock, correcting }: Props) {
  const { rating, confidence, quotedTotal, fairRange, savingsPotential, summary, extractedData, dataQuality, pricing } = result;
  const showTeaser = rating === 'High' && savingsPotential >= 500 && !result.paidInsights;
  const marketLabel =
    pricing.marketContext.metroName ??
    (extractedData.zipCode === '00000' ? 'the national market' : `ZIP ${extractedData.zipCode}`);

  return (
    <div className="space-y-8">
      <div className="sheet">
        <div className="sheet-titleblock">
          <span>Dissection report</span>
          <span>method v{pricing.methodologyVersion}</span>
          <span className="ml-auto">
            confidence {confidence} · {dataQuality.geographyPrecision}-level · {dataQuality.sampleSize} local quotes
          </span>
        </div>

        <div className="space-y-8 px-5 py-7 sm:px-8">
          {/* Verdict header */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-micro text-ink-mute">
                The quote · priced for {marketLabel}
              </p>
              <p className="mt-1 font-display text-5xl tracking-tight text-ink sm:text-6xl">
                {formatMoney(quotedTotal)}
              </p>
            </div>
            <RatingBadge rating={rating} />
          </div>

          <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">{summary}</p>

          <FairRangeBar low={fairRange.low} mid={fairRange.mid} high={fairRange.high} quoted={quotedTotal} />

          {/* The math, always in the open */}
          <div className="border-t border-ink/15 pt-6">
            <FactorReceipt
              factors={pricing.factors}
              fairRange={fairRange}
              methodologyVersion={pricing.methodologyVersion}
            />
          </div>

          {/* What the quote actually itemized */}
          {extractedData.lineItems.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-xl text-ink">What the quote itemizes</h3>
              <ul className="text-[13px]">
                {extractedData.lineItems.map((item, i) => (
                  <li key={i} className="flex items-baseline py-1.5">
                    <span className="min-w-0 truncate text-ink-soft">{item.description}</span>
                    <span className="leader" />
                    <span className="shrink-0 tabular-nums text-ink">{formatMoney(item.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <EditableFields key={result.submissionId} data={extractedData} onSave={onCorrections} saving={correcting} />
        </div>
      </div>

      {showTeaser && <SavingsTeaser savingsPotential={savingsPotential} onUnlock={onUnlock} />}
    </div>
  );
}
