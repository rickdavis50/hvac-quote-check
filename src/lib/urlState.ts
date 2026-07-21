// History-API routing: / (landing + fair price), /teardown, /check, /result/:id.
// Result permalinks keep ?paid=true for the Stripe Checkout return.

export type Route =
  | { page: 'home' }
  | { page: 'teardown' }
  | { page: 'check' }
  | { page: 'result'; id: string; paidReturn: boolean };

export function parseRoute(): Route {
  const path = window.location.pathname;
  const match = path.match(/^\/result\/([A-Za-z0-9-]+)/);
  if (match) {
    const paidReturn = new URLSearchParams(window.location.search).get('paid') === 'true';
    return { page: 'result', id: match[1], paidReturn };
  }
  if (path.startsWith('/teardown')) return { page: 'teardown' };
  if (path.startsWith('/check')) return { page: 'check' };
  return { page: 'home' };
}

export function pushRoute(path: string): void {
  window.history.pushState({}, '', path);
  window.scrollTo(0, 0);
}

export function pushResultUrl(id: string): void {
  pushRoute(`/result/${id}`);
}

export function resultShareLink(id: string): string {
  return `${window.location.origin}/result/${id}`;
}

// Fair-price estimates are shareable via query params on the landing page.
export interface FairPriceQuery {
  zip: string;
  systemType: string;
  tonnage: number;
  qualityTier: string;
  ductwork: boolean;
  electrical: boolean;
  permits: boolean;
}

export function readFairPriceQuery(): Partial<FairPriceQuery> {
  const q = new URLSearchParams(window.location.search);
  const zip = q.get('zip') ?? undefined;
  if (!zip) return {};
  return {
    zip,
    systemType: q.get('systemType') ?? undefined,
    tonnage: q.get('tonnage') ? Number(q.get('tonnage')) : undefined,
    qualityTier: q.get('qualityTier') ?? undefined,
    ductwork: q.get('ductwork') === '1',
    electrical: q.get('electrical') === '1',
    permits: q.get('permits') === '1',
  };
}

export function writeFairPriceQuery(inputs: FairPriceQuery): void {
  const q = new URLSearchParams({
    zip: inputs.zip,
    systemType: inputs.systemType,
    tonnage: String(inputs.tonnage),
    qualityTier: inputs.qualityTier,
  });
  if (inputs.ductwork) q.set('ductwork', '1');
  if (inputs.electrical) q.set('electrical', '1');
  if (inputs.permits) q.set('permits', '1');
  window.history.replaceState({}, '', `/?${q.toString()}`);
}
