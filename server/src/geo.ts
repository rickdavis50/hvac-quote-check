import fs from "fs";
import path from "path";

type Metro = {
  cbsa: string;
  name: string;
  labor_mult: number;
  overhead_mult: number;
  taxperm_mult: number;
};

type StateDefaults = Record<
  string,
  { labor_mult: number; overhead_mult: number; taxperm_mult: number }
>;

const dataRoot = path.resolve(__dirname, "..", "..", "data");
const majorMetros: Metro[] = JSON.parse(
  fs.readFileSync(path.join(dataRoot, "major_metros.json"), "utf8")
);
const zipToCbsa: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(dataRoot, "zip_to_cbsa_major.json"), "utf8")
);
const stateDefaults: StateDefaults = JSON.parse(
  fs.readFileSync(path.join(dataRoot, "state_defaults.json"), "utf8")
);

const metroByCbsa = new Map(majorMetros.map((m) => [m.cbsa, m]));

const zipRanges: Array<{ min: number; max: number; state: string }> = [
  { min: 350, max: 369, state: "AL" },
  { min: 995, max: 999, state: "AK" },
  { min: 850, max: 865, state: "AZ" },
  { min: 716, max: 729, state: "AR" },
  { min: 900, max: 961, state: "CA" },
  { min: 800, max: 816, state: "CO" },
  { min: 60, max: 69, state: "CT" },
  { min: 200, max: 205, state: "DC" },
  { min: 197, max: 199, state: "DE" },
  { min: 320, max: 349, state: "FL" },
  { min: 300, max: 319, state: "GA" },
  { min: 967, max: 968, state: "HI" },
  { min: 500, max: 528, state: "IA" },
  { min: 832, max: 838, state: "ID" },
  { min: 600, max: 629, state: "IL" },
  { min: 460, max: 479, state: "IN" },
  { min: 660, max: 679, state: "KS" },
  { min: 400, max: 427, state: "KY" },
  { min: 700, max: 714, state: "LA" },
  { min: 10, max: 27, state: "MA" },
  { min: 206, max: 219, state: "MD" },
  { min: 39, max: 49, state: "ME" },
  { min: 480, max: 499, state: "MI" },
  { min: 550, max: 567, state: "MN" },
  { min: 630, max: 658, state: "MO" },
  { min: 386, max: 397, state: "MS" },
  { min: 590, max: 599, state: "MT" },
  { min: 270, max: 289, state: "NC" },
  { min: 580, max: 588, state: "ND" },
  { min: 680, max: 693, state: "NE" },
  { min: 30, max: 38, state: "NH" },
  { min: 70, max: 89, state: "NJ" },
  { min: 870, max: 884, state: "NM" },
  { min: 889, max: 898, state: "NV" },
  { min: 100, max: 149, state: "NY" },
  { min: 430, max: 459, state: "OH" },
  { min: 730, max: 749, state: "OK" },
  { min: 970, max: 979, state: "OR" },
  { min: 150, max: 196, state: "PA" },
  { min: 28, max: 29, state: "RI" },
  { min: 290, max: 299, state: "SC" },
  { min: 570, max: 577, state: "SD" },
  { min: 370, max: 385, state: "TN" },
  { min: 750, max: 799, state: "TX" },
  { min: 840, max: 847, state: "UT" },
  { min: 201, max: 246, state: "VA" },
  { min: 50, max: 59, state: "VT" },
  { min: 980, max: 994, state: "WA" },
  { min: 530, max: 549, state: "WI" },
  { min: 247, max: 268, state: "WV" },
  { min: 820, max: 831, state: "WY" }
];

export type GeoResult = {
  multipliers: { labor: number; overhead: number; taxperm: number };
  cbsa?: string;
  metro_name?: string;
  state?: string;
  source: "metro" | "state" | "national";
};

export function getGeoMultipliers(zip: string, stateOverride?: string): GeoResult {
  const cbsa = zip ? zipToCbsa[zip] : undefined;
  if (cbsa) {
    const metro = metroByCbsa.get(cbsa);
    if (metro) {
      return {
        cbsa,
        metro_name: metro.name,
        multipliers: {
          labor: metro.labor_mult,
          overhead: metro.overhead_mult,
          taxperm: metro.taxperm_mult
        },
        source: "metro"
      };
    }
  }

  const state = stateOverride?.toUpperCase() || getStateFromZip(zip);
  const fallback = state ? stateDefaults[state] : undefined;
  if (fallback) {
    return {
      state,
      multipliers: {
        labor: fallback.labor_mult,
        overhead: fallback.overhead_mult,
        taxperm: fallback.taxperm_mult
      },
      source: "state"
    };
  }

  const national = stateDefaults.US;
  return {
    multipliers: {
      labor: national.labor_mult,
      overhead: national.overhead_mult,
      taxperm: national.taxperm_mult
    },
    source: "national"
  };
}

function getStateFromZip(zip: string): string | undefined {
  const prefix = Number(zip.slice(0, 3));
  if (Number.isNaN(prefix)) return undefined;
  const match = zipRanges.find((range) => prefix >= range.min && prefix <= range.max);
  return match?.state;
}
