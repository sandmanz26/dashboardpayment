import { useMemo, useState } from 'react';
import { Check, Copy, FastForward, Lock, RotateCcw, RotateCw, Send, SquareTerminal } from 'lucide-react';
import { addAttempt, behaviourLabel, fmtInterval, fmtOffset, RETRY_S, summarise } from './delivery';
import type { Behaviour, Delivery } from './delivery';
import { invoicePaidPayload } from './samples';
import { BASE_URL, curl, pretty } from './postman';
import type { Endpoint } from './postman';
import { CodeBlock, copyText } from './ui';
import FreeRequestModal from './FreeRequestModal';

const PAY_AT = 45; // seconds after the invoice request that the simulated payment lands
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');

const DEFAULT_BODY = {
  external_id: 'invoice-demo-001',
  amount: 150000,
  currency: 'IDR',
  payer_email: 'customer@example.com',
  description: 'Try flow invoice',
};

interface Invoice { id: string; body: Record<string, unknown>; response: Record<string, unknown> }

function CopyCurl({ ep }: { ep: Endpoint }) {
  const [done, setDone] = useState(false);
  return (
    <button className="dv-btn sm" onClick={async () => { if (await copyText(curl(ep))) { setDone(true); setTimeout(() => setDone(false), 1400); } }}>
      {done ? <Check size={14} /> : <Copy size={14} />}{done ? 'Copied' : 'Copy as cURL'}
    </button>
  );
}

/** Defined at module level on purpose: a component declared inside TryFlow would remount on every render and drop input focus. */
function StepCard({ n, step, title, done, children }: { n: number; step: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className={`try-step ${step === n ? 'current' : ''} ${done ? 'done' : ''} ${step < n ? 'locked' : ''}`} aria-disabled={step < n}>
      <header><span className="n">{done ? <Check size={14} /> : step < n ? <Lock size={12} /> : n}</span><h3>{title}</h3></header>
      {step >= n && <div className="try-body">{children}</div>}
    </section>
  );
}

export default function TryFlow() {
  const [receiver] = useState(() => `https://r.example-receiver.test/${rid().slice(0, 10)}`);
  const [behaviour, setBehaviour] = useState<Behaviour>('ok');
  const [bodyText, setBodyText] = useState(() => JSON.stringify(DEFAULT_BODY, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [free, setFree] = useState<Endpoint | null>(null);
  const [note, setNote] = useState('');

  const step = !invoice ? 2 : !delivery ? 3 : 4;
  const sum = delivery ? summarise(delivery) : null;

  const invoiceEndpoint: Endpoint = useMemo(() => {
    let body: unknown = DEFAULT_BODY;
    try { body = JSON.parse(bodyText); } catch { /* keep default */ }
    return {
      id: 'invoice', name: 'Create invoice', method: 'POST', path: '/v2/invoices', description: 'Create an invoice.', body, response: {},
    };
  }, [bodyText]);

  const send = () => {
    let body: Record<string, unknown>;
    try { body = JSON.parse(bodyText); } catch {
      setError('The request body is not valid JSON. Fix the syntax and send again.'); return;
    }
    if (typeof body.external_id !== 'string' || !body.external_id.trim()) { setError('external_id is required. Add a unique string and send again.'); return; }
    if (typeof body.amount !== 'number' || !(body.amount > 0)) { setError('amount must be a number greater than 0. Change it and send again.'); return; }
    setError(null);
    const id = rid();
    setInvoice({
      id, body,
      response: {
        id, external_id: body.external_id, user_id: '65f0c1e2a4b7d900123abcde', status: 'PENDING', merchant_name: 'UIByte',
        amount: body.amount, payer_email: body.payer_email ?? null, description: body.description ?? null,
        invoice_url: `https://checkout-staging.xendit.co/web/${id}`, expiry_date: '2026-10-01T04:17:05.000Z',
        currency: (body.currency as string) ?? 'IDR', created: '2026-09-30T04:17:05.000Z', updated: '2026-09-30T04:17:05.000Z',
      },
    });
  };

  const simulatePay = () => {
    if (!invoice) return;
    setDelivery(addAttempt({ attempts: [] }, behaviour, PAY_AT, false));
    setNote('');
  };

  const skip = () => {
    if (!delivery || !sum?.nextAt) return;
    setDelivery(addAttempt(delivery, behaviour, sum.nextAt, false));
  };
  const resend = () => {
    if (!delivery) return;
    const last = delivery.attempts[delivery.attempts.length - 1];
    setDelivery(addAttempt(delivery, behaviour, last.at + 60, true));
    setNote('Manual resend recorded with your user and the time.');
  };
  const reset = () => { setInvoice(null); setDelivery(null); setError(null); setNote(''); };

  const timeline = useMemo(() => {
    const items: { t: number; tone: string; title: string; detail: string }[] = [];
    if (invoice) items.push({ t: 0, tone: 'ok', title: 'POST /v2/invoices → 200', detail: `Invoice ${invoice.id.slice(0, 8)}… created, status PENDING` });
    if (delivery) {
      items.push({ t: PAY_AT, tone: 'info', title: 'Payment simulated', detail: 'Invoice status becomes PAID' });
      delivery.attempts.forEach((a) => {
        const label = a.manual ? 'Manual resend' : a.n === 1 ? 'Webhook delivery' : `Retry ${a.n - 1}`;
        items.push({
          t: a.at,
          tone: a.behaviour === 'ok' ? 'ok' : 'bad',
          title: `${label} → ${a.code ?? 'no response'}`,
          detail: a.behaviour === 'silent' ? 'No response within 30 s' : `${a.ms} ms`,
        });
      });
    }
    return items;
  }, [invoice, delivery]);

  const webhookPayload = invoice ? invoicePaidPayload({
    id: invoice.id, external_id: String(invoice.body.external_id), amount: Number(invoice.body.amount),
    payer_email: invoice.body.payer_email as string | undefined, description: invoice.body.description as string | undefined,
  }) : null;

  return (
    <div className="dv-tab">
      <h2 className="dv-h1">Receive an invoice payment</h2>
      <p className="dv-muted">Create an invoice, simulate the payment, and watch the webhook reach your endpoint — including what happens when your endpoint fails.</p>
      <div className="try-banner"><b>Test mode.</b> Everything here is simulated in the browser with fictional data. No request leaves this page.</div>

      <StepCard step={step} n={1} title="Your receiver is ready" done={step > 1}>
        <p>Use this disposable URL as your notification URL while you experiment. It is a stand-in; choose how it behaves.</p>
        <div className="try-url"><code className="mono">{receiver}</code><button className="dv-copy" aria-label="Copy receiver URL" onClick={() => copyText(receiver)}><Copy size={14} /></button></div>
        <fieldset className="try-radios" aria-label="Receiver behaviour">
          <legend>Receiver behaviour</legend>
          {(['ok', 'error', 'silent'] as Behaviour[]).map((b) => (
            <label key={b} className={behaviour === b ? 'on' : ''}>
              <input type="radio" name="beh" checked={behaviour === b} onChange={() => setBehaviour(b)} />
              <b>{behaviourLabel[b]}</b>
              <span>{b === 'ok' ? 'Delivery completes' : b === 'error' ? 'Xendit retries on a schedule' : 'Timeout after 30 s — no automatic retry'}</span>
            </label>
          ))}
        </fieldset>
      </StepCard>

      <StepCard step={step} n={2} title="Create an invoice" done={!!invoice}>
        <div className="try-req"><em className="m POST">POST</em><code>{BASE_URL}/v2/invoices</code><span className="dv-chip">Basic auth · test key attached (xnd_development_••••)</span></div>
        <textarea className="dv-ta" rows={8} value={bodyText} onChange={(e) => setBodyText(e.target.value)} spellCheck={false} aria-label="Request body" aria-invalid={!!error} disabled={!!invoice} />
        {error && <div className="dv-err" role="alert">{error}</div>}
        <div className="try-actions">
          {!invoice && <button className="dv-btn primary" onClick={send}><Send size={14} />Send request</button>}
          <CopyCurl ep={invoiceEndpoint} />
          <button className="dv-btn sm" onClick={() => setFree(invoiceEndpoint)}><SquareTerminal size={14} />Open as free request</button>
        </div>
        {invoice && <CodeBlock title="Response · 200" code={pretty(invoice.response)} />}
      </StepCard>

      <StepCard step={step} n={3} title="Simulate the payment" done={!!delivery}>
        <p>Pay the invoice as a customer would. Xendit then sends one webhook to your receiver.</p>
        <div className="try-actions">
          <button className="dv-btn primary" onClick={simulatePay} disabled={!!delivery}>Simulate payment</button>
        </div>
        <p className="try-assume"><b>Assumed:</b> this button stands in for paying the invoice in test mode. The real mechanism is not an API call shown here — confirm it with engineering.</p>
      </StepCard>

      <StepCard step={step} n={4} title="Watch the webhook arrive" done={sum?.status === 'Completed'}>
        {delivery && sum && webhookPayload && (
          <>
            <div className={`try-status ${sum.status.toLowerCase()}`} role="status">
              <span className="badge-s">{sum.status}</span>
              <p>{sum.note}</p>
              {sum.nextAt != null && <p className="next">Next redelivery: <b>{fmtOffset(sum.nextAt)}</b> after the invoice request</p>}
            </div>

            <div className="try-behave">
              <span>Receiver now:</span>
              {(['ok', 'error', 'silent'] as Behaviour[]).map((b) => (
                <button key={b} className={behaviour === b ? 'on' : ''} aria-pressed={behaviour === b} onClick={() => setBehaviour(b)}>{behaviourLabel[b]}</button>
              ))}
            </div>
            <div className="try-actions">
              {sum.status === 'Pending' && <button className="dv-btn" onClick={skip}><FastForward size={14} />Skip to next retry</button>}
              {sum.status !== 'Completed' && <button className="dv-btn primary" onClick={resend}><RotateCw size={14} />Resend now</button>}
              <button className="dv-btn" onClick={reset}><RotateCcw size={14} />Start over</button>
            </div>
            {note && <p className="dv-muted" role="status">{note}</p>}

            <h4 className="try-h">Timeline</h4>
            <ol className="try-timeline">
              {timeline.map((i, k) => (
                <li key={k} className={i.tone}><span className="t">{fmtOffset(i.t)}</span><div><b>{i.title}</b><span>{i.detail}</span></div></li>
              ))}
              {sum.nextAt != null && <li className="future"><span className="t">{fmtOffset(sum.nextAt)}</span><div><b>Next automatic retry</b><span>Scheduled</span></div></li>}
            </ol>

            <details className="try-details" open>
              <summary>What Xendit sent</summary>
              <CodeBlock title="Headers" code={`x-callback-token: ••••••••••••••••\nwebhook-id: ${invoice!.id}-wh1\ncontent-type: application/json`} />
              <CodeBlock title="Body · application/json" code={pretty(webhookPayload)} />
            </details>
            <details className="try-details">
              <summary>Retry schedule</summary>
              <p className="dv-muted">After the first attempt: {RETRY_S.map(fmtInterval).join(', ')}. Any 2xx counts as success; a 30 s silence is a Timeout and is never retried automatically. <em>Interval measured from the previous attempt is assumed.</em></p>
              <p className="dv-muted">Receiver duties: verify <code>x-callback-token</code>, reply 2xx immediately, process afterwards, and deduplicate with <code>webhook-id</code>.</p>
            </details>
          </>
        )}
      </StepCard>
      {free && <FreeRequestModal base={free} onClose={() => setFree(null)} />}
    </div>
  );
}
