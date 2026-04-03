import type { AnalysisResult, UserCorrections, PaidInsights } from '../types';

const API_BASE = '/api';

export async function uploadQuote(file: File, userZip?: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (userZip) formData.append('userZip', userZip);

  const res = await fetch(`${API_BASE}/quotes/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error);
  }

  return res.json();
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
  const res = await fetch(`${API_BASE}/quotes/${id}/unlock`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unlock failed' }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function getInsights(id: string): Promise<PaidInsights> {
  const res = await fetch(`${API_BASE}/quotes/${id}/insights`);
  if (!res.ok) {
    if (res.status === 402) throw new Error('Payment required');
    throw new Error('Insights not available');
  }
  return res.json();
}
