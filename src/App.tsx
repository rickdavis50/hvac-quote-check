import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import type { AnalysisResult, UserCorrections, PaidInsights as PaidInsightsType } from './types';
import TopBar from './components/TopBar';
import QuoteInput from './components/QuoteInput';
import ProcessingSteps from './components/ProcessingSteps';
import ResultsCard from './components/ResultsCard';
import PaidInsights from './components/PaidInsights';
import Landing from './pages/Landing';
import LegalPage from './pages/LegalPage';
import { analyzeQuote, getQuote, recomputeQuote, unlockInsights, getInsights, type AnalyzeInput, type StageEvent } from './lib/api';
import { parseRoute, pushRoute, pushResultUrl, resultShareLink, readFairPriceQuery, type Route } from './lib/urlState';

const TeardownPage = lazy(() => import('./pages/TeardownPage'));

type CheckPhase = 'input' | 'processing';

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const [checkPhase, setCheckPhase] = useState<CheckPhase>('input');
  const [stage, setStage] = useState<StageEvent['stage'] | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [paidInsightsData, setPaidInsightsData] = useState<PaidInsightsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const navigate = useCallback((path: string) => {
    setError(null);
    pushRoute(path);
    setRoute(parseRoute());
  }, []);

  const loadStored = useCallback(async (id: string, paidReturn: boolean) => {
    setResultLoading(true);
    try {
      const stored = await getQuote(id);
      setResult(stored);
      setPaidInsightsData(stored.paidInsights);
      if (paidReturn && !stored.paidInsights) {
        try {
          setPaidInsightsData(await getInsights(id));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not load your report yet.');
        }
      }
    } catch {
      setError('That result link has expired or does not exist.');
      pushRoute('/');
      setRoute({ page: 'home' });
    } finally {
      setResultLoading(false);
    }
  }, []);

  // Load stored results on deep links; handle back/forward.
  useEffect(() => {
    if (route.page === 'result' && (!result || result.submissionId !== route.id)) {
      void loadStored(route.id, route.paidReturn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSubmit = useCallback(async (input: AnalyzeInput) => {
    setError(null);
    setCheckPhase('processing');
    setStage(null);
    try {
      const analysis = await analyzeQuote(input, (event) => setStage(event.stage));
      setResult(analysis);
      setPaidInsightsData(analysis.paidInsights);
      setCheckPhase('input');
      pushResultUrl(analysis.submissionId);
      setRoute(parseRoute());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setCheckPhase('input');
    }
  }, []);

  const handleCorrections = useCallback(async (corrections: UserCorrections) => {
    if (!result) return;
    setCorrecting(true);
    try {
      const updated = await recomputeQuote(result.submissionId, corrections);
      setResult(updated);
      setPaidInsightsData(updated.paidInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recompute failed');
    } finally {
      setCorrecting(false);
    }
  }, [result]);

  const handleUnlock = useCallback(async () => {
    if (!result) return;
    try {
      const response = await unlockInsights(result.submissionId);
      if (response.alreadyPaid) {
        setPaidInsightsData(await getInsights(result.submissionId));
      } else if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  }, [result]);

  const handleCopyLink = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(resultShareLink(result.submissionId));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [result]);

  // The teardown chamber owns its whole viewport, chrome included.
  if (route.page === 'teardown') {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-chamber text-paper/60 text-[13px]">
            Preparing the teardown…
          </div>
        }
      >
        <TeardownPage onNavigate={navigate} />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onNavigate={navigate} />

      {error && (
        <div className="mx-auto mt-4 w-full max-w-6xl px-5 sm:px-8">
          <div className="border border-verdict-high/40 bg-verdict-high/5 px-4 py-3 text-[13px] text-verdict-high">
            {error}
            <button onClick={() => setError(null)} className="ml-3 underline hover:no-underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {route.page === 'home' && (
          <Landing initialQuery={readFairPriceQuery()} onNavigate={navigate} />
        )}

        {route.page === 'legal' && <LegalPage onNavigate={navigate} />}

        {route.page === 'check' && (
          <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
            <section className="pb-8 pt-14">
              <h1 className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                Put the quote under the x-ray.
              </h1>
              <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed text-ink-soft">
                PDF, photo, or pasted text. The engine reads it, prices the same job in your
                market, and rates it Low, Fair, or High, with every factor shown.
              </p>
            </section>

            {checkPhase === 'input' && <QuoteInput onSubmit={handleSubmit} />}

            {checkPhase === 'processing' && (
              <div className="sheet px-6 py-8 sm:px-8">
                <h2 className="font-display text-2xl text-ink">Dissecting your quote…</h2>
                <ProcessingSteps currentStage={stage} />
              </div>
            )}
          </div>
        )}

        {route.page === 'result' && (
          <div className="mx-auto w-full max-w-4xl px-5 pb-24 sm:px-8">
            {resultLoading && (
              <p className="pt-20 text-center text-[13px] text-ink-mute">Retrieving the sheet…</p>
            )}
            {!resultLoading && result && (
              <div className="space-y-8 pt-10">
                <ResultsCard
                  result={result}
                  onCorrections={handleCorrections}
                  onUnlock={handleUnlock}
                  correcting={correcting}
                />

                {paidInsightsData && <PaidInsights insights={paidInsightsData} />}

                <div className="flex items-center justify-center gap-8 text-[13px]">
                  <button onClick={handleCopyLink} className="text-ink-mute transition-colors hover:text-ink">
                    {linkCopied ? 'Link copied' : 'Copy result link'}
                  </button>
                  <button
                    onClick={() => navigate('/check')}
                    className="text-ink-mute transition-colors hover:text-ink"
                  >
                    Check another quote
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="text-ink-mute transition-colors hover:text-ink"
                  >
                    Fair price lookup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-ink/15 px-5 py-6 text-[11px] text-ink-mute sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="font-display text-sm italic text-ink">Fair Air</span>
          <span>Deterministic fair pricing for US heat pumps and HVAC</span>
          <button onClick={() => navigate('/legal')} className="underline transition-colors hover:text-ink">
            Terms &amp; disclaimer
          </button>
          <span className="ml-auto">
            AI agents welcome —{' '}
            <a href="/llms.txt" className="underline hover:text-ink">llms.txt</a> ·{' '}
            <a href="/api/openapi.json" className="underline hover:text-ink">OpenAPI</a> ·{' '}
            <a href="/api/mcp" className="underline hover:text-ink">MCP</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
