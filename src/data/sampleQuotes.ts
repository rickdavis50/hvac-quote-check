export interface SampleQuote {
  id: string;
  name: string;
  description: string;
  fixturePath: string;
  suggestedZip: string;
  systemTypeHint: string;
  demoState?: 'low' | 'fair' | 'high';
}

export const sampleQuotes: SampleQuote[] = [
  {
    id: 'ac-replacement-basic',
    name: 'Straightforward AC replacement',
    description: 'Single 3-ton AC + furnace replacement with permit and labor listed clearly.',
    fixturePath: '/fixtures/quotes/ac-replacement-basic.txt',
    suggestedZip: '90026',
    systemTypeHint: 'ac'
  },
  {
    id: 'premium-heat-pump-ductwork',
    name: 'Premium heat pump + ductwork',
    description: 'Higher-efficiency premium system with new ductwork and electrical scope.',
    fixturePath: '/fixtures/quotes/premium-heat-pump-ductwork.txt',
    suggestedZip: '98109',
    systemTypeHint: 'heat_pump'
  },
  {
    id: 'central-heatpump-low',
    name: 'Central heat pump low quote',
    description: 'An intentionally cheap central heat pump replacement for the low-price state.',
    fixturePath: '/fixtures/quotes/central-heatpump-low.txt',
    suggestedZip: '98109',
    systemTypeHint: 'heat_pump',
    demoState: 'low'
  },
  {
    id: 'central-heatpump-fair',
    name: 'Central heat pump fair quote',
    description: 'A mid-range central heat pump replacement that should land in the fair band.',
    fixturePath: '/fixtures/quotes/central-heatpump-fair.txt',
    suggestedZip: '98109',
    systemTypeHint: 'heat_pump',
    demoState: 'fair'
  },
  {
    id: 'central-heatpump-high',
    name: 'Central heat pump high quote',
    description: 'An intentionally inflated central heat pump replacement for the high-price state.',
    fixturePath: '/fixtures/quotes/central-heatpump-high.txt',
    suggestedZip: '98109',
    systemTypeHint: 'heat_pump',
    demoState: 'high'
  },
  {
    id: 'mini-split-install',
    name: 'Mini-split install',
    description: 'Two-zone mini-split install with moderate complexity.',
    fixturePath: '/fixtures/quotes/mini-split-install.txt',
    suggestedZip: '75204',
    systemTypeHint: 'mini_split'
  },
  {
    id: 'messy-contractor-note',
    name: 'Ambiguous handwritten-style quote',
    description: 'Messy language with missing totals and implied scope.',
    fixturePath: '/fixtures/quotes/messy-contractor-note.txt',
    suggestedZip: '33130',
    systemTypeHint: 'unknown'
  },
  {
    id: 'high-premium-electrical',
    name: 'High quote with premium add-ons',
    description: 'Premium branded full split system, crane, and major electrical upgrades.',
    fixturePath: '/fixtures/quotes/high-premium-electrical.txt',
    suggestedZip: '11215',
    systemTypeHint: 'full_split'
  }
];
