import { useCallback, useEffect, useState } from 'react';
import type { AnalysisResult, UserCorrections, PaidInsights as PaidInsightsType } from './types';
import QuoteInput from './components/QuoteInput';
import ProcessingSteps from './components/ProcessingSteps';
import ResultsCard from './components/ResultsCard';
import PaidInsights from './components/PaidInsights';
import { analyzeQuote, getQuote, recomputeQuote, unlockInsights, getInsights, type AnalyzeInput, type StageEvent } from './lib/api';
import { readResultUrl, pushResultUrl, pushHomeUrl, resultShareLink } from './lib/urlState';

type Screen = 'upload' | 'processing' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [stage, setStage] = useState<StageEvent['stage'] | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [paidInsightsData, setPaidInsightsData] = useState<PaidInsightsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const loadStored = useCallback(async (id: string, paidReturn: boolean) => {
    try {
      const stored = await getQuote(id);
      setResult(stored);
      setPaidInsightsData(stored.paidInsights);
      setScreen('results');
      if (paidReturn && !stored.paidInsights) {
        try {
          setPaidInsightsData(await getInsights(id));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not load your report yet.');
        }
      }
    } catch {
      setError('That result link has expired or does not exist.');
      setScreen('upload');
      pushHomeUrl();
    }
  }, []);

  // Result permalinks: load on first visit, handle back/forward.
  useEffect(() => {
    const { id, paidReturn } = readResultUrl();
    if (id) void loadStored(id, paidReturn);

    const onPopState = () => {
      const { id: poppedId } = readResultUrl();
      if (poppedId) {
        void loadStored(poppedId, false);
      } else {
        setScreen('upload');
        setResult(null);
        setPaidInsightsData(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [loadStored]);

  const handleSubmit = useCallback(async (input: AnalyzeInput) => {
    setError(null);
    setScreen('processing');
    setStage(null);

    try {
      const analysis = await analyzeQuote(input, (event) => setStage(event.stage));
      setResult(analysis);
      setPaidInsightsData(analysis.paidInsights);
      setScreen('results');
      pushResultUrl(analysis.submissionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setScreen('upload');
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

  const handleReset = useCallback(() => {
    setScreen('upload');
    setResult(null);
    setPaidInsightsData(null);
    setError(null);
    setStage(null);
    pushHomeUrl();
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(resultShareLink(result.submissionId));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-2xl w-full mx-auto px-6 py-16 flex-1">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-warm-900 tracking-tight">
            HVAC Quote Check
          </h1>
          <p className="text-warm-500 mt-3 text-lg font-light tracking-wide">
            Upload your quote. Get the truth.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-rating-high/10 border border-rating-high/20 rounded-lg text-rating-high text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline hover:no-underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Screens */}
        {screen === 'upload' && (
          <QuoteInput onSubmit={handleSubmit} disabled={false} />
        )}

        {screen === 'processing' && (
          <div className="bg-cream-50 rounded-2xl border border-cream-300 p-10">
            <h2 className="font-serif text-2xl text-warm-900">Analyzing your quote…</h2>
            <ProcessingSteps currentStage={stage} />
          </div>
        )}

        {screen === 'results' && result && (
          <div className="space-y-8">
            <div className="bg-cream-50 rounded-2xl border border-cream-300 p-8">
              <ResultsCard
                result={result}
                onCorrections={handleCorrections}
                onUnlock={handleUnlock}
                correcting={correcting}
              />
            </div>

            {paidInsightsData && (
              <PaidInsights insights={paidInsightsData} />
            )}

            <div className="flex items-center justify-center gap-8 text-sm">
              <button
                onClick={handleCopyLink}
                className="text-warm-500 hover:text-warm-800 font-medium transition-colors"
              >
                {linkCopied ? 'Link copied' : 'Copy result link'}
              </button>
              <button
                onClick={handleReset}
                className="text-warm-500 hover:text-warm-800 font-medium transition-colors"
              >
                Analyze another quote
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center pb-8 text-xs text-warm-500/70 font-light">
        Free fair-price analysis for US HVAC quotes · AI agents welcome —{' '}
        <a href="/llms.txt" className="underline hover:text-warm-700 transition-colors">llms.txt</a>
        {' '}·{' '}
        <a href="/api/openapi.json" className="underline hover:text-warm-700 transition-colors">API</a>
      </footer>
    </div>
  );
}
