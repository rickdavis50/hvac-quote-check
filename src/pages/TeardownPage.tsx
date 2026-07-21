import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import HeatPumpScene from '../components/teardown/HeatPumpScene';
import { CHAPTERS } from '../data/teardownChapters';

interface Props {
  onNavigate: (path: string) => void;
}

const LAST = CHAPTERS.length - 1; // chapterFloat runs 0..7

export default function TeardownPage({ onNavigate }: Props) {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const runwayRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef(0);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [zip, setZip] = useState('');

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = runwayRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / total));
        chapterRef.current = progress * LAST;
        const idx = Math.min(LAST, Math.round(chapterRef.current));
        setChapterIdx((prev) => (prev === idx ? prev : idx));
        setProgressPct((prev) => {
          const next = Math.round(progress * 100);
          return prev === next ? prev : next;
        });
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const goFairPrice = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      onNavigate(/^\d{5}$/.test(zip) ? `/?zip=${zip}` : '/');
    },
    [onNavigate, zip]
  );

  const chapter = CHAPTERS[chapterIdx];

  return (
    <div className="bg-chamber text-paper">
      {/* Chrome stays outside the scrubbed zone; both exits always reachable. */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-baseline justify-between px-5 py-4 sm:px-8">
        <button onClick={() => onNavigate('/')} className="font-display text-xl italic tracking-tight text-paper">
          Fair Air
        </button>
        <button
          onClick={() => goFairPrice()}
          className="text-[12px] text-paper/60 transition-colors hover:text-paper"
        >
          Skip to the fair price →
        </button>
      </header>

      {reducedMotion ? (
        /* Reduced motion: the full constellation held still, chapters as plain text. */
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-20 sm:px-8">
          <div className="h-[52vh]">
            <Canvas dpr={[1, 1.5]} camera={{ fov: 42, position: [6.4, 3.5, 6.4] }} frameloop="always">
              <HeatPumpScene chapterRef={chapterRef} staticPose />
            </Canvas>
          </div>
          <ol className="mt-10 space-y-10">
            {CHAPTERS.map((ch) => (
              <li key={ch.fig}>
                <p className="text-[11px] uppercase tracking-micro text-copper-bright">Fig. {ch.fig} / {LAST}</p>
                <h2 className="mt-1 font-display text-3xl text-paper">{ch.title}</h2>
                <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-paper/75">{ch.body}</p>
                {ch.priceLine && <p className="mt-2 text-[12px] text-copper-bright">{ch.priceLine}</p>}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        /* The runway: scroll scrubs the dissection inside the sticky viewport. */
        <div ref={runwayRef} style={{ height: `${(LAST + 1) * 110}vh` }} className="relative">
          <div className="sticky top-0 h-screen overflow-hidden">
            <Canvas dpr={[1, 2]} camera={{ fov: 42, position: [4.4, 2.7, 5.4] }}>
              <HeatPumpScene chapterRef={chapterRef} />
            </Canvas>

            {/* Chapter card — never overlaid on the machine's center (NN/g). */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-5 lg:inset-x-auto lg:left-8 lg:top-1/2 lg:w-[26rem] lg:-translate-y-1/2 lg:p-0">
              <div key={chapter.fig} className="animate-[fadein_600ms_ease_both] border-l border-copper/60 bg-chamber/85 py-3 pl-5 pr-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-micro text-copper-bright">
                  Fig. {chapter.fig} / {LAST}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-tight text-paper sm:text-4xl">
                  {chapter.title}
                </h2>
                <p className="mt-3 max-w-[46ch] text-[13px] leading-relaxed text-paper/75">
                  {chapter.body}
                </p>
                {chapter.priceLine && (
                  <p className="mt-3 text-[12px] tabular-nums text-copper-bright">{chapter.priceLine}</p>
                )}
              </div>
            </div>

            {/* Progress rail */}
            <div className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 lg:block" aria-hidden="true">
              <div className="relative h-56 w-px bg-paper/20">
                <div className="absolute left-0 top-0 w-px bg-copper" style={{ height: `${progressPct}%` }} />
              </div>
              <p className="mt-3 -translate-x-1/2 text-center text-[10px] tabular-nums text-paper/50">
                {String(progressPct).padStart(2, '0')}%
              </p>
            </div>

            {/* Scroll cue, first chapter only */}
            {chapterIdx === 0 && (
              <p className="absolute left-1/2 top-24 z-10 -translate-x-1/2 animate-pulse text-[11px] uppercase tracking-micro text-paper/50 lg:top-auto lg:bottom-8">
                scroll to dissect
              </p>
            )}
          </div>
        </div>
      )}

      {/* Exit — paper resumes, CTA outside the scrubbed zone. */}
      <section className="bg-paper px-5 py-20 text-ink sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="max-w-[22ch] font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            The machine is knowable. So is the price.
          </h2>
          <p className="mt-5 max-w-[54ch] text-[14px] leading-relaxed text-ink-soft">
            Same deterministic engine, pointed at your market: the fair installed range for a
            heat pump in your ZIP code, with every factor shown.
          </p>
          <form onSubmit={goFairPrice} className="mt-8 flex flex-wrap items-end gap-4">
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-micro text-ink-mute">Job-site ZIP</span>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                inputMode="numeric"
                placeholder="98109"
                className="w-36 border border-ink/40 bg-paper px-3 py-2 font-mono text-2xl tracking-[0.2em] text-ink placeholder:text-ink-faint focus:border-copper"
                aria-label="Five-digit ZIP code"
              />
            </label>
            <button type="submit" className="btn-ink">Show me the number</button>
            <button type="button" onClick={() => onNavigate('/check')} className="btn-line">
              I already have a quote
            </button>
          </form>
        </div>
      </section>

      <style>{`@keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
