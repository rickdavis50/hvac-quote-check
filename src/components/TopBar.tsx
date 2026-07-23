interface Props {
  onNavigate: (path: string) => void;
  dark?: boolean;
}

const MOTTO = 'Pricing transparency for HVAC';

export default function TopBar({ onNavigate, dark = false }: Props) {
  const tone = dark ? 'text-paper' : 'text-ink';
  const mute = dark ? 'text-paper/60 hover:text-paper' : 'text-ink-mute hover:text-ink';
  const motto = dark ? 'text-paper/55' : 'text-ink-mute';
  const rule = dark ? 'text-paper/30' : 'text-ink-faint';
  return (
    <header className={`px-5 py-4 sm:px-8 ${tone}`}>
      <div className="flex items-baseline justify-between gap-4">
        {/* Masthead lockup: wordmark + mission motto (motto is inline on desktop) */}
        <div className="flex items-baseline gap-3">
          <button onClick={() => onNavigate('/')} className="font-display text-xl italic tracking-tight">
            Quote Check
          </button>
          <span className={`hidden sm:inline ${rule}`} aria-hidden>·</span>
          <span className={`hidden text-[11px] uppercase tracking-micro sm:inline ${motto}`}>{MOTTO}</span>
        </div>
        <nav className="flex items-baseline gap-4 text-[12px] sm:gap-6">
          <button onClick={() => onNavigate('/guide')} className={`${mute} transition-colors`}>
            Guide
          </button>
          <button onClick={() => onNavigate('/teardown')} className={`${mute} transition-colors`}>
            Teardown
          </button>
          <button onClick={() => onNavigate('/#fair-price')} className={`${mute} transition-colors`}>
            Fair price
          </button>
        </nav>
      </div>
      {/* On mobile the motto drops to its own row so it never crowds the nav. */}
      <p className={`mt-1.5 text-[10px] uppercase tracking-normal sm:hidden ${motto}`}>{MOTTO}</p>
    </header>
  );
}
