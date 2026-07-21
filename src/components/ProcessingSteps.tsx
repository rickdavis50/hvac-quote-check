import type { StageEvent } from '../lib/api';

const STAGES: Array<{ stage: StageEvent['stage']; label: string }> = [
  { stage: 'reading', label: 'Reading the document' },
  { stage: 'extracting', label: 'Extracting the line items' },
  { stage: 'pricing', label: 'Pricing the same job in your market' },
  { stage: 'writing', label: 'Writing the findings' },
];

interface Props {
  currentStage: StageEvent['stage'] | null;
}

export default function ProcessingSteps({ currentStage }: Props) {
  const currentIndex = currentStage ? STAGES.findIndex((s) => s.stage === currentStage) : -1;

  return (
    <ul className="space-y-3 py-6 text-[13px]">
      {STAGES.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.stage} className="flex items-baseline gap-4">
            <span
              className={`w-8 shrink-0 tabular-nums text-[11px] tracking-micro ${
                done ? 'text-copper-deep' : active ? 'text-copper' : 'text-ink-faint'
              }`}
            >
              {done ? '━━' : active ? '►' : `0${i + 1}`}
            </span>
            <span className={done ? 'text-ink-mute line-through decoration-ink/30' : active ? 'text-ink' : 'text-ink-faint'}>
              {step.label}
              {active && <span className="ml-2 animate-pulse text-copper">…</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
