import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { BASE_URL, pretty } from './postman';
import { CodeBlock } from './ui';

/** Outcome-driven practice cases. All bodies are illustrative and fictional; check docs.xendit.co for exact wording. */
interface Outcome {
  id: string; label: string; tone: 'ok' | 'bad';
  status: number; response: unknown; what: string; todo?: string;
  webhook?: { event: string; data: Record<string, unknown> };
}
interface Case {
  id: string; title: string; blurb: string; method: 'POST' | 'GET'; path: string;
  request: unknown; outcomes: Outcome[];
}

const BIZ = '65f0c1e2a4b7d900123abcde';
const hook = (event: string, data: Record<string, unknown>) => ({ event, data });

export const CASES: Case[] = [
  {
    id: 'payout', title: 'Send a payout', blurb: 'Pay a bank account and see what happens when it succeeds or fails.',
    method: 'POST', path: '/v2/payouts',
    request: { reference_id: 'payout-demo-001', channel_code: 'ID_BCA', channel_properties: { account_holder_name: 'John Doe', account_number: '0000000000' }, amount: 90000, currency: 'IDR', description: 'Test payout' },
    outcomes: [
      { id: 'ok', label: 'Succeeds', tone: 'ok', status: 200, response: { id: 'disb-5e8a2c71', status: 'ACCEPTED', amount: 90000, currency: 'IDR', reference_id: 'payout-demo-001' },
        what: 'The payout was accepted, then completed at the bank.', webhook: hook('payout.succeeded', { id: 'disb-5e8a2c71', reference_id: 'payout-demo-001', status: 'SUCCEEDED', amount: 90000 }) },
      { id: 'balance', label: 'Insufficient balance', tone: 'bad', status: 400, response: { error_code: 'INSUFFICIENT_BALANCE', message: 'Your balance is not enough to cover this payout.' },
        what: 'Nothing was sent. No webhook fires because the payout was never created.', todo: 'Top up your balance (test mode: use the balance top-up tool) and send again.' },
      { id: 'bank', label: 'Bank rejects account', tone: 'bad', status: 200, response: { id: 'disb-5e8a2c72', status: 'ACCEPTED', amount: 90000 },
        what: 'Accepted first, then the bank refused the account. You learn about it from the webhook, not the response.', todo: 'Verify account number and holder name, then create a new payout with a new reference_id.',
        webhook: hook('payout.failed', { id: 'disb-5e8a2c72', reference_id: 'payout-demo-001', status: 'FAILED', failure_code: 'INVALID_DESTINATION' }) },
    ],
  },
  {
    id: 'refund', title: 'Refund a payment', blurb: 'Return money to a customer, in full or beyond what they paid.',
    method: 'POST', path: '/refunds',
    request: { payment_request_id: 'pr-7d1c0f4a', reference_id: 'refund-demo-001', amount: 150000, currency: 'IDR', reason: 'REQUESTED_BY_CUSTOMER' },
    outcomes: [
      { id: 'ok', label: 'Succeeds', tone: 'ok', status: 200, response: { id: 'rfd-2b9e1a77', status: 'PENDING', amount: 150000, currency: 'IDR' },
        what: 'The refund is created as PENDING and settles shortly after.', webhook: hook('refund.succeeded', { id: 'rfd-2b9e1a77', payment_request_id: 'pr-7d1c0f4a', amount: 150000, status: 'SUCCEEDED' }) },
      { id: 'over', label: 'More than paid', tone: 'bad', status: 400, response: { error_code: 'REFUND_AMOUNT_EXCEEDS_PAYMENT', message: 'Refund amount is greater than the refundable amount.' },
        what: 'You asked to refund more than the customer paid. Nothing was created.', todo: 'Lower the amount to the remaining refundable balance and send again.' },
      { id: 'twice', label: 'Already refunded', tone: 'bad', status: 400, response: { error_code: 'PAYMENT_ALREADY_REFUNDED', message: 'This payment has already been fully refunded.' },
        what: 'A full refund already exists for this payment.', todo: 'Fetch the existing refund instead of creating another.' },
    ],
  },
  {
    id: 'decline', title: 'Payment is declined', blurb: 'A customer tries to pay and it does not go through.',
    method: 'POST', path: '/v3/payment_requests',
    request: { reference_id: 'order-demo-002', type: 'PAY', country: 'ID', currency: 'IDR', request_amount: 150000, channel_code: 'OVO' },
    outcomes: [
      { id: 'fail', label: 'Insufficient e-wallet funds', tone: 'bad', status: 200, response: { payment_request_id: 'pr-0f3a9c1f', status: 'REQUIRES_ACTION' },
        what: 'The request was created, but the customer’s wallet could not cover it. The result arrives by webhook.', todo: 'Show the customer a retry option and create a new payment request.',
        webhook: hook('payment.failed', { payment_id: 'py-0f3a9c1f', reference_id: 'order-demo-002', status: 'FAILED', failure_code: 'INSUFFICIENT_BALANCE' }) },
      { id: 'expire', label: 'Customer never pays', tone: 'bad', status: 200, response: { payment_request_id: 'pr-0f3a9c20', status: 'REQUIRES_ACTION' },
        what: 'The customer abandoned checkout, so the request expired.', todo: 'Treat the order as unpaid and release held stock.',
        webhook: hook('payment_request.expiry', { payment_request_id: 'pr-0f3a9c20', reference_id: 'order-demo-002', status: 'EXPIRED' }) },
      { id: 'ok', label: 'Customer pays', tone: 'ok', status: 200, response: { payment_request_id: 'pr-0f3a9c21', status: 'REQUIRES_ACTION' },
        what: 'For comparison: the customer approves in their app.', webhook: hook('payment.succeeded', { payment_id: 'py-0f3a9c21', reference_id: 'order-demo-002', status: 'SUCCEEDED', request_amount: 150000 }) },
    ],
  },
  {
    id: 'token', title: 'Verify a webhook', blurb: 'Check x-callback-token so you never trust a forged request.',
    method: 'POST', path: 'your-server/webhooks/xendit',
    request: { event: 'payment.succeeded', data: { reference_id: 'order-demo-001', status: 'SUCCEEDED' } },
    outcomes: [
      { id: 'ok', label: 'Token matches', tone: 'ok', status: 200, response: { received: true }, what: 'Your handler compared the header with your stored token and accepted the event.' },
      { id: 'bad', label: 'Token missing or wrong', tone: 'bad', status: 401, response: { error: 'invalid callback token' }, what: 'The header did not match, so your server should refuse the request and ignore the body.', todo: 'Return 401 and log it. Do not process the payload.' },
      { id: 'dup', label: 'Same event sent twice', tone: 'ok', status: 200, response: { received: true, duplicate: true }, what: 'Retries can deliver the same event again. Your handler recognised the webhook-id and skipped re-processing.', todo: 'Store webhook-id and return 200 for ones you have seen.' },
    ],
  },
];

export default function TryCases({ caseId }: { caseId: string }) {
  const c = CASES.find((x) => x.id === caseId)!;
  const [pick, setPick] = useState<string>(c.outcomes[0].id);
  const [ran, setRan] = useState<string | null>(null);
  const out = c.outcomes.find((o) => o.id === ran) ?? null;

  return (
    <div className="dv-tab">
      <h2 className="dv-h1">{c.title}</h2>
      <p className="dv-muted">{c.blurb} <b>Test mode</b> — simulated in your browser with fictional data.</p>

      <section className="try-panel case-panel">
        <h4 className="try-h">1 · Request</h4>
        <div className="try-req"><em className={`m ${c.method}`}>{c.method}</em><code>{c.path.startsWith('your') ? c.path : BASE_URL + c.path}</code></div>
        <CodeBlock title="Body · application/json" code={pretty(c.request)} />

        <h4 className="try-h">2 · Choose what happens</h4>
        <fieldset className="try-radios" aria-label="Outcome">
          <legend>Outcome</legend>
          {c.outcomes.map((o) => (
            <label key={o.id} className={pick === o.id ? 'on' : ''}>
              <input type="radio" name={`o-${c.id}`} checked={pick === o.id} onChange={() => { setPick(o.id); setRan(null); }} />
              <b>{o.label}</b><span>{o.tone === 'ok' ? 'Happy path' : 'Failure case'}</span>
            </label>
          ))}
        </fieldset>
        <div className="try-actions">
          <button className="dv-btn primary" onClick={() => setRan(pick)}><Play size={14} />Run</button>
          {ran && <button className="dv-btn" onClick={() => setRan(null)}><RotateCcw size={14} />Reset</button>}
        </div>

        {out && (
          <div className={out.tone === 'ok' ? 'try-status completed' : 'try-fail'} role="status">
            <span className="badge-s">{out.status} · {out.label}</span>
            <p><b>What happened:</b> {out.what}</p>
            {out.todo && <p><b>What to do:</b> {out.todo}</p>}
            <CodeBlock title={`Response · ${out.status}`} code={pretty(out.response)} />
            {out.webhook
              ? <CodeBlock title="Webhook you receive afterwards" code={pretty({ ...out.webhook, business_id: BIZ, created: '2026-09-30T04:17:05.000Z' })} />
              : <p className="dv-muted">No webhook is sent for this outcome.</p>}
            <p className="try-assume">Illustrative: codes and shapes follow the public API from memory — confirm in docs.xendit.co.</p>
          </div>
        )}
      </section>
    </div>
  );
}
