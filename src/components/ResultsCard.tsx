import type { AnalysisResult, UserCorrections } from '../types';
import RatingBadge from './RatingBadge';
import FairRangeBar from './FairRangeBar';
import EditableFields from './EditableFields';
import { formatMoney } from '../lib/format';

interface Props {
  result: AnalysisResult;
  onCorrections: (corrections: UserCorrections) => void;
  onUnlock: () => void;
  correcting: boolean;
}

export default function ResultsCard({ result, onCorrections, onUnlock, correcting }: Props) {
  const { rating, confidence, quotedTotal, fairRange, savingsPotential, summary, extractedData, dataQuality } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Your quoted price</p>
          <p className="text-3xl font-bold text-gray-900">{formatMoney(quotedTotal)}</p>
        </div>
        <RatingBadge rating={rating} />
      </div>

      {/* Summary */}
      <p className="text-gray-700">{summary}</p>

      {/* Fair Range */}
      <FairRangeBar low={fairRange.low} mid={fairRange.mid} high={fairRange.high} quoted={quotedTotal} />

      {/* Savings CTA */}
      {rating === 'High' && savingsPotential >= 500 && !result.paidInsights && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-semibold">
            You may be overpaying by up to {formatMoney(savingsPotential)}
          </p>
          <button
            onClick={onUnlock}
            className="mt-3 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Unlock detailed savings report — $9
          </button>
        </div>
      )}

      {/* Data Quality */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>Confidence: <span className="font-medium">{confidence}</span></span>
        <span>Sample: <span className="font-medium">{dataQuality.sampleSize} quotes</span></span>
        <span>Precision: <span className="font-medium">{dataQuality.geographyPrecision}</span></span>
      </div>

      {/* Line Items */}
      {extractedData.lineItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Detected Line Items</h3>
          <div className="space-y-1">
            {extractedData.lineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.description}</span>
                <span className="font-medium">{formatMoney(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Fields */}
      <EditableFields data={extractedData} onSave={onCorrections} saving={correcting} />
    </div>
  );
}
