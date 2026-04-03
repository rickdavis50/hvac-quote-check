import type { PaidInsights as PaidInsightsType } from '../types';
import { formatMoney, titleCase } from '../lib/format';

interface Props {
  insights: PaidInsightsType;
}

export default function PaidInsights({ insights }: Props) {
  return (
    <div className="space-y-6 bg-white border-2 border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900">Detailed Savings Report</h3>

      {/* Component Breakdown */}
      {insights.componentBreakdown.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Component Breakdown</h4>
          <div className="space-y-2">
            {insights.componentBreakdown.map((comp, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <span className="font-medium">{titleCase(comp.category)}</span>
                  <span className="text-gray-500 ml-2">
                    (typical: {formatMoney(comp.typicalRange.low)} - {formatMoney(comp.typicalRange.high)})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatMoney(comp.yourCost)}</span>
                  <p className="text-xs text-gray-500">{comp.assessment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparable Quotes */}
      {insights.comparableQuotes && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Local Comparisons</h4>
          <p className="text-sm text-gray-600">{insights.comparableQuotes}</p>
        </div>
      )}

      {/* Negotiation Points */}
      {insights.negotiationPoints.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Negotiation Talking Points</h4>
          <ul className="space-y-1">
            {insights.negotiationPoints.map((point, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-green-600 font-bold">→</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Explanation */}
      {insights.detailedExplanation && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Detailed Analysis</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{insights.detailedExplanation}</p>
        </div>
      )}
    </div>
  );
}
