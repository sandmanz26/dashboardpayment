import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Kind = 'Breaking' | 'Added' | 'Changed' | 'Deprecated' | 'Fixed';
interface Change { kind: Kind; endpoint?: string; text: string }
interface Release { version: string; date: string; title: string; changes: Change[] }

/** Dummy API changelog. Versions, dates and endpoints are fictional. */
export const RELEASES: Release[] = [
  {
    version: '2026-09-15', date: '15 Sep 2026', title: 'Payout failure codes',
    changes: [
      { kind: 'Added', endpoint: 'POST /v2/payouts', text: 'failure_code now distinguishes INVALID_DESTINATION from REJECTED_BY_BANK. Previously both returned REJECTED_BY_BANK.' },
      { kind: 'Added', endpoint: 'payout.failed', text: 'The webhook carries failure_reason, a human-readable sentence you can show to support staff.' },
      { kind: 'Changed', endpoint: 'GET /v2/payouts', text: 'Default page size is now 20 (was 10). Pass limit to keep the old behaviour.' },
    ],
  },
  {
    version: '2026-08-01', date: '1 Aug 2026', title: 'Refunds move to a top-level resource',
    changes: [
      { kind: 'Breaking', endpoint: 'POST /refunds', text: 'Refunds are created at /refunds instead of /payment_requests/{id}/refunds. The old path keeps working until 1 Feb 2027.' },
      { kind: 'Added', endpoint: 'POST /refunds', text: 'Omitting amount now means a full refund. Previously amount was required.' },
      { kind: 'Deprecated', endpoint: 'POST /payment_requests/{id}/refunds', text: 'Scheduled for removal on 1 Feb 2027. Responses now include a Sunset header.' },
    ],
  },
  {
    version: '2026-06-30', date: '30 Jun 2026', title: 'Webhook delivery guarantees',
    changes: [
      { kind: 'Added', text: 'Every webhook carries a webhook-id header. Use it to deduplicate: the same id may be delivered more than once.' },
      { kind: 'Changed', text: 'Retries follow 15 min, 1 h, 4 h, 12 h, 24 h. A request that does not answer within 30 s is a timeout and is not retried automatically.' },
      { kind: 'Fixed', text: 'Events are no longer dropped when your endpoint answers 2xx after the timeout window.' },
    ],
  },
  {
    version: '2026-05-12', date: '12 May 2026', title: 'Payment Requests v3',
    changes: [
      { kind: 'Added', endpoint: 'POST /v3/payment_requests', text: 'One endpoint for cards, e-wallets, QRIS and virtual accounts, replacing the per-channel endpoints.' },
      { kind: 'Breaking', endpoint: 'POST /v3/payment_requests', text: 'amount is now request_amount, and the response returns actions[] instead of a single action object.' },
      { kind: 'Deprecated', endpoint: 'POST /ewallets/charges', text: 'Use v3 payment requests. No removal date announced yet.' },
    ],
  },
  {
    version: '2026-03-20', date: '20 Mar 2026', title: 'Idempotency on write endpoints',
    changes: [
      { kind: 'Added', text: 'All POST endpoints accept an Idempotency-key header. Replaying a key within 24 h returns the original response instead of creating a second resource.' },
      { kind: 'Changed', endpoint: 'POST /v2/invoices', text: 'A duplicate external_id returns 409 instead of 400. The error_code stays DUPLICATE_ERROR.' },
    ],
  },
  {
    version: '2026-01-08', date: '8 Jan 2026', title: 'Invoice expiry and partial payment',
    changes: [
      { kind: 'Added', endpoint: 'POST /v2/invoices', text: 'should_allow_partial_payment accepts partial amounts against one invoice.' },
      { kind: 'Added', endpoint: 'invoice.expired', text: 'New webhook fired when an invoice passes expiry_date unpaid.' },
      { kind: 'Fixed', endpoint: 'GET /v2/invoices/{id}', text: 'paid_amount was returned as a string for some channels. It is now always a number.' },
    ],
  },
];

export default function Changelog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="xds-drawer-scrim" onClick={onClose} />
      <aside className="xds-drawer" role="dialog" aria-label="API changelog">
        <header>
          <div>
            <h2 style={{ marginTop: 0 }}>API changelog</h2>
            <p className="dv-muted">Changes to the Xendit API, newest first. Versions are dated; pin one with the <code>Xendit-Version</code> header.</p>
          </div>
          <button className="xds-icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>

        <ol className="cl-list">
          {RELEASES.map((r) => (
            <li key={r.version}>
              <div className="cl-meta"><code className="cl-ver">{r.version}</code><time>{r.date}</time></div>
              <h3>{r.title}</h3>
              <ul className="cl-changes">
                {r.changes.map((c, k) => (
                  <li key={k}>
                    <span className={`cl-kind ${c.kind.toLowerCase()}`}>{c.kind}</span>
                    {c.endpoint && <code className="cl-ep">{c.endpoint}</code>}
                    <p>{c.text}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="dv-muted cl-foot">Dummy data for this demo — not Xendit's real release history.</p>
      </aside>
    </>
  );
}
