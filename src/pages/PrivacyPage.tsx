interface Props {
  onNavigate: (path: string) => void;
}

// Privacy Policy. A CalOPPA-oriented starting template — have a licensed
// attorney review before launch. Values reflect the current implementation
// (90-day retention, the four subprocessors, no data sales, no ad tracking).
const SECTIONS: Array<{ n: string; title: string; body: string[] }> = [
  {
    n: '01',
    title: 'Who we are',
    body: [
      'Fair Air is operated by Alumni Founders, Inc. (“we,” “us”), a California company. This policy explains what we collect when you use the site, how we use it, and the choices you have.',
    ],
  },
  {
    n: '02',
    title: 'What we collect',
    body: [
      'Information you submit: the quote documents or text you upload or paste. These may contain personal information — a job-site address or ZIP code, a contractor’s name, and occasionally a homeowner’s name — along with the equipment and price details we analyze.',
      'Information collected automatically: standard log and device data (such as IP address and browser type) when you use the site, via our hosting provider.',
      'Payment information: if you buy a report, payment is processed by Stripe. We do not receive or store your full card number.',
    ],
  },
  {
    n: '03',
    title: 'How we use it',
    body: [
      'To produce your fair-price estimate and quote analysis; to operate, secure, and improve the site; to process your payment; and to detect and prevent abuse or fraud. We do not use your submissions to build advertising profiles.',
    ],
  },
  {
    n: '04',
    title: 'AI processing',
    body: [
      'To read your quote, we send its contents to Anthropic’s Claude API, which extracts structured details (system type, size, price, location). Anthropic does not use data submitted through its API to train its models. The price ranges themselves are produced by our own deterministic model, not by AI.',
    ],
  },
  {
    n: '05',
    title: 'Who we share it with',
    body: [
      'We share information only with service providers who process it on our behalf, under contracts that limit them to that purpose: Anthropic (quote reading), Stripe (payments), Supabase (secure storage of your submission), and Vercel (hosting).',
      'We do NOT sell your personal information, and we do NOT share it for cross-context behavioral advertising. We may disclose information if required by law or to protect our rights.',
    ],
  },
  {
    n: '06',
    title: 'How long we keep it',
    body: [
      'Stored submissions are automatically deleted about 90 days after they are created. You can ask us to delete your submission sooner by emailing us (see Contact). We may retain limited records where the law requires it.',
    ],
  },
  {
    n: '07',
    title: 'Your choices and rights',
    body: [
      'You can ask us to access, correct, or delete the personal information in a submission by emailing us. Because we have no user accounts, we may ask for details that help us locate your submission (such as your result link) to verify the request.',
      'California residents: to the extent the CCPA/CPRA applies, you have the right to know, delete, and correct your personal information, to opt out of its sale or sharing, and not to be discriminated against for exercising these rights. We do not sell or share your personal information as those terms are defined.',
    ],
  },
  {
    n: '08',
    title: 'Do Not Track',
    body: [
      'We do not track you across other websites for advertising, and we do not serve targeted ads. Because there is no industry-standard response, we do not currently respond to browser “Do Not Track” signals.',
    ],
  },
  {
    n: '09',
    title: 'Security',
    body: [
      'We use reasonable safeguards — encryption in transit, access-restricted storage that is not exposed to the public, and server-side-only credentials for the data store. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    n: '10',
    title: 'Documents you upload',
    body: [
      'Only upload documents you have the right to share. Quotes may contain a contractor’s business information; by submitting one you confirm you may share it with us for analysis.',
    ],
  },
  {
    n: '11',
    title: 'Children',
    body: [
      'Fair Air is intended for adults making home-equipment decisions and is not directed to children. Please do not submit the personal information of anyone under 16.',
    ],
  },
  {
    n: '12',
    title: 'Changes',
    body: [
      'We may update this policy. Material changes take effect when posted, and we will update the effective date above.',
    ],
  },
];

export default function PrivacyPage({ onNavigate }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
      <div className="sheet mt-10">
        <div className="sheet-titleblock">
          <span>Sheet Nº 005 — privacy policy</span>
          <span className="ml-auto">effective July 21, 2026</span>
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <h1 className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-[68ch] text-[13px] leading-relaxed text-ink-soft">
            We ask for as little as possible — a ZIP code, or a quote you choose to share — and we
            never sell it. This policy is the detail behind that.
          </p>

          <div className="mt-8 space-y-7">
            {SECTIONS.map((s) => (
              <section key={s.n} className="border-t border-ink/15 pt-5">
                <h2 className="flex gap-3 font-mono text-[12px] uppercase tracking-micro text-ink-mute">
                  <span className="text-copper-deep">{s.n}</span>
                  <span>{s.title}</span>
                </h2>
                <div className="mt-3 space-y-3">
                  {s.body.map((p, i) => (
                    <p key={i} className="max-w-[68ch] text-[13px] leading-relaxed text-ink-soft">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <section className="border-t border-ink/15 pt-5">
              <h2 className="flex gap-3 font-mono text-[12px] uppercase tracking-micro text-ink-mute">
                <span className="text-copper-deep">13</span>
                <span>Contact</span>
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                Privacy questions or deletion requests: hello@alumnifounders.com.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button onClick={() => onNavigate('/legal')} className="btn-line">
              Terms &amp; disclaimer
            </button>
            <button onClick={() => onNavigate('/')} className="btn-line">
              ← Back to the fair price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
