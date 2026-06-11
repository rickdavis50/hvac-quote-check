// Result permalinks: /result/:id (+ ?paid=true on return from Stripe Checkout).

export function readResultUrl(): { id: string | null; paidReturn: boolean } {
  const match = window.location.pathname.match(/^\/result\/([A-Za-z0-9-]+)/);
  const paidReturn = new URLSearchParams(window.location.search).get('paid') === 'true';
  return { id: match?.[1] ?? null, paidReturn };
}

export function pushResultUrl(id: string): void {
  window.history.pushState({}, '', `/result/${id}`);
}

export function pushHomeUrl(): void {
  window.history.pushState({}, '', '/');
}

export function resultShareLink(id: string): string {
  return `${window.location.origin}/result/${id}`;
}
