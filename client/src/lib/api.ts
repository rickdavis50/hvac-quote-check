import type { AnalysisResponse } from "@shared/analysis";

type AnalyzeOptions = {
  file: File;
  options: Record<string, unknown>;
  onStep?: (step: string) => void;
};

export async function analyzeQuote({ file, options, onStep }: AnalyzeOptions) {
  return await analyzeOnce({ file, options, onStep });
}

async function analyzeOnce({
  file,
  options,
  onStep
}: AnalyzeOptions): Promise<AnalysisResponse> {
  onStep?.("Parse");
  const body = new FormData();
  body.append("file", file);
  if (Object.keys(options).length > 0) {
    body.append("options", JSON.stringify(options));
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    body
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  const data = await response.json();
  return data as AnalysisResponse;
}
