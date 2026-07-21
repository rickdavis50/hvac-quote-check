import { useCallback, useEffect, useRef, useState } from 'react';
import type { FairPriceEstimate } from '../types';
import { getFairPrice } from '../lib/api';
import { writeFairPriceQuery, type FairPriceQuery } from '../lib/urlState';
import { formatMoney } from '../lib/format';
import FactorReceipt from './FactorReceipt';

const SYSTEM_OPTIONS = [
  { value: 'central_heat_pump', label: 'Central heat pump (ducted)' },
  { value: 'heat_pump_split', label: 'Heat pump + air handler' },
  { value: 'mini_split', label: 'Mini-split (ductless)' },
] as const;

const TONNAGE_OPTIONS = [1.5, 2, 2.5, 3, 3.5, 4, 5] as const;

interface Props {
  initial?: Partial<FairPriceQuery>;
  onNavigate: (path: string) => void;
}

export default function FairPriceTool({ initial, onNavigate }: Props) {
  const [zip, setZip] = useState(initial?.zip ?? '');
  const [systemType, setSystemType] = useState(initial?.systemType ?? 'central_heat_pump');
  const [tonnage, setTonnage] = useState(initial?.tonnage ?? 3);
  const [qualityTier, setQualityTier] = useState(initial?.qualityTier ?? 'mid');
  const [ductwork, setDuctwork] = useState(initial?.ductwork ?? false);
  const [electrical, setElectrical] = useState(initial?.electrical ?? true);
  const [permits, setPermits] = useState(initial?.permits ?? true);

  const [estimate, setEstimate] = useState<FairPriceEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const ranOnce = useRef(false);

  const run = useCallback(
    async (params: FairPriceQuery) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getFairPrice(params);
        setEstimate(result);
        writeFairPriceQuery(params);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Estimate failed');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const currentParams = useCallback(
    (): FairPriceQuery => ({ zip, systemType, tonnage, qualityTier, ductwork, electrical, permits }),
    [zip, systemType, tonnage, qualityTier, ductwork, electrical, permits]
  );

  // Shared links (/?zip=...) compute on load.
  useEffect(() => {
    if (initial?.zip && /^\d{5}$/.test(initial.zip) && !ranOnce.current) {
      ranOnce.current = true;
      void run(currentParams());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refinements re-price instantly once a number exists.
  useEffect(() => {
    if (estimate && /^\d{5}$/.test(zip)) void run(currentParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemType, tonnage, qualityTier, ductwork, electrical, permits]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!/^\d{5}$/.test(zip)) {
        setError('Five digits. That is all we ask for.');
        return;
      }
      void run(currentParams());
    },
    [zip, run, currentParams]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, []);

  return (
    <div className="sheet">
      <div className="sheet-titleblock">
        <span>Sheet Nº 001 — fair price inquiry</span>
        <span>engine: deterministic</span>
        {estimate && <span>method v{estimate.methodologyVersion}</span>}
        <span className="ml-auto">no phone number. ever.</span>
      </div>

      <div className="px-5 py-8 sm:px-8 sm:py-10">
        {/* ZIP entry */}
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-micro text-ink-mute">
              Job-site ZIP
            </span>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              inputMode="numeric"
              placeholder="98109"
              className="w-36 border border-ink/40 bg-paper px-3 py-2 font-mono text-2xl tracking-[0.2em] text-ink placeholder:text-ink-faint focus:border-copper"
              aria-label="Five-digit ZIP code"
            />
          </label>
          <button type="submit" className="btn-ink" disabled={loading}>
            {loading && !estimate ? 'Pricing…' : 'Show me the number'}
          </button>
          {!estimate && (
            <p className="w-full text-[12px] text-ink-mute sm:w-auto sm:max-w-[26ch]">
              The fair installed price of a heat pump in your market. Before anyone calls you.
            </p>
          )}
        </form>

        {error && <p className="mt-4 text-[13px] text-verdict-high">{error}</p>}

        {/* The number */}
        {estimate && (
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-micro text-ink-mute">
                Fair installed price · {estimate.resolved.metro ?? `${estimate.resolved.state} (state average)`}
              </p>
              {/* The one deliberate transgression: these digits break the sheet frame. */}
              <div className={`relative lg:-mr-24 ${loading ? 'opacity-50' : ''} transition-opacity`}>
                <p className="mt-3 font-display text-[13vw] leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl xl:text-[84px]">
                  {formatMoney(estimate.fairRange.low)}
                  <span className="text-ink-faint">–</span>
                  {formatMoney(estimate.fairRange.high)}
                </p>
              </div>
              <p className="mt-4 font-mono text-[13px] text-copper-deep">
                midpoint {formatMoney(estimate.fairRange.mid)} · confidence {estimate.confidence} ·{' '}
                {estimate.dataQuality.geographyPrecision}-level data
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => onNavigate('/check')} className="btn-ink">
                  Check a quote against this
                </button>
                <button onClick={() => onNavigate('/teardown')} className="btn-line">
                  See inside the machine
                </button>
                <button onClick={handleCopy} className="btn-line">
                  {linkCopied ? 'Link copied' : 'Copy this sheet'}
                </button>
              </div>

              {/* Refinements — revealed once a number exists; each change re-prices instantly. */}
              <fieldset className="mt-10 border-t border-ink/15 pt-6">
                <legend className="sr-only">Refine the estimate</legend>
                <p className="mb-4 text-[11px] uppercase tracking-micro text-ink-mute">
                  Sharpen it — every change re-prices instantly
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-[13px]">
                  <label className="block">
                    <span className="mb-1 block text-[11px] text-ink-mute">System</span>
                    <select
                      value={systemType}
                      onChange={(e) => setSystemType(e.target.value)}
                      className="border-b border-ink/40 bg-transparent py-1 pr-6 text-ink focus:border-copper"
                    >
                      {SYSTEM_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] text-ink-mute">Size</span>
                    <select
                      value={tonnage}
                      onChange={(e) => setTonnage(Number(e.target.value))}
                      className="border-b border-ink/40 bg-transparent py-1 pr-6 text-ink focus:border-copper"
                    >
                      {TONNAGE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t} tons{t === 3 ? ' (typical)' : ''}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] text-ink-mute">Equipment tier</span>
                    <select
                      value={qualityTier}
                      onChange={(e) => setQualityTier(e.target.value)}
                      className="border-b border-ink/40 bg-transparent py-1 pr-6 text-ink focus:border-copper"
                    >
                      <option value="budget">Budget</option>
                      <option value="mid">Mid</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>
                  <div className="flex items-end gap-5">
                    {(
                      [
                        ['Electrical', electrical, setElectrical],
                        ['Permits', permits, setPermits],
                        ['New ductwork', ductwork, setDuctwork],
                      ] as const
                    ).map(([label, value, set]) => (
                      <label key={label} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => set(e.target.checked)}
                          className="h-3.5 w-3.5 accent-copper"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
            </div>

            {/* The receipt rail */}
            <aside className="border-t border-ink/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <FactorReceipt
                factors={estimate.factors}
                fairRange={estimate.fairRange}
                methodologyVersion={estimate.methodologyVersion}
              />
              {estimate.marketContext.comparableCount >= 5 && (
                <p className="mt-4 text-[11px] text-ink-mute">
                  Blended with {estimate.marketContext.comparableCount} real homeowner quotes near you.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
