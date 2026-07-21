// The teardown's narrative spine. Figures cite the 2026-07 research digest:
// EnergySage marketplace averages, acdirect wholesale teardown, ACCA overhead,
// heatpumped.org margin analysis. Part prices are typical US retail ranges.

export interface Chapter {
  fig: number;
  title: string;
  body: string;
  priceLine?: string;
}

export const CHAPTERS: Chapter[] = [
  {
    fig: 0,
    title: 'The machine',
    body:
      'A heat pump. Contractors will quote $12,000 to $20,000 and up to install one. ' +
      'The hardware inside wholesales for $3,200 to $4,500. You are allowed to know the ' +
      'difference. Scroll.',
    priceLine: 'national average installed price: $15,393',
  },
  {
    fig: 1,
    title: "It moves heat. It doesn't make it.",
    body:
      'A furnace burns fuel to create heat. This machine pumps existing heat from one ' +
      'place to another through that copper loop — one unit of electricity in, roughly ' +
      'three units of heat moved. And the cold-weather story your brother-in-law tells is ' +
      'a decade old: modern cold-climate units hold their output far below freezing.',
  },
  {
    fig: 2,
    title: 'The compressor',
    body:
      'The heart, and the priciest organ: a sealed pump that squeezes refrigerant vapor ' +
      'so it carries heat uphill. Variable-speed compressors are why premium models cost ' +
      'more — they modulate quietly instead of slamming on and off.',
    priceLine: 'typical part cost: $1,200–$2,800',
  },
  {
    fig: 3,
    title: 'The coils',
    body:
      'Copper veins through aluminum fins. Outdoors, this bank harvests heat from the ' +
      'air; indoors, a twin coil hands it to your ducts. Coil surface area does the ' +
      'comfort work the brand sticker takes credit for.',
    priceLine: 'typical replacement coil: $600–$1,400',
  },
  {
    fig: 4,
    title: 'The reversing valve',
    body:
      "One brass valve flips the loop's direction. Winter: heat flows in. Summer: heat " +
      'flows out. This part is the entire difference between an air conditioner and a ' +
      'heat pump, and it costs about as much as a nice dinner for four.',
    priceLine: 'typical part cost: $120–$350',
  },
  {
    fig: 5,
    title: 'The fan',
    body:
      'An oversized blade turning slowly, pulling air across the fins. Big and slow beats ' +
      'small and fast: quieter, cheaper to run. When the brochure says "whisper-quiet ' +
      'technology," it means this.',
    priceLine: 'typical motor and blade: $250–$700',
  },
  {
    fig: 6,
    title: 'Add it up',
    body:
      'Compressor, coils, valve, fan, board, cabinet: roughly $3,200 to $4,500 in parts. ' +
      'The average installed quote is $15,393. The difference is real labor, real ' +
      'overhead — and a margin that swings by thousands for the same job. The margin is ' +
      'where you negotiate.',
    priceLine: 'parts ≈ $3,200–$4,500 · average quote $15,393',
  },
  {
    fig: 7,
    title: 'Now you know the machine.',
    body:
      'For honesty’s sake: contractors target about 50% gross margin, overhead eats ' +
      '25–40% of their revenue, and most net 10–20%. Fair doesn’t mean ' +
      'free — it means priced like the machine is knowable. Now go get the other number: ' +
      'what this job should cost in your ZIP code.',
  },
];

// Part labels pinned in the 3D scene. positions are [x, y, z] in scene space.
export interface PartLabel {
  key: string;
  name: string;
  price: string;
  chapter: number; // which chapter focuses this part
}

export const PART_LABELS: PartLabel[] = [
  { key: 'compressor', name: 'compressor', price: '$1,200–2,800', chapter: 2 },
  { key: 'coil', name: 'coil + fins', price: '$600–1,400', chapter: 3 },
  { key: 'valve', name: 'reversing valve', price: '$120–350', chapter: 4 },
  { key: 'fan', name: 'fan + motor', price: '$250–700', chapter: 5 },
  { key: 'board', name: 'control board', price: '$150–500', chapter: -1 },
  { key: 'cabinet', name: 'cabinet + lineset', price: '$400–900', chapter: -1 },
];
