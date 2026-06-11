import type { AnalysisResult, UserCorrections } from '../types';
import RatingBadge from './RatingBadge';
import FairRangeBar from './FairRangeBar';
import EditableFields from './EditableFields';
import SavingsTeaser from './SavingsTeaser';
import PricingFactors from './PricingFactors';
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
  const marketLabel = pricing.marketContext.metroName ?? `${extractedData.zipCode === '00000' ? 'national' : extractedData.zipCode} market`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-warm-500 font-medium">Your quoted price</p>
          <p className="font-serif text-4xl text-warm-900 mt-1">{formatMoney(quotedTotal)}</p>
          <p className="text-xs text-warm-500 font-light mt-1.5">Priced for {marketLabel}</p>
        </div>
        <RatingBadge rating={rating} />
      </div>

      {/* Summary */}
      <p className="text-warm-600 leading-relaxed font-light">{summary}</p>

      {/* Fair Range */}
      <FairRangeBar low={fairRange.low} mid={fairRange.mid} high={fairRange.high} quoted={quotedTotal} />

      {/* The math, in the open */}
      <PricingFactors factors={pricing.factors} methodologyVersion={pricing.methodologyVersion} />

      {/* Data Quality */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-warm-500 border-t border-cream-300 pt-4">
        <span>Confidence: <span className="font-medium text-warm-700">{confidence}</span></span>
        <span>Local quotes used: <span className="font-medium text-warm-700">{dataQuality.sampleSize}</span></span>
        <span>Precision: <span className="font-medium text-warm-700">{dataQuality.geographyPrecision}</span></span>
      </div>

      {/* Line Items */}
      {extractedData.lineItems.length > 0 && (
        <div>
          <h3 className="font-serif text-lg text-warm-900 mb-3">Detected Line Items</h3>
          <div className="space-y-2">
            {extractedData.lineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-cream-200 pb-2">
                <span className="text-warm-600 font-light">{item.description}</span>
                <span className="font-medium text-warm-800">{formatMoney(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Fields */}
      <EditableFields key={result.submissionId} data={extractedData} onSave={onCorrections} saving={correcting} />

      {/* Savings Teaser — placed last for visual impact */}
      {showTeaser && (
        <SavingsTeaser savingsPotential={savingsPotential} onUnlock={onUnlock} />
      )}
    </div>
  );
}
