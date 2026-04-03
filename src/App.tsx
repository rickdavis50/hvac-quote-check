import { useState, useCallback } from 'react';
import type { AnalysisResult, UserCorrections, PaidInsights as PaidInsightsType } from './types';
import UploadZone from './components/UploadZone';
import ProcessingSteps from './components/ProcessingSteps';
import ResultsCard from './components/ResultsCard';
import PaidInsights from './components/PaidInsights';
import { uploadQuote, recomputeQuote, unlockInsights, getInsights } from './lib/api';

type Screen = 'upload' | 'processing' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [paidInsightsData, setPaidInsightsData] = useState<PaidInsightsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setScreen('processing');
    setProcessingStep(0);

    try {
      // Simulate step progression
      setProcessingStep(1);
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStep(2);

      const analysis = await uploadQuote(file);

      setProcessingStep(3);
      await new Promise((r) => setTimeout(r, 300));

      setResult(analysis);
      setScreen('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setScreen('upload');
    }
  }, []);

  const handleCorrections = useCallback(async (corrections: UserCorrections) => {
    if (!result) return;
    setCorrecting(true);
    try {
      const updated = await recomputeQuote(result.submissionId, corrections);
      setResult(updated);
      setPaidInsightsData(null);
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
        const insights = await getInsights(result.submissionId);
        setPaidInsightsData(insights);
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
    setProcessingStep(0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HVAC Price Agent</h1>
          <p className="text-gray-500 mt-1">Upload your quote. Get the truth.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline">Dismiss</button>
          </div>
        )}

        {/* Screens */}
        {screen === 'upload' && (
          <UploadZone onFileSelected={handleUpload} disabled={false} />
        )}

        {screen === 'processing' && (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-lg font-semibold text-gray-900">Analyzing your quote...</h2>
            <ProcessingSteps currentStep={processingStep} />
          </div>
        )}

        {screen === 'results' && result && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
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

            <button
              onClick={handleReset}
              className="w-full py-3 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Analyze another quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
