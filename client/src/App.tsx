import { useCallback, useEffect, useReducer, useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { AnalysisResponse } from "@shared/analysis";
import { analyzeQuote } from "./lib/api";
import AnalyzingSkull from "./components/AnalyzingSkull";
import { formatMoney, formatRange } from "./lib/format";

type Status = "idle" | "uploading" | "analyzing" | "result" | "error";

type State = {
  status: Status;
  file?: File;
  stepIndex: number;
  result?: AnalysisResponse;
  error?: string;
};

type Action =
  | { type: "SET_FILE"; file?: File }
  | { type: "START" }
  | { type: "STEP"; stepIndex: number }
  | { type: "RESULT"; result: AnalysisResponse }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

const steps = ["Parse", "Scope", "Estimate", "Zip adjust", "Score"];

const initialState: State = {
  status: "idle",
  stepIndex: 0
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.file };
    case "START":
      return {
        ...state,
        status: "uploading",
        stepIndex: 0,
        result: undefined,
        error: undefined
      };
    case "STEP":
      return {
        ...state,
        status: "analyzing",
        stepIndex: action.stepIndex
      };
    case "RESULT":
      return {
        ...state,
        status: "result",
        result: action.result
      };
    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.error
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const autoStartRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const stepIndexRef = useRef(0);

  const startAnalysis = useCallback(async () => {
    if (!state.file || state.status === "uploading") return;

    dispatch({ type: "START" });
    autoStartRef.current = true;

    try {
      const result = await analyzeQuote({
        file: state.file,
        options: {},
        onStep: (step) => {
          const index = steps.findIndex((s) => s.toLowerCase() === step.toLowerCase());
          if (index >= 0) {
            dispatch({ type: "STEP", stepIndex: index });
          }
        }
      });
      dispatch({ type: "RESULT", result });
    } catch (error) {
      dispatch({
        type: "ERROR",
        error: error instanceof Error ? error.message : "Analysis failed"
      });
    }
  }, [state.file, state.status]);

  useEffect(() => {
    if (state.file && state.status === "idle" && !autoStartRef.current) {
      startAnalysis();
    }
  }, [state.file, state.status, startAnalysis]);

  useEffect(() => {
    stepIndexRef.current = state.stepIndex;
  }, [state.stepIndex]);

  useEffect(() => {
    if (state.status !== "uploading" && state.status !== "analyzing") {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      dispatch({
        type: "STEP",
        stepIndex: Math.min(stepIndexRef.current + 1, steps.length - 1)
      });
    }, 1400);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [state.status]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      dispatch({ type: "SET_FILE", file: dropped });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      dispatch({ type: "SET_FILE", file: selected });
    }
  };

  const handleCopy = async () => {
    if (!state.result) return;
    const { label, exp, total, drivers, asks, conf, zip } = state.result;
    const text = [
      `HVAC Quote Fairness Checker`,
      `Request ID: ${state.result.id}`,
      `ZIP: ${zip || "Not found"}`,
      `Quote is ${formatLabel(label)}`,
      `Expected Range: ${formatRange(exp.lo, exp.hi)}`,
      `Quote Total: ${formatMoney(total)}`,
      `Key Drivers: ${drivers.join("; ")}`,
      `Questions: ${asks.join("; ")}`,
      `Negotiation Tip: ${negotiationTip(label)}`
    ].join("\n");

    await navigator.clipboard.writeText(text);
  };

  const resetAll = () => {
    autoStartRef.current = false;
    dispatch({ type: "RESET" });
  };

  return (
    <div className="min-h-screen bg-base px-6 py-10 text-ink">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.25em] text-muted">
            HVAC Quote Fairness Checker
          </span>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Get a fast, ZIP-aware fairness check on your HVAC quote.
          </h1>
          <p className="max-w-2xl text-muted">
            Upload the quote and we will infer the ZIP, extract scope, and summarize what
            stands out at your location.
          </p>
        </header>

        <div className="space-y-10">
          {state.status === "idle" && (
            <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div
                  className="flex h-56 flex-col items-center justify-center rounded-2xl bg-[#f2f2f2] text-center transition duration-200 hover:bg-[#ededed]"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    className="hidden"
                    id="quote-upload"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="quote-upload" className="cursor-pointer">
                    <div className="text-lg font-medium">Drop your quote here</div>
                    <div className="text-sm text-muted">PDF, PNG, or JPG</div>
                    {state.file && (
                      <div className="mt-4 text-sm text-ink">{state.file.name}</div>
                    )}
                  </label>
                </div>

                <button
                  className="inline-flex items-center justify-center rounded-2xl bg-[#111111] px-6 py-4 text-base font-semibold text-[#f0f0f0] transition duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={startAnalysis}
                  disabled={!state.file}
                >
                  Analyze Quote
                </button>

                <p className="text-xs text-muted">
                  ZIP and metro multipliers are inferred directly from the quote details. We
                  never store your files.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <img
                  src="/skull-hvac.png"
                  alt="HVAC illustration"
                  className="max-h-[420px] w-full object-contain"
                />
              </div>
            </section>
          )}

          {(state.status === "uploading" || state.status === "analyzing") && (
            <section>
              <AnalyzingSkull
                stepIndex={state.stepIndex}
                stepLabel={steps[state.stepIndex] ?? "Analyzing"}
                fileName={state.file?.name}
              />
            </section>
          )}

          {state.status === "result" && state.result && (
            <section className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-line bg-[#fafafa] p-5">
                  <div className="text-xs uppercase text-muted">Quote is</div>
                  <div className="mt-3 text-3xl font-semibold">
                    {formatLabel(state.result.label)}
                  </div>
                </div>
                <div className="rounded-2xl border border-line bg-[#fafafa] p-5">
                  <div className="text-xs uppercase text-muted">Expected range</div>
                  <div className="mt-3">
                    <span className="text-lg font-semibold">
                      {formatRange(state.result.exp.lo, state.result.exp.hi)}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-line bg-[#fafafa] p-5">
                  <div className="text-xs uppercase text-muted">Quote total</div>
                  <div className="mt-3 text-xl font-semibold">
                    {formatMoney(state.result.total)}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <details className="rounded-2xl border border-line bg-[#fafafa] p-5" open>
                  <summary className="cursor-pointer text-sm font-semibold">
                    What we found in your quote
                  </summary>
                  <div className="mt-4 space-y-4 text-sm text-muted">
                    <div>
                      <div className="text-xs uppercase">Equipment</div>
                      <ul className="mt-2 space-y-1">
                        {(state.result.equip?.length ?? 0) === 0 && (
                          <li>None detected</li>
                        )}
                        {(state.result.equip ?? []).map((item, idx) => (
                          <li key={idx}>
                            {item.role} {item.brand ?? ""} {item.model ?? ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase">Line items</div>
                      <ul className="mt-2 space-y-1">
                        {(state.result.items ?? []).length === 0 && (
                          <li>No line items detected</li>
                        )}
                        {(state.result.items ?? []).map((item, idx) => (
                          <li key={idx}>
                            {item.label} {item.amt ? `(${formatMoney(item.amt)})` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>

                <details className="rounded-2xl border border-line bg-[#fafafa] p-5" open>
                  <summary className="cursor-pointer text-sm font-semibold">
                    Questions to ask
                  </summary>
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {state.result.asks.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                    <li>• {negotiationTip(state.result.label)}</li>
                  </ul>
                </details>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  className="rounded-xl border border-line bg-white px-4 py-2 text-sm"
                  onClick={resetAll}
                >
                  Start over
                </button>
                <button
                  className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleCopy}
                >
                  Copy report
                </button>
              </div>
            </section>
          )}

          {state.status === "error" && (
            <section className="space-y-5">
              <div className="text-lg font-semibold">We hit a snag.</div>
              <div className="rounded-2xl border border-line bg-[#fafafa] p-5 text-sm text-muted">
                {state.error}
              </div>
              <div className="flex gap-3">
                <button
                  className="rounded-xl border border-line bg-white px-4 py-2 text-sm"
                  onClick={resetAll}
                >
                  Start over
                </button>
                <button
                  className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
                  onClick={startAnalysis}
                  disabled={!state.file}
                >
                  Retry
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function badgeClass(classification: AnalysisResponse["label"]) {
  const base = "rounded-full px-3 py-1 text-xs font-semibold";
  switch (classification) {
    case "UNDER":
      return `${base} bg-[#eeeeee] text-[#1a1a1a]`;
    case "FAIR":
      return `${base} bg-[#f2f2f2] text-[#222222]`;
    case "HIGH":
    case "EXTREME":
      return `${base} bg-[#e6e6e6] text-[#1f1f1f]`;
    default:
      return base;
  }
}

function formatLabel(label: AnalysisResponse["label"]) {
  if (label === "UNDER") return "Low";
  if (label === "FAIR") return "Fair";
  return "High";
}

function negotiationTip(label: AnalysisResponse["label"]) {
  const normalized = formatLabel(label);
  if (normalized === "Low") {
    return "If you move fast, ask for a small concession or upgraded warranty.";
  }
  if (normalized === "Fair") {
    return "Ask for a written line-item breakdown and request a modest 5–8% adjustment.";
  }
  return "Ask for at least two competitive bids and request a clear equipment/labor split.";
}
