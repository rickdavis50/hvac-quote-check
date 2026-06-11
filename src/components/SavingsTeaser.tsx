import { formatMoney } from '../lib/format';

interface Props {
  savingsPotential: number;
  onUnlock: () => void;
}

// Locked-content preview. The savings figure is real (free tier); the blurred
// area is a neutral skeleton — we don't fabricate numbers behind the blur.
export default function SavingsTeaser({ savingsPotential, onUnlock }: Props) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-rating-high/15">
      <div className="bg-rating-high/8 px-8 py-5 border-b border-rating-high/10">
        <p className="text-xs uppercase tracking-widest text-rating-high/70 font-medium">Potential savings</p>
        <p className="font-serif text-3xl text-rating-high mt-0.5">
          {formatMoney(savingsPotential)}
        </p>
      </div>

      <div className="relative">
        <div className="px-8 py-6 space-y-6 select-none" aria-hidden="true">
          <div>
            <h4 className="text-xs uppercase tracking-widest text-warm-500 font-medium mb-3">Component Breakdown</h4>
            <div className="space-y-3">
              {[68, 54, 73, 47].map((width, i) => (
                <div key={i} className="flex items-center justify-between border-b border-cream-200 pb-3">
                  <div className="h-3.5 rounded bg-warm-500/15" style={{ width: `${width}%` }} />
                  <div className="h-3.5 w-16 rounded bg-warm-500/20" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-warm-500 font-medium mb-3">Negotiation Talking Points</h4>
            <div className="space-y-2.5">
              {[88, 76, 82].map((width, i) => (
                <div key={i} className="h-3.5 rounded bg-warm-500/15" style={{ width: `${width}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 backdrop-blur-[5px] bg-gradient-to-b from-cream-50/40 via-cream-50/65 to-cream-50/95" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <div className="text-center space-y-4">
            <div>
              <p className="font-serif text-xl text-warm-900">See exactly where you're overpaying</p>
              <p className="text-sm text-warm-500 mt-1 font-light">
                Component-by-component breakdown and negotiation scripts for this quote
              </p>
            </div>
            <button
              onClick={onUnlock}
              className="px-10 py-3.5 bg-warm-700 text-cream-50 rounded-xl font-medium text-sm hover:bg-warm-800 transition-all tracking-wide shadow-md hover:shadow-lg"
            >
              Unlock savings report — $9
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
