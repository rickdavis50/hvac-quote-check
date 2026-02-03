export type AnalysisResponse = {
  id: string;
  zip?: string;
  cbsa?: string;
  score: number;
  label: "UNDER" | "FAIR" | "HIGH" | "EXTREME";
  exp: { lo: number; hi: number };
  total?: number;
  equip: Array<{
    role: string;
    brand?: string;
    model?: string;
    tons?: number;
    notes?: string;
  }>;
  items: Array<{ label: string; amt?: number; qty?: number }>;
  drivers: string[];
  flags: string[];
  asks: string[];
  conf: number;
};
