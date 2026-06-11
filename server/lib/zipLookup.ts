import { stateFromZip3, cbsaFromZip3, climateFromState, centroidFromState } from '../../data/zip3-prefix.js';
import { lookupCbsaCost } from '../../data/cbsa-cost-index.js';
import type { CbsaCostEntry } from '../../data/cbsa-cost-index.js';

export interface ZipResolution {
  zip: string;
  lat: number;
  lon: number;
  state: string;
  metro: string | null;
  climateRegion: string;
  cbsaCode: string | null;
}

export function lookupZip(zip: string): ZipResolution | null {
  if (!zip || zip.length < 3) return null;
  const prefix = zip.slice(0, 3);
  const state = stateFromZip3(prefix);
  if (!state) return null;

  const cbsaCode = cbsaFromZip3(prefix);
  const cbsaEntry = cbsaCode ? lookupCbsaCost(cbsaCode) : null;

  // Use RURAL-{state} if no metro CBSA found
  const resolvedCbsa = cbsaCode ?? `RURAL-${state}`;
  const resolvedEntry = cbsaEntry ?? lookupCbsaCost(`RURAL-${state}`);

  const centroid = centroidFromState(state);

  return {
    zip,
    lat: centroid.lat,
    lon: centroid.lon,
    state,
    metro: cbsaEntry?.name ?? null,
    climateRegion: climateFromState(state),
    cbsaCode: resolvedCbsa,
  };
}

export function lookupCbsa(cbsaCode: string): CbsaCostEntry | null {
  return lookupCbsaCost(cbsaCode);
}
