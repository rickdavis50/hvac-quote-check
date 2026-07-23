// Programmatic SEO: one server-rendered "what should a heat pump cost in {city}?"
// page per metro × system, each carrying a real number from the deterministic engine.
// These are the compounding, own-able surface the growth plan is built on — crawlers get
// real content + unique data per page, and every page funnels into the live tool.

import type { FairPriceEstimate } from './fairPrice.js';

export interface Metro {
  slug: string;
  city: string;
  state: string;
  zip: string; // a representative ZIP the engine resolves to this metro
}

export interface SeoSystem {
  slug: string;
  systemType: string;
  label: string; // human label, sentence case
  blurb: string; // one unique line per system
}

// Curated major metros (representative downtown ZIP each). Grow this list to scale the corpus.
export const METROS: Metro[] = [
  { slug: 'seattle-wa', city: 'Seattle', state: 'WA', zip: '98109' },
  { slug: 'portland-or', city: 'Portland', state: 'OR', zip: '97205' },
  { slug: 'san-francisco-ca', city: 'San Francisco', state: 'CA', zip: '94103' },
  { slug: 'los-angeles-ca', city: 'Los Angeles', state: 'CA', zip: '90012' },
  { slug: 'san-diego-ca', city: 'San Diego', state: 'CA', zip: '92101' },
  { slug: 'sacramento-ca', city: 'Sacramento', state: 'CA', zip: '95814' },
  { slug: 'phoenix-az', city: 'Phoenix', state: 'AZ', zip: '85004' },
  { slug: 'las-vegas-nv', city: 'Las Vegas', state: 'NV', zip: '89101' },
  { slug: 'denver-co', city: 'Denver', state: 'CO', zip: '80202' },
  { slug: 'dallas-tx', city: 'Dallas', state: 'TX', zip: '75201' },
  { slug: 'houston-tx', city: 'Houston', state: 'TX', zip: '77002' },
  { slug: 'austin-tx', city: 'Austin', state: 'TX', zip: '78701' },
  { slug: 'san-antonio-tx', city: 'San Antonio', state: 'TX', zip: '78205' },
  { slug: 'chicago-il', city: 'Chicago', state: 'IL', zip: '60601' },
  { slug: 'minneapolis-mn', city: 'Minneapolis', state: 'MN', zip: '55401' },
  { slug: 'detroit-mi', city: 'Detroit', state: 'MI', zip: '48226' },
  { slug: 'columbus-oh', city: 'Columbus', state: 'OH', zip: '43215' },
  { slug: 'atlanta-ga', city: 'Atlanta', state: 'GA', zip: '30303' },
  { slug: 'miami-fl', city: 'Miami', state: 'FL', zip: '33130' },
  { slug: 'charlotte-nc', city: 'Charlotte', state: 'NC', zip: '28202' },
  { slug: 'nashville-tn', city: 'Nashville', state: 'TN', zip: '37203' },
  { slug: 'boston-ma', city: 'Boston', state: 'MA', zip: '02108' },
  { slug: 'new-york-ny', city: 'New York', state: 'NY', zip: '10001' },
  { slug: 'philadelphia-pa', city: 'Philadelphia', state: 'PA', zip: '19103' },
  { slug: 'washington-dc', city: 'Washington', state: 'DC', zip: '20001' },
];

export const SEO_SYSTEMS: SeoSystem[] = [
  {
    slug: 'central-heat-pump',
    systemType: 'central_heat_pump',
    label: 'central ducted heat pump',
    blurb:
      'A central ducted heat pump uses your existing ductwork to heat and cool the whole home from one outdoor unit, the most common whole-home replacement.',
  },
  {
    slug: 'heat-pump-split',
    systemType: 'heat_pump_split',
    label: 'heat pump with air handler',
    blurb:
      'A heat pump paired with an indoor air handler, the split-system setup for homes without a furnace to pair with.',
  },
  {
    slug: 'mini-split',
    systemType: 'mini_split',
    label: 'ductless mini-split',
    blurb:
      'A ductless mini-split mounts indoor heads on the wall and skips ductwork entirely, best for additions, older homes, and room-by-room control.',
  },
];

export function findMetro(slug: string): Metro | undefined {
  return METROS.find((m) => m.slug === slug);
}
export function findSystem(slug: string): SeoSystem | undefined {
  return SEO_SYSTEMS.find((s) => s.slug === slug);
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money = (n: number) => usd.format(Math.round(n));

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

// Shared <head> + design tokens. Self-contained, on-brand (paper / ink / copper, Playfair + Plex Mono).
function head(opts: { title: string; description: string; canonical: string; jsonLd?: object }): string {
  const favicon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23161310'/%3E%3Cpath d='M6 16h20M16 6v20' stroke='%23B87333' stroke-width='1.5'/%3E%3Ccircle cx='16' cy='16' r='7.5' fill='none' stroke='%23B87333' stroke-width='1.5'/%3E%3C/svg%3E";
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}">
<link rel="canonical" href="${esc(opts.canonical)}">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(opts.title)}">
<meta property="og:description" content="${esc(opts.description)}">
<meta property="og:url" content="${esc(opts.canonical)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
${opts.jsonLd ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd)}</script>` : ''}
<style>
:root{--paper:#FAF7F2;--paper-deep:#F2EDE4;--ink:#161310;--ink-soft:#3B352C;--ink-mute:#7A7160;--ink-faint:#A99F8C;--copper:#B87333;--copper-deep:#8F5722}
*{box-sizing:border-box;margin:0}html{-webkit-text-size-adjust:100%}
body{background:var(--paper);color:var(--ink);font-family:'IBM Plex Mono',ui-monospace,monospace;font-feature-settings:'tnum' 1;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:920px;margin:0 auto;padding:0 20px 96px}
header{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:16px 20px;max-width:920px;margin:0 auto;flex-wrap:wrap}
.brand{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:20px}
.motto{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
nav.top a{font-size:12px;color:var(--ink-mute);text-decoration:none;margin-left:20px}
nav.top a:hover{color:var(--ink)}
.sheet{border:1px solid rgba(22,19,16,.2);background:var(--paper);margin-top:24px}
.titleblock{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:1px solid rgba(22,19,16,.2);padding:10px 20px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.body{padding:32px 20px}
@media(min-width:640px){.body{padding:48px 32px}}
h1{font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:34px;line-height:1.08;letter-spacing:-.01em;max-width:20ch}
@media(min-width:640px){h1{font-size:52px}}
.range{font-family:'Playfair Display',Georgia,serif;font-size:52px;line-height:1;letter-spacing:-.02em;margin-top:20px}
@media(min-width:640px){.range{font-size:84px}}
.range .dash{color:var(--ink-faint)}
.meta{font-size:13px;color:var(--copper-deep);margin-top:14px}
p{max-width:66ch;font-size:13px;color:var(--ink-soft);margin-top:16px}
.small{font-size:11px;color:var(--ink-mute)}
.cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.btn{display:inline-block;border:1px solid var(--ink);background:var(--ink);color:var(--paper);padding:10px 20px;font-size:13px;font-weight:500;letter-spacing:.02em;text-decoration:none}
.btn.line{background:transparent;color:var(--ink);border-color:rgba(22,19,16,.4)}
.label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute);margin-top:36px}
.receipt{margin-top:12px;border-top:1px solid rgba(22,19,16,.15)}
.receipt .row{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(22,19,16,.12);padding:9px 0;font-size:12px}
.receipt .row .d{color:var(--ink-mute)}
.links{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:14px;font-size:13px}
.links a{color:var(--ink-mute);text-decoration:none}.links a:hover{color:var(--ink);text-decoration:underline}
footer{max-width:920px;margin:0 auto;padding:24px 20px;border-top:1px solid rgba(22,19,16,.15);font-size:11px;color:var(--ink-mute);display:flex;flex-wrap:wrap;gap:6px 20px}
footer a{color:inherit}
</style></head>`;
}

function chrome(): string {
  return `<header>
<div><a href="/" class="brand" style="text-decoration:none">Quote Check</a> <span class="motto">· Pricing transparency for HVAC</span></div>
<nav class="top"><a href="/guide">Guide</a><a href="/cost">Cost by city</a><a href="/">Fair price</a></nav>
</header>`;
}

function footer(): string {
  return `<footer>
<span style="font-family:'Playfair Display',Georgia,serif;font-style:italic;color:var(--ink)">Quote Check</span>
<a href="/">Fair price</a><a href="/guide">Negotiation guide</a><a href="/cost">Cost by city</a>
<a href="/legal">Terms</a><a href="/privacy">Privacy</a>
<span style="margin-left:auto">AI agents: <a href="/llms.txt">llms.txt</a></span>
</footer>`;
}

export function renderCostPage(opts: {
  metro: Metro;
  system: SeoSystem;
  estimate: FairPriceEstimate;
  origin: string;
}): string {
  const { metro, system, estimate, origin } = opts;
  const { fairRange } = estimate;
  const metroName = estimate.resolved.metro ?? `${metro.state} (state average)`;
  const canonical = `${origin}/cost/${metro.slug}/${system.slug}`;
  const title = `${system.label[0].toUpperCase()}${system.label.slice(1)} cost in ${metro.city}, ${metro.state} (2026) · Quote Check`;
  const description = `A fair installed price for a ${system.label} in ${metro.city}, ${metro.state} runs about ${money(fairRange.low)}–${money(fairRange.high)} (midpoint ${money(fairRange.mid)}). Deterministic estimate with the math shown, no phone number.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Cost by city', item: `${origin}/cost` },
      { '@type': 'ListItem', position: 2, name: `${metro.city}, ${metro.state}`, item: canonical },
    ],
  };

  const factors = estimate.factors
    .slice(0, 5)
    .map(
      (f) =>
        `<div class="row"><span>${esc(f.label)}<br><span class="d">${esc(f.detail)}</span></span><span>×${f.multiplier.toFixed(2)}</span></div>`
    )
    .join('');

  const otherSystems = SEO_SYSTEMS.filter((s) => s.slug !== system.slug)
    .map((s) => `<a href="/cost/${metro.slug}/${s.slug}">${esc(s.label)} in ${esc(metro.city)}</a>`)
    .join('');
  const otherCities = METROS.filter((m) => m.slug !== metro.slug)
    .slice(0, 8)
    .map((m) => `<a href="/cost/${m.slug}/${system.slug}">${esc(m.city)}, ${esc(m.state)}</a>`)
    .join('');

  const deepLink = `/?zip=${metro.zip}&systemType=${system.systemType}&tonnage=3&qualityTier=mid&electrical=1&permits=1#fair-price`;

  return `${head({ title, description, canonical, jsonLd })}<body>
${chrome()}
<div class="wrap"><div class="sheet">
<div class="titleblock"><span>${esc(metro.city)}, ${esc(metro.state)} · ${esc(system.label)}</span><span>engine: deterministic · method v${esc(estimate.methodologyVersion)}</span></div>
<div class="body">
<h1>What a ${esc(system.label)} should cost in ${esc(metro.city)}.</h1>
<div class="range">${money(fairRange.low)}<span class="dash">–</span>${money(fairRange.high)}</div>
<div class="meta">midpoint ${money(fairRange.mid)} · confidence ${esc(estimate.confidence)} · ${esc(estimate.dataQuality.geographyPrecision)}-level data · ${esc(metroName)}</div>
<p>${esc(system.blurb)} This is the fair installed price for a typical 3-ton, mid-tier system with permits and electrical included, priced for ${esc(metroName)} by a deterministic engine, not an AI, and never a sales lead. It is an estimate, not a quote: your exact price depends on your home and contractor.</p>
<div class="cta">
<a class="btn" href="${deepLink}">Price your exact ZIP →</a>
<a class="btn line" href="/check">Check a quote you were given →</a>
<a class="btn line" href="/guide">How to negotiate it →</a>
</div>
<div class="label">The math (top factors)</div>
<div class="receipt">${factors}</div>
<div class="label">Other systems in ${esc(metro.city)}</div>
<div class="links">${otherSystems}</div>
<div class="label">${esc(system.label[0].toUpperCase() + system.label.slice(1))} in other cities</div>
<div class="links">${otherCities}</div>
<p class="small">An estimate, not financial advice or a quote. Actual prices vary by home and contractor. Verify with a licensed pro before you buy. Rebates and tax credits change often; see the <a href="/guide" style="text-decoration:underline">negotiation guide</a>.</p>
</div></div></div>
${footer()}
</body></html>`;
}

export function renderCostIndex(origin: string): string {
  const canonical = `${origin}/cost`;
  const rows = METROS.map(
    (m) =>
      `<div class="row"><span><a href="/cost/${m.slug}/central-heat-pump" style="text-decoration:none">${esc(m.city)}, ${esc(m.state)}</a></span><span class="d">${SEO_SYSTEMS.map((s) => `<a href="/cost/${m.slug}/${s.slug}" style="color:var(--ink-mute);text-decoration:none">${esc(s.slug.replace(/-/g, ' '))}</a>`).join(' · ')}</span></div>`
  ).join('');
  return `${head({
    title: 'What a heat pump should cost, by city · Quote Check',
    description: 'The fair installed price of a heat pump in 25 major US metros, with the math shown. Free, deterministic, no phone number.',
    canonical,
  })}<body>
${chrome()}
<div class="wrap"><div class="sheet">
<div class="titleblock"><span>Cost by city</span><span>fair installed price · deterministic</span></div>
<div class="body">
<h1>What a heat pump should cost, by city.</h1>
<p>The fair installed price of a heat pump in ${METROS.length} major US metros, priced by the same deterministic engine that checks quotes, with the math shown like a receipt. Pick your city, then price your exact ZIP.</p>
<div class="receipt" style="margin-top:24px">${rows}</div>
</div></div></div>
${footer()}
</body></html>`;
}

export function buildSitemap(origin: string): string {
  const urls = [
    `${origin}/`,
    `${origin}/guide`,
    `${origin}/teardown`,
    `${origin}/cost`,
    ...METROS.flatMap((m) => SEO_SYSTEMS.map((s) => `${origin}/cost/${m.slug}/${s.slug}`)),
  ];
  const body = urls.map((u) => `<url><loc>${esc(u)}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function robotsTxt(origin: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}
