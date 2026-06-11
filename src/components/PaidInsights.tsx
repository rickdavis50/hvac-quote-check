import type { PaidInsights as PaidInsightsType } from '../types';
import { formatMoney, titleCase } from '../lib/format';

interface Props {
  insights: PaidInsightsType;
}

export default function PaidInsights({ insights }: Props) {
  return (
    <div className="space-y-8 bg-cream-50 border border-gold-500/20 rounded-2xl p-8">
      <h3 className="font-serif text-2xl text-warm-900">Detailed Savings Report</h3>

      {/* Component Breakdown */}
      {insights.componentBreakdown.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-widest text-warm-500 font-medium mb-3">Component Breakdown</h4>
          <div className="space-y-3">
            {insights.componentBreakdown.map((comp, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-cream-200 pb-3">
                <div>
                  <span className="font-medium text-warm-800">{titleCase(comp.category)}</span>
                  <span className="text-warm-500 ml-2 font-light text-xs">
                    (typical: {formatMoney(comp.typicalRange.low)} - {formatMoney(comp.typicalRange.high)})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg text-warm-900">{formatMoney(comp.yourCost)}</span>
                  <p className="text-xs text-warm-500 font-light">{comp.assessment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparable Quotes */}
      {insights.comparableQuotes && (
        <div>
          <h4 className="text-xs uppercase tracking-widest text-warm-500 font-medium mb-2">Local Comparisons</h4>
          <p className="text-sm text-warm-600 leading-relaxed font-light">{insights.comparableQuotes}</p>
        </div>
      )}

      {/* Negotiation Points */}
      {insights.negotiationPoints.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-widest text-warm-500 font-medium mb-3">Negotiation Talking Points</h4>
          <ul className="space-y-2">
            {insights.negotiationPoints.map((point, i) => (
              <li key={i} className="text-sm text-warm-700 flex gap-3 font-light">
                <span className="text-gold-600 font-medium mt-0.5">&#8594;</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Explanation */}
      {insights.detailedExplanation && (
        <div>
          <h4 className="text-xs uppercase tracking-widest text-warm-500 font-medium mb-2">Detailed Analysis</h4>
          <p className="text-sm text-warm-600 whitespace-pre-line leading-relaxed font-light">{insights.detailedExplanation}</p>
        </div>
      )}
    </div>
  );
}
