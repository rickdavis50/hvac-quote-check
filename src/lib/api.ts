import type { AnalysisResult, UserCorrections, PaidInsights, FairPriceEstimate } from '../types';

const API_BASE = '/api';

export interface FairPriceParams {
  zip: string;
  systemType?: string;
  tonnage?: number;
  qualityTier?: string;
  ductwork?: boolean;
  electrical?: boolean;
  permits?: boolean;
}

export async function getFairPrice(params: FairPriceParams): Promise<FairPriceEstimate> {
  const q = new URLSearchParams({ zip: params.zip });
  if (params.systemType) q.set('systemType', params.systemType);
  if (params.tonnage !== undefined) q.set('tonnage', String(params.tonnage));
  if (params.qualityTier) q.set('qualityTier', params.qualityTier);
  if (params.ductwork !== undefined) q.set('ductwork', params.ductwork ? '1' : '0');
  if (params.electrical !== undefined) q.set('electrical', params.electrical ? '1' : '0');
  if (params.permits !== undefined) q.set('permits', params.permits ? '1' : '0');

  const res = await fetch(`${API_BASE}/fair-price?${q.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Estimate failed' }));
    throw new Error(err.error ?? 'Estimate failed');
  }
  return res.json();
}

export interface AnalyzeInput {
  file?: File;
  text?: string;
  zipCode?: string;
}

export interface StageEvent {
  stage: 'reading' | 'extracting' | 'pricing' | 'writing';
  label: string;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
}

// Streams real pipeline stages over SSE, resolving with the final analysis.
export async function analyzeQuote(
  input: AnalyzeInput,
  onStage: (stage: StageEvent) => void
): Promise<AnalysisResult> {
  let body: BodyInit;
  const headers: Record<string, string> = { Accept: 'text/event-stream' };

  if (input.file) {
    const formData = new FormData();
    formData.append('file', input.file);
    if (input.zipCode) formData.append('zipCode', input.zipCode);
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ text: input.text, zipCode: input.zipCode || undefined });
  }

  const res = await fetch(`${API_BASE}/quotes/analyze`, { method: 'POST', headers, body });

  if (!res.ok || !res.body || !res.headers.get('content-type')?.includes('text/event-stream')) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error ?? 'Analysis failed');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: AnalysisResult | null = null;
  let errorMessage: string | null = null;

  const handleBlock = (raw: string) => {
    const parsed = parseSseBlock(raw);
    if (!parsed) return;
    if (parsed.event === 'stage') onStage(JSON.parse(parsed.data));
    else if (parsed.event === 'result') result = JSON.parse(parsed.data);
    else if (parsed.event === 'error') errorMessage = JSON.parse(parsed.data).error;
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      handleBlock(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
    }
  }
  if (buffer.trim()) handleBlock(buffer);

  if (errorMessage) throw new Error(errorMessage);
  if (!result) throw new Error('Analysis ended unexpectedly — please try again.');
  return result;
}

export async function getQuote(id: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/quotes/${id}`);
  if (!res.ok) throw new Error('Quote not found');
  return res.json();
}

export async function recomputeQuote(id: string, corrections: UserCorrections): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/quotes/${id}/recompute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corrections),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Recompute failed' }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function unlockInsights(id: string): Promise<{ checkoutUrl?: string; alreadyPaid?: boolean }> {
  const res = await fetch(`${API_BASE}/quotes/${id}/unlock`, { method: 'POST' });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unlock failed' }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function getInsights(id: string): Promise<PaidInsights> {
  const res = await fetch(`${API_BASE}/quotes/${id}/insights`);
  if (!res.ok) {
    if (res.status === 402) throw new Error('Payment is still processing — refresh this page in a moment.');
    throw new Error('Insights not available');
  }
  return res.json();
}
