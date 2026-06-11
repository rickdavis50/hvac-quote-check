import type { StageEvent } from '../lib/api';

const STAGES: Array<{ stage: StageEvent['stage']; label: string }> = [
  { stage: 'reading', label: 'Reading your document' },
  { stage: 'extracting', label: 'Extracting quote details with AI' },
  { stage: 'pricing', label: 'Pricing it against your local market' },
  { stage: 'writing', label: 'Writing your report' },
];

interface Props {
  currentStage: StageEvent['stage'] | null;
}

export default function ProcessingSteps({ currentStage }: Props) {
  const currentIndex = currentStage ? STAGES.findIndex((s) => s.stage === currentStage) : -1;

  return (
    <div className="space-y-4 py-8">
      {STAGES.map((step, i) => (
        <div key={step.stage} className="flex items-center gap-4">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
            ${i < currentIndex ? 'bg-rating-good text-cream-50' :
              i === currentIndex ? 'bg-gold-500 text-cream-50 animate-pulse' :
              'bg-cream-200 text-warm-500'}`}>
            {i < currentIndex ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : i + 1}
          </div>
          <span className={`text-sm ${i <= currentIndex ? 'text-warm-800 font-medium' : 'text-warm-500/60'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
