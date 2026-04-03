import { readFileSync } from 'fs';
import { join } from 'path';
import type { ZipEntry } from '../types.js';

let zipMap: Map<string, ZipEntry> | null = null;

function loadZipData(): Map<string, ZipEntry> {
  if (zipMap) return zipMap;
  const raw = readFileSync(join(process.cwd(), 'data', 'zip-geography.json'), 'utf-8');
  const entries: ZipEntry[] = JSON.parse(raw);
  zipMap = new Map(entries.map((e) => [e.zip, e]));
  return zipMap;
}

export function lookupZip(zip: string): ZipEntry | null {
  const map = loadZipData();
  return map.get(zip) ?? null;
}

export function findNearbyZips(lat: number, lon: number, radiusMiles: number): ZipEntry[] {
  const map = loadZipData();
  const results: ZipEntry[] = [];
  for (const entry of map.values()) {
    const dist = haversine(lat, lon, entry.lat, entry.lon);
    if (dist <= radiusMiles) {
      results.push(entry);
    }
  }
  return results;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
