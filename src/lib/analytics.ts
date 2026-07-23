// Google Analytics 4 — first-party measurement, configured to fit the site's
// privacy stance:
//   • no Google ad-personalization / cross-site signals
//   • IP anonymization on
//   • analytics is skipped entirely when the visitor sends Global Privacy Control
//     or Do Not Track
// Activates only when VITE_GA_MEASUREMENT_ID is set at build time; otherwise every
// call is a safe no-op (events log to the console in dev so the funnel stays
// inspectable without a live GA property).

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const DEV = import.meta.env.DEV;

// A closed vocabulary of funnel events keeps reporting consistent across the app.
export type AnalyticsEvent =
  | 'page_view'
  | 'fair_price_lookup'
  | 'quote_submit'
  | 'quote_result'
  | 'quote_recompute'
  | 'unlock_click'
  | 'teardown_enter'
  | 'guide_view'
  | 'agent_docs_click'
  | 'experiment_impression';

let enabled = false;

function privacyOptOut(): boolean {
  if (typeof navigator === 'undefined') return false;
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  const dnt =
    navigator.doNotTrack === '1' ||
    (window as Window & { doNotTrack?: string }).doNotTrack === '1';
  return gpc === true || dnt;
}

/** Load and configure gtag. Idempotent; safe to call before every render tree. */
export function initAnalytics(): void {
  if (enabled) return;
  if (!MEASUREMENT_ID) {
    if (DEV) console.debug('[analytics] disabled — set VITE_GA_MEASUREMENT_ID to enable');
    return;
  }
  if (privacyOptOut()) {
    if (DEV) console.debug('[analytics] skipped — visitor sent GPC/Do-Not-Track');
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag reads the arguments object off dataLayer; this is the canonical stub.
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: false, // sent manually so SPA route changes are counted
  });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(s);

  enabled = true;
}

export function track(event: AnalyticsEvent, params: GtagParams = {}): void {
  if (!enabled) {
    if (DEV) console.debug('[analytics]', event, params);
    return;
  }
  window.gtag('event', event, params);
}

export function trackPageView(path: string, title?: string): void {
  track('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
  });
}

/** Set a GA4 user property (used to segment conversions by experiment variant). */
export function setUserProperty(name: string, value: string): void {
  if (!enabled) return;
  window.gtag('set', 'user_properties', { [name]: value });
}
