import { formatMoney } from '../lib/format';

interface Props {
  savingsPotential: number;
  onUnlock: () => void;
}

// Locked-content preview. The savings figure is real (free tier); the blurred
// area is a neutral skeleton — we don't fabricate numbers behind the blur.
export default function SavingsTeaser({ savingsPotential, onUnlock }: Props) {
  return (
    <div className="relative overflow-hidden border border-verdict-high/40">
      <div className="border-b border-verdict-high/30 bg-verdict-high/5 px-6 py-4 sm:px-8">
        <p className="text-[11px] uppercase tracking-micro text-verdict-high/80">
          Left on the table
        </p>
        <p className="mt-1 font-display text-4xl tracking-tight text-verdict-high">
          {formatMoney(savingsPotential)}
        </p>
      </div>

      <div className="relative">
        <div className="select-none space-y-6 px-6 py-6 sm:px-8" aria-hidden="true">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-micro text-ink-mute">Line-item verdicts</p>
            <div className="space-y-3">
              {[68, 54, 73, 47].map((width, i) => (
                <div key={i} className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <div className="h-3 bg-ink/15" style={{ width: `${width}%` }} />
                  <div className="h-3 w-16 bg-ink/20" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-micro text-ink-mute">What to say to the contractor</p>
            <div className="space-y-2.5">
              {[88, 76, 82].map((width, i) => (
                <div key={i} className="h-3 bg-ink/15" style={{ width: `${width}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/70 to-paper backdrop-blur-[5px]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <p className="font-display text-2xl text-ink">The itemized case, line by line</p>
          <p className="mt-1.5 max-w-[40ch] text-[12px] text-ink-mute">
            Which line items are inflated, by how much, and the exact sentences to say before you sign.
          </p>
          <button onClick={onUnlock} className="btn-ink mt-5">
            Open the full report — $9
          </button>
          <p className="mt-2 text-[11px] text-ink-faint">
            One payment. No account, no subscription, no phone number.
          </p>
        </div>
      </div>
    </div>
  );
}
