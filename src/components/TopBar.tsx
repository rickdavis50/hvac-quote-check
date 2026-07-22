interface Props {
  onNavigate: (path: string) => void;
  dark?: boolean;
}

export default function TopBar({ onNavigate, dark = false }: Props) {
  const tone = dark ? 'text-paper' : 'text-ink';
  const mute = dark ? 'text-paper/60 hover:text-paper' : 'text-ink-mute hover:text-ink';
  return (
    <header className={`flex items-baseline justify-between px-5 py-4 sm:px-8 ${tone}`}>
      <button onClick={() => onNavigate('/')} className="font-display text-xl italic tracking-tight">
        Quote Check
      </button>
      <nav className="flex items-baseline gap-5 text-[12px] sm:gap-7">
        <button onClick={() => onNavigate('/teardown')} className={`${mute} transition-colors`}>
          Teardown
        </button>
        <button onClick={() => onNavigate('/check')} className={`${mute} transition-colors`}>
          Check a quote
        </button>
        <a href="/llms.txt" className={`hidden ${mute} transition-colors sm:inline`}>
          For AI agents
        </a>
      </nav>
    </header>
  );
}
