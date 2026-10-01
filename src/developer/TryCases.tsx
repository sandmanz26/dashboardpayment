import { useMemo, useState } from 'react';
import { BookOpen, Check, Copy, RotateCcw, Send, SquareTerminal, X } from 'lucide-react';
import { BASE_URL, curl, pretty } from './postman';
import type { Endpoint } from './postman';
import { CodeBlock, copyText } from './ui';
import FreeRequestModal from './FreeRequestModal';
import CaseFlow from './CaseFlow';
import type { NodeState } from './CaseFlow';

/** Practice cases. Every value is dummy data; shapes follow the public API from memory — check docs.xendit.co. */
interface Sample { title: string; code: unknown }
interface Step { id: string; label: string; sub?: string; detail: string; samples: Sample[] }
interface Outcome {
  id: string; label: string; tone: 'ok' | 'bad'; status: number;
  /** Index of the step where this outcome is decided — earlier steps are reached, later ones are not. */
  stage: number;
  what: string; todo?: string; response: unknown; webhook?: Record<string, unknown>;
}
interface Case {
  id: string; title: string; blurb: string; method: 'POST'; path: string; docs?: string;
  /** Label of the button that runs the case, and whether the request goes to Xendit or to your own server. */
  action: string; external?: boolean;
  request: Record<string, unknown>;
  steps: Step[]; outcomes: Outcome[];
}

const BIZ = '65f0c1e2a4b7d900123abcde';
const NOW = '2026-09-30T04:17:05.000Z';
const hook = (event: string, data: Record<string, unknown>) => ({ event, business_id: BIZ, created: NOW, data });

export const CASES: Case[] = [
  {
    id: 'payout', title: 'Send a payout', blurb: 'Pay a bank account and see what happens when it succeeds or fails.',
    method: 'POST', path: '/v2/payouts', docs: '/apidocs/get-payment', action: 'Send request',
    request: { reference_id: 'payout-demo-001', channel_code: 'ID_BCA', channel_properties: { account_holder_name: 'John Doe', account_number: '0000000000' }, amount: 90000, currency: 'IDR', description: 'Test payout' },
    steps: [
      {
        id: 'req', label: 'Create payout', sub: 'POST /v2/payouts',
        detail: 'You send the destination and the amount. Pick a reference_id that is unique on your side — it is how you recognise this payout later.',
        samples: [
          { title: 'Request · application/json', code: { reference_id: 'payout-demo-001', channel_code: 'ID_BCA', channel_properties: { account_holder_name: 'John Doe', account_number: '0000000000' }, amount: 90000, currency: 'IDR', description: 'Test payout' } },
          { title: 'Headers', code: 'Authorization: Basic <base64 of xnd_development_•••:>\nIdempotency-key: payout-demo-001\nContent-Type: application/json' },
        ],
      },
      {
        id: 'validate', label: 'Xendit validates', sub: 'Balance and account',
        detail: 'Xendit checks your balance and the account format before accepting. A failure here is synchronous: you get it in the response and nothing is created.',
        samples: [
          { title: 'Accepted · 200', code: { id: 'disb-5e8a2c71', reference_id: 'payout-demo-001', status: 'ACCEPTED', amount: 90000, currency: 'IDR', created: NOW } },
          { title: 'Rejected · 400', code: { error_code: 'INSUFFICIENT_BALANCE', message: 'Your balance is not enough to cover this payout.' } },
        ],
      },
      {
        id: 'bank', label: 'Bank processes', sub: 'Asynchronous',
        detail: 'ACCEPTED only means Xendit took the instruction. The bank decides afterwards, and the result reaches you as a webhook — not in the original response.',
        samples: [
          { title: 'Webhook · payout.succeeded', code: hook('payout.succeeded', { id: 'disb-5e8a2c71', reference_id: 'payout-demo-001', status: 'SUCCEEDED', amount: 90000, currency: 'IDR' }) },
        ],
      },
    ],
    outcomes: [
      { stage: 2, id: 'ok', label: 'Succeeds', tone: 'ok', status: 200, response: { id: 'disb-5e8a2c71', reference_id: 'payout-demo-001', status: 'ACCEPTED', amount: 90000, currency: 'IDR' },
        what: 'The payout was accepted, then completed at the bank.', webhook: hook('payout.succeeded', { id: 'disb-5e8a2c71', reference_id: 'payout-demo-001', status: 'SUCCEEDED', amount: 90000 }) },
      { stage: 1, id: 'balance', label: 'Insufficient balance', tone: 'bad', status: 400, response: { error_code: 'INSUFFICIENT_BALANCE', message: 'Your balance is not enough to cover this payout.' },
        what: 'Nothing was sent. No webhook fires because the payout was never created.', todo: 'Top up your balance, then send again.' },
      { stage: 2, id: 'bank', label: 'Bank rejects account', tone: 'bad', status: 200, response: { id: 'disb-5e8a2c72', reference_id: 'payout-demo-001', status: 'ACCEPTED', amount: 90000 },
        what: 'Accepted first, then the bank refused the account. You learn about it from the webhook, not the response.', todo: 'Verify account number and holder name, then create a new payout with a new reference_id.',
        webhook: hook('payout.failed', { id: 'disb-5e8a2c72', reference_id: 'payout-demo-001', status: 'FAILED', failure_code: 'INVALID_DESTINATION' }) },
    ],
  },
  {
    id: 'refund', title: 'Refund a payment', blurb: 'Return money to a customer, in full or beyond what they paid.',
    method: 'POST', path: '/refunds', docs: '/apidocs/get-payment', action: 'Send request',
    request: { payment_request_id: 'pr-7d1c0f4a', reference_id: 'refund-demo-001', amount: 150000, currency: 'IDR', reason: 'REQUESTED_BY_CUSTOMER' },
    steps: [
      {
        id: 'req', label: 'Request refund', sub: 'POST /refunds',
        detail: 'Point at the payment you want to reverse. Leave out amount for a full refund, or set it for a partial one.',
        samples: [
          { title: 'Request · full refund', code: { payment_request_id: 'pr-7d1c0f4a', reference_id: 'refund-demo-001', currency: 'IDR', reason: 'REQUESTED_BY_CUSTOMER' } },
          { title: 'Request · partial refund', code: { payment_request_id: 'pr-7d1c0f4a', reference_id: 'refund-demo-002', amount: 50000, currency: 'IDR', reason: 'REQUESTED_BY_CUSTOMER' } },
        ],
      },
      {
        id: 'check', label: 'Xendit checks', sub: 'Refundable amount',
        detail: 'The refundable amount is what the customer paid minus refunds already made. Asking for more is rejected straight away.',
        samples: [
          { title: 'Accepted · 200', code: { id: 'rfd-2b9e1a77', payment_request_id: 'pr-7d1c0f4a', amount: 150000, currency: 'IDR', status: 'PENDING', created: NOW } },
          { title: 'Rejected · 400', code: { error_code: 'REFUND_AMOUNT_EXCEEDS_PAYMENT', message: 'Refund amount is greater than the refundable amount.' } },
        ],
      },
      {
        id: 'settle', label: 'Money returns', sub: 'Asynchronous',
        detail: 'PENDING becomes SUCCEEDED once the channel confirms. How long that takes depends on the channel — cards are slower than e-wallets.',
        samples: [{ title: 'Webhook · refund.succeeded', code: hook('refund.succeeded', { id: 'rfd-2b9e1a77', payment_request_id: 'pr-7d1c0f4a', amount: 150000, currency: 'IDR', status: 'SUCCEEDED' }) }],
      },
    ],
    outcomes: [
      { stage: 2, id: 'ok', label: 'Succeeds', tone: 'ok', status: 200, response: { id: 'rfd-2b9e1a77', status: 'PENDING', amount: 150000, currency: 'IDR' },
        what: 'The refund is created as PENDING and settles shortly after.', webhook: hook('refund.succeeded', { id: 'rfd-2b9e1a77', payment_request_id: 'pr-7d1c0f4a', amount: 150000, status: 'SUCCEEDED' }) },
      { stage: 1, id: 'over', label: 'More than paid', tone: 'bad', status: 400, response: { error_code: 'REFUND_AMOUNT_EXCEEDS_PAYMENT', message: 'Refund amount is greater than the refundable amount.' },
        what: 'You asked to refund more than the customer paid. Nothing was created.', todo: 'Lower the amount to the remaining refundable balance and send again.' },
      { stage: 1, id: 'twice', label: 'Already refunded', tone: 'bad', status: 400, response: { error_code: 'PAYMENT_ALREADY_REFUNDED', message: 'This payment has already been fully refunded.' },
        what: 'A full refund already exists for this payment.', todo: 'Fetch the existing refund instead of creating another.' },
    ],
  },
  {
    id: 'decline', title: 'Payment is declined', blurb: 'A customer tries to pay and it does not go through.',
    method: 'POST', path: '/v3/payment_requests', docs: '/apidocs/get-payment', action: 'Send request',
    request: { reference_id: 'order-demo-002', type: 'PAY', country: 'ID', currency: 'IDR', request_amount: 150000, channel_code: 'OVO', channel_properties: { mobile_number: '+628123456789' } },
    steps: [
      {
        id: 'req', label: 'Create request', sub: 'POST /v3/payment_requests',
        detail: 'You create the payment request. The response tells you what the customer still has to do — for an e-wallet that is approving in their app.',
        samples: [
          { title: 'Request · application/json', code: { reference_id: 'order-demo-002', type: 'PAY', country: 'ID', currency: 'IDR', request_amount: 150000, channel_code: 'OVO', channel_properties: { mobile_number: '+628123456789' } } },
          { title: 'Response · 200', code: { payment_request_id: 'pr-0f3a9c1f', reference_id: 'order-demo-002', status: 'REQUIRES_ACTION', actions: [{ type: 'PRESENT_TO_CUSTOMER', descriptor: 'MOBILE_APP_APPROVAL' }] } },
        ],
      },
      {
        id: 'approve', label: 'Customer approves', sub: 'In their wallet app',
        detail: 'Nothing happens on your side while you wait. The customer may approve, fail for lack of funds, or simply walk away.',
        samples: [{ title: 'Poll the request', code: 'GET ' + BASE_URL + '/v3/payment_requests/pr-0f3a9c1f\n\n# Polling is a fallback. The webhook is the source of truth.' }],
      },
      {
        id: 'settle', label: 'Xendit settles', sub: 'Result by webhook',
        detail: 'Success and failure arrive the same way: a webhook. Do not mark the order paid from the original 200 response.',
        samples: [
          { title: 'Webhook · payment.succeeded', code: hook('payment.succeeded', { payment_id: 'py-0f3a9c21', reference_id: 'order-demo-002', status: 'SUCCEEDED', request_amount: 150000 }) },
          { title: 'Webhook · payment.failed', code: hook('payment.failed', { payment_id: 'py-0f3a9c1f', reference_id: 'order-demo-002', status: 'FAILED', failure_code: 'INSUFFICIENT_BALANCE' }) },
        ],
      },
    ],
    outcomes: [
      { stage: 2, id: 'fail', label: 'E-wallet has no funds', tone: 'bad', status: 200, response: { payment_request_id: 'pr-0f3a9c1f', status: 'REQUIRES_ACTION' },
        what: 'The request was created, but the customer’s wallet could not cover it. The result arrives by webhook.', todo: 'Show the customer a retry option and create a new payment request.',
        webhook: hook('payment.failed', { payment_id: 'py-0f3a9c1f', reference_id: 'order-demo-002', status: 'FAILED', failure_code: 'INSUFFICIENT_BALANCE' }) },
      { stage: 2, id: 'expire', label: 'Customer never pays', tone: 'bad', status: 200, response: { payment_request_id: 'pr-0f3a9c20', status: 'REQUIRES_ACTION' },
        what: 'The customer abandoned checkout, so the request expired.', todo: 'Treat the order as unpaid and release held stock.',
        webhook: hook('payment_request.expiry', { payment_request_id: 'pr-0f3a9c20', reference_id: 'order-demo-002', status: 'EXPIRED' }) },
      { stage: 2, id: 'ok', label: 'Customer pays', tone: 'ok', status: 200, response: { payment_request_id: 'pr-0f3a9c21', status: 'REQUIRES_ACTION' },
        what: 'For comparison: the customer approves in their app.', webhook: hook('payment.succeeded', { payment_id: 'py-0f3a9c21', reference_id: 'order-demo-002', status: 'SUCCEEDED', request_amount: 150000 }) },
    ],
  },
  {
    id: 'token', title: 'Verify a webhook', blurb: 'Check x-callback-token so you never trust a forged request.',
    method: 'POST', path: 'your-server/webhooks/xendit', action: 'Deliver webhook', external: true,
    request: { event: 'payment.succeeded', business_id: BIZ, created: NOW, data: { payment_id: 'py-0f3a9c21', reference_id: 'order-demo-001', status: 'SUCCEEDED', request_amount: 150000 } },
    steps: [
      {
        id: 'recv', label: 'Xendit sends event', sub: 'With x-callback-token',
        detail: 'Every call carries your callback token and a webhook-id. Both matter: one proves who sent it, the other tells you whether you have seen it before.',
        samples: [
          { title: 'Headers', code: 'x-callback-token: 8f2b1c4d9e0a7f36b5c81d2e4a90f7c3\nwebhook-id: 66a1f0c2b7e4d8001c9e5a31-wh1\ncontent-type: application/json' },
          { title: 'Body', code: hook('payment.succeeded', { payment_id: 'py-0f3a9c21', reference_id: 'order-demo-001', status: 'SUCCEEDED', request_amount: 150000 }) },
        ],
      },
      {
        id: 'verify', label: 'You verify token', sub: 'Compare with stored',
        detail: 'Compare the header with the token from your dashboard. Use a constant-time comparison, and refuse the request before you read the body.',
        samples: [{ title: 'Node · express', code: `app.post('/webhooks/xendit', (req, res) => {\n  const got = req.get('x-callback-token') ?? '';\n  const want = process.env.XENDIT_CALLBACK_TOKEN;\n  if (got.length !== want.length ||\n      !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want))) {\n    return res.status(401).json({ error: 'invalid callback token' });\n  }\n  // ... deduplicate, then reply 2xx\n});` }],
      },
      {
        id: 'dedupe', label: 'You deduplicate', sub: 'By webhook-id',
        detail: 'Retries deliver the same event again, and events can arrive out of order. Store webhook-id with a unique constraint, and compare timestamps before overwriting a status.',
        samples: [
          { title: 'SQL', code: 'CREATE TABLE webhook_events (\n  webhook_id  text PRIMARY KEY,\n  event       text NOT NULL,\n  received_at timestamptz NOT NULL DEFAULT now()\n);\n\n-- Insert first. A conflict means you already handled it.\nINSERT INTO webhook_events (webhook_id, event)\nVALUES ($1, $2)\nON CONFLICT (webhook_id) DO NOTHING;' },
        ],
      },
    ],
    outcomes: [
      { stage: 1, id: 'ok', label: 'Token matches', tone: 'ok', status: 200, response: { received: true }, what: 'Your handler compared the header with your stored token and accepted the event.' },
      { stage: 1, id: 'bad', label: 'Token is wrong', tone: 'bad', status: 401, response: { error: 'invalid callback token' }, what: 'The header did not match, so your server refused the request and ignored the body.', todo: 'Return 401 and log it. Do not process the payload.' },
      { stage: 2, id: 'dup', label: 'Sent twice', tone: 'ok', status: 200, response: { received: true, duplicate: true }, what: 'A retry delivered the same event again. Your handler recognised the webhook-id and skipped re-processing.', todo: 'Store webhook-id and return 200 for ones you have seen.' },
    ],
  },
];

function CopyCurl({ ep }: { ep: Endpoint }) {
  const [done, setDone] = useState(false);
  return (
    <button className="dv-btn sm" onClick={async () => { if (await copyText(curl(ep))) { setDone(true); setTimeout(() => setDone(false), 1400); } }}>
      {done ? <Check size={14} /> : <Copy size={14} />}{done ? 'Copied' : 'Copy as cURL'}
    </button>
  );
}

export default function TryCases({ caseId }: { caseId: string }) {
  const c = CASES.find((x) => x.id === caseId)!;
  // Step and outcome ids live in one namespace, so they are prefixed to keep them distinct.
  const [sel, setSel] = useState<string | null>(`s-${c.steps[0].id}`);
  const [bodyText, setBodyText] = useState(() => pretty(c.request));
  const [mode, setMode] = useState(c.outcomes[0].id);
  const [ran, setRan] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [free, setFree] = useState<Endpoint | null>(null);

  const out = c.outcomes.find((o) => o.id === ran) ?? null;
  const step = c.steps.find((s) => `s-${s.id}` === sel) ?? null;
  const selected = c.outcomes.find((o) => `o-${o.id}` === sel) ?? null;

  const endpoint: Endpoint = useMemo(() => {
    let body: unknown = c.request;
    try { body = JSON.parse(bodyText); } catch { /* keep the last valid body */ }
    return { id: c.id, name: c.title, method: c.method, path: c.path, description: c.blurb, body, response: {} };
  }, [bodyText, c]);

  const states = useMemo<Record<string, NodeState>>(() => {
    const m: Record<string, NodeState> = {};
    c.steps.forEach((s, i) => {
      const k = `s-${s.id}`;
      if (!out) m[k] = i === 0 ? 'next' : 'locked';
      else if (i < out.stage) m[k] = 'done';
      else if (i === out.stage) m[k] = out.tone === 'bad' ? 'bad' : 'done';
      else m[k] = 'locked';
    });
    c.outcomes.forEach((o) => {
      m[`o-${o.id}`] = !out ? 'locked' : o.id === out.id ? (o.tone === 'bad' ? 'bad' : 'done') : 'todo';
    });
    return m;
  }, [c, out]);

  const send = () => {
    try { JSON.parse(bodyText); } catch (e) {
      setJsonError(`The body is not valid JSON, so nothing was sent — ${(e as Error).message}`);
      return;
    }
    setJsonError(null);
    setRan(mode);
    setSel(`o-${mode}`);
  };
  const reset = () => { setRan(null); setJsonError(null); setBodyText(pretty(c.request)); setSel(`s-${c.steps[0].id}`); };

  const isFirst = step?.id === c.steps[0].id;
  const locked = sel !== null && states[sel] === 'locked';

  return (
    <div className="dv-tab">
      <h2 className="dv-h1">{c.title}</h2>
      <p className="dv-muted">{c.blurb} <b>Test mode</b> — every value below is dummy data, and nothing is sent anywhere.</p>

      <div className="try-chart">
        <CaseFlow
          steps={c.steps.map((s) => ({ id: `s-${s.id}`, label: s.label, sub: s.sub }))}
          outcomes={c.outcomes.map((o) => ({ id: `o-${o.id}`, label: o.label, tone: o.tone }))}
          states={states}
          active={sel}
          onPick={(id) => setSel((cur) => (cur === id ? null : id))}
        />
        <p className="try-hint">
          {out ? 'Select any box to revisit it.' : 'Send the request to run the flow, or select a box to read its sample.'}
        </p>
      </div>

      {sel !== null && (
        <section className="try-panel" aria-label="Step detail">
          <button className="dv-x try-close" onClick={() => setSel(null)} aria-label="Close detail"><X size={16} /></button>

          {locked && (
            <div className="try-locked"><b>Not reached.</b> The flow stopped before this step — {out ? `${out.label.toLowerCase()} ended it earlier.` : 'send the request first.'}</div>
          )}

          {!locked && step && isFirst && (
            <>
              <h3>{step.label}</h3>
              <div className="try-req">
                <em className={`m ${c.method}`}>{c.method}</em>
                <code>{c.external ? c.path : BASE_URL + c.path}</code>
                <span className="dv-chip">{c.external ? 'Your endpoint · x-callback-token attached' : 'Basic auth · test key attached (xnd_development_••••)'}</span>
              </div>
              <textarea className="dv-ta" rows={9} value={bodyText} onChange={(e) => setBodyText(e.target.value)} spellCheck={false}
                aria-label="Request body" aria-invalid={!!jsonError} disabled={!!out} />
              {jsonError && <div className="dv-err" role="alert">{jsonError}</div>}

              <div className="try-actions">
                {!out && <button className="dv-btn primary" onClick={send}><Send size={14} />{c.action}</button>}
                {!out && (
                  <label className="try-mode">Simulate
                    <select value={mode} onChange={(e) => setMode(e.target.value)}>
                      {c.outcomes.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </label>
                )}
                {out && <button className="dv-btn" onClick={reset}><RotateCcw size={14} />Start over</button>}
                {!c.external && <CopyCurl ep={endpoint} />}
                {!c.external && <button className="dv-btn sm" onClick={() => setFree(endpoint)}><SquareTerminal size={14} />Open as free request</button>}
                {c.docs && <a className="dv-btn sm" href={c.docs}><BookOpen size={14} />API reference</a>}
              </div>

              {step.samples.slice(1).map((sm) => (
                <CodeBlock key={sm.title} title={sm.title} code={typeof sm.code === 'string' ? sm.code : pretty(sm.code)} />
              ))}
            </>
          )}

          {!locked && step && !isFirst && (
            <>
              <h3>{step.label}</h3>
              <p>{step.detail}</p>
              {step.samples.map((sm) => (
                <CodeBlock key={sm.title} title={sm.title} code={typeof sm.code === 'string' ? sm.code : pretty(sm.code)} />
              ))}
            </>
          )}

          {!locked && !step && selected && (
            <>
              <h3>{selected.label}</h3>
              <div className={selected.tone === 'ok' ? 'try-status completed' : 'try-fail'}>
                <span className="badge-s">{selected.status} · {selected.tone === 'ok' ? 'Happy path' : 'Failure case'}</span>
                <p><b>What happened:</b> {selected.what}</p>
                {selected.todo && <p><b>What to do:</b> {selected.todo}</p>}
              </div>
              <CodeBlock title={`Response · ${selected.status}`} code={pretty(selected.response)} />
              {selected.webhook
                ? <CodeBlock title="Webhook you receive afterwards" code={pretty(selected.webhook)} />
                : <p className="dv-muted">No webhook is sent for this outcome.</p>}
              {ran !== selected.id && <p className="dv-muted">This is the sample. Run the case from step 1 to see it as the outcome of your own request.</p>}
              {ran === selected.id && <div className="try-actions"><button className="dv-btn" onClick={reset}><RotateCcw size={14} />Start over</button></div>}
            </>
          )}

          <p className="try-assume">Dummy data. Codes and shapes follow the public API from memory — confirm in docs.xendit.co.</p>
        </section>
      )}

      {free && <FreeRequestModal base={free} onClose={() => setFree(null)} />}
    </div>
  );
}
