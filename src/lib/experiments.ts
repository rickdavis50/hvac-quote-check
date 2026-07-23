// Dependency-free A/B experiments.
// A visitor is bucketed once per experiment; the assignment is sticky in
// localStorage and reported to GA4 (as an event param + a user property) so
// conversions can be segmented by variant. Client-side only — no flicker,
// because the variant resolves synchronously on first render.

import { useEffect, useState } from 'react';
import { track, setUserProperty } from './analytics';

export interface Experiment {
  key: string;
  /** Equal-weighted variants. First entry is the control. */
  variants: readonly string[];
}

// Active experiments live here. Add one, use its key in a component, done.
export const EXPERIMENTS = {
  hero_copy: { key: 'hero_copy', variants: ['control', 'benefit'] },
  // Which quote-input tab a visitor lands on — does paste-first lift submissions vs upload-first?
  quote_input_default: { key: 'quote_input_default', variants: ['file', 'text'] },
} satisfies Record<string, Experiment>;

export type ExperimentKey = keyof typeof EXPERIMENTS;

const STORAGE_PREFIX = 'qc_exp_';

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

function writeStored(key: string, variant: string): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, variant);
  } catch {
    /* private mode / storage disabled — the in-memory bucket holds for the session */
  }
}

function resolveVariant(key: ExperimentKey): string {
  const exp = EXPERIMENTS[key];
  const stored = readStored(key);
  if (stored && exp.variants.includes(stored)) return stored;
  const variant = exp.variants[Math.floor(Math.random() * exp.variants.length)];
  writeStored(key, variant);
  return variant;
}

// Impressions fire once per page load per experiment, even under StrictMode.
const reported = new Set<string>();

/** Resolve the sticky variant for an experiment and report the impression. */
export function useExperiment(key: ExperimentKey): string {
  const [variant] = useState(() => resolveVariant(key));
  useEffect(() => {
    if (reported.has(key)) return;
    reported.add(key);
    setUserProperty(`exp_${key}`, variant);
    track('experiment_impression', { experiment: key, variant });
  }, [key, variant]);
  return variant;
}
