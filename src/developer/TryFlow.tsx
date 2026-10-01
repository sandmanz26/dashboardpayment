import { useMemo, useState } from 'react';
import { BookOpen, Copy, Check, FastForward, RotateCcw, RotateCw, Send, SquareTerminal, X } from 'lucide-react';
import { addAttempt, behaviourLabel, fmtInterval, fmtOffset, RETRY_S, summarise } from './delivery';
import type { Behaviour, Delivery } from './delivery';
import { invoicePaidPayload } from './samples';
import { BASE_URL, curl, pretty } from './postman';
import type { Endpoint } from './postman';
import { CodeBlock, copyText } from './ui';
import FreeRequestModal from './FreeRequestModal';
import TryDiagram from './TryDiagram';
import type { NodeId, NodeState } from './TryDiagram';

const PAY_AT = 45; // seconds after the invoice request that the simulated payment lands
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');

const DEFAULT_BODY = {
  external_id: 'invoice-demo-001',
  amount: 150000,
  currency: 'IDR',
  payer_email: 'customer@example.com',
  description: 'Try flow invoice',
};

type SendMode = 'ok' | 'badkey' | 'duplicate';
const SEND_MODES: { id: SendMode; label: string }[] = [
  { id: 'ok', label: 'Normal request' },
  { id: 'badkey', label: 'Invalid API key' },
  { id: 'duplicate', label: 'Duplicate external_id' },
];

interface Invoice { id: string; body: Record<string, unknown>; response: Record<string, unknown> }
/** Error bodies are illustrative: the codes follow the public API but the wording should be checked against docs.xendit.co. */
interface ApiError { status: number; body: { error_code: string; message: string }; what: string; todo: string }

const API_ERRORS: Record<'badkey' | 'duplicate', ApiError> = {
  badkey: {
    status: 401,
    body: { error_code: 'INVALID_API_KEY', message: 'API key is not authorized to perform this request.' },
    what: 'Xendit rejected your credentials, so no invoice was created.',
    todo: 'Use a test-mode secret key (it starts with xnd_development_) as the Basic-auth username, with an empty password. Then send again.',
  },
  duplicate: {
    status: 400,
    body: { error_code: 'DUPLICATE_ERROR', message: 'An invoice with this external_id already exists.' },
    what: 'external_id must be unique per invoice, and this one was already used. Nothing new was created.',
    todo: 'Change external_id to a new value, or fetch the existing invoice instead of creating another. Then send again.',
  },
};

const validationError = (message: string): ApiError => ({
  status: 400,
  body: { error_code: 'API_VALIDATION_ERROR', message },
  what: 'Xendit could not accept the request body, so no invoice was created.',
  todo: 'Fix the field named in the message, then send again.',
});

function CopyCurl({ ep }: { ep: Endpoint }) {
  const [done, setDone] = useState(false);
  return (
    <button className="dv-btn sm" onClick={async () => { if (await copyText(curl(ep))) { setDone(true); setTimeout(() => setDone(false), 1400); } }}>
      {done ? <Check size={14} /> : <Copy size={14} />}{done ? 'Copied' : 'Copy as cURL'}
    </button>
  );
}

const LOCK_HINT: Partial<Record<NodeId, string>> = {
  pay: 'Create an invoice first — you can only pay an invoice that exists.',
  send: 'Simulate the payment first. The webhook is sent when the invoice is paid.',
};

export default function TryFlow() {
  const [receiver] = useState(() => `https://r.example-receiver.test/${rid().slice(0, 10)}`);
  const [behaviour, setBehaviour] = useState<Behaviour>('ok');
  const [sendMode, setSendMode] = useState<SendMode>('ok');
  const [bodyText, setBodyText] = useState(() => JSON.stringify(DEFAULT_BODY, null, 2));
  const [localError, setLocalError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [free, setFree] = useState<Endpoint | null>(null);
  const [note, setNote] = useState('');

  const sum = delivery ? summarise(delivery) : null;
  const manualDone = !!delivery?.attempts.some((a) => a.manual);

  const invoiceEndpoint: Endpoint = useMemo(() => {
    let body: unknown = DEFAULT_BODY;
    try { body = JSON.parse(bodyText); } catch { /* keep default */ }
    return { id: 'invoice', name: 'Create invoice', method: 'POST', path: '/v2/invoices', description: 'Create an invoice.', body, response: {} };
  }, [bodyText]);

  const states = useMemo<Record<NodeId, NodeState>>(() => {
    const d = !!delivery;
    const st = sum?.status;
    return {
      receiver: invoice ? 'done' : 'todo',
      invoice: apiError ? 'bad' : invoice ? 'done' : 'next',
      pay: !invoice ? 'locked' : d ? 'done' : 'next',
      send: !d ? 'locked' : st === 'Completed' ? 'done' : 'active',
      reply: !d ? 'locked' : 'active',
      completed: !d ? 'locked' : st === 'Completed' ? 'done' : 'todo',
      retry: !d ? 'locked' : st === 'Pending' ? 'warn' : st === 'Failed' ? 'bad' : 'todo',
      timeout: !d ? 'locked' : st === 'Timeout' ? 'bad' : 'todo',
      resend: !d ? 'locked' : manualDone ? 'done' : st === 'Timeout' || st === 'Failed' ? 'next' : 'todo',
    };
  }, [invoice, apiError, delivery, sum?.status, manualDone]);

  const send = () => {
    setApiError(null); setLocalError(null);
    let body: Record<string, unknown>;
    try { body = JSON.parse(bodyText); } catch {
      setLocalError('The request body is not valid JSON, so nothing was sent. Fix the syntax and send again.'); return;
    }
    if (sendMode !== 'ok') { setApiError(API_ERRORS[sendMode]); return; }
    if (typeof body.external_id !== 'string' || !body.external_id.trim()) { setApiError(validationError('external_id is required')); return; }
    if (typeof body.amount !== 'number' || !(body.amount > 0)) { setApiError(validationError('amount must be a number greater than 0')); return; }
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
    setSelected('pay');
  };

  const simulatePay = () => {
    if (!invoice) return;
    setDelivery(addAttempt({ attempts: [] }, behaviour, PAY_AT, false));
    setNote(''); setSelected('send');
  };
  const skip = () => { if (delivery && sum?.nextAt) setDelivery(addAttempt(delivery, behaviour, sum.nextAt, false)); };
  const resend = () => {
    if (!delivery) return;
    setDelivery(addAttempt(delivery, behaviour, delivery.attempts[delivery.attempts.length - 1].at + 60, true));
    setNote('Manual resend recorded with your user and the time.');
  };
  const reset = () => { setInvoice(null); setDelivery(null); setApiError(null); setLocalError(null); setNote(''); setSendMode('ok'); setSelected(null); };

  const select = (id: NodeId) => setSelected((cur) => (cur === id ? null : id));

  const timeline = useMemo(() => {
    const items: { t: number; tone: string; title: string; detail: string }[] = [];
    if (invoice) items.push({ t: 0, tone: 'ok', title: 'POST /v2/invoices → 200', detail: `Invoice ${invoice.id.slice(0, 8)}… created, status PENDING` });
    if (delivery) {
      items.push({ t: PAY_AT, tone: 'info', title: 'Payment simulated', detail: 'Invoice status becomes PAID' });
      delivery.attempts.forEach((a) => {
        const label = a.manual ? 'Manual resend' : a.n === 1 ? 'Webhook delivery' : `Retry ${a.n - 1}`;
        items.push({ t: a.at, tone: a.behaviour === 'ok' ? 'ok' : 'bad', title: `${label} → ${a.code ?? 'no response'}`, detail: a.behaviour === 'silent' ? 'No response within 30 s' : `${a.ms} ms` });
      });
    }
    return items;
  }, [invoice, delivery]);

  const webhookPayload = invoice ? invoicePaidPayload({
    id: invoice.id, external_id: String(invoice.body.external_id), amount: Number(invoice.body.amount),
    payer_email: invoice.body.payer_email as string | undefined, description: invoice.body.description as string | undefined,
  }) : null;

  const panelKind: 'receiver' | 'invoice' | 'pay' | 'watch' | null =
    selected === null ? null : selected === 'receiver' ? 'receiver' : selected === 'invoice' ? 'invoice' : selected === 'pay' ? 'pay' : 'watch';
  const locked = selected !== null && states[selected] === 'locked';
  const nextNode = (Object.keys(states) as NodeId[]).find((k) => states[k] === 'next');

  const behaviourButtons = (
    <div className="try-behave">
      <span>Receiver replies</span>
      {(['ok', 'error', 'silent'] as Behaviour[]).map((b) => (
        <button key={b} className={behaviour === b ? 'on' : ''} aria-pressed={behaviour === b} onClick={() => setBehaviour(b)}>{behaviourLabel[b]}</button>
      ))}
    </div>
  );

  return (
    <div className="dv-tab">
      <h2 className="dv-h1">Receive an invoice payment</h2>
      <p className="dv-muted">
        From invoice to webhook, and what happens when your endpoint fails. <b>Test mode</b> — everything is simulated in your browser with fictional data.
      </p>

      <div className="try-chart">
        <TryDiagram states={states} selected={selected} onSelect={select} />
        <p className="try-hint" aria-live="polite">
          {selected === null
            ? nextNode ? 'Select a step to try it. Next up: ' : 'Select any step to see it in action.'
            : ''}
          {selected === null && nextNode && <b>{nextNode === 'invoice' ? 'Create invoice' : nextNode === 'pay' ? 'Simulate payment' : 'Resend manually'}</b>}
        </p>
      </div>

      {selected !== null && (
        <section className="try-panel" aria-label="Step detail">
          <button className="dv-x try-close" onClick={() => setSelected(null)} aria-label="Close detail"><X size={16} /></button>

          {locked && (
            <div className="try-locked">
              <b>Locked.</b> {LOCK_HINT[selected] ?? LOCK_HINT.send}
            </div>
          )}

          {!locked && panelKind === 'receiver' && (
            <>
              <h3>Your receiver</h3>
              <p>Use this disposable URL as your notification URL. It is a stand-in; choose how it behaves when Xendit calls it.</p>
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
            </>
          )}

          {!locked && panelKind === 'invoice' && (
            <>
              <h3>Create an invoice</h3>
              <div className="try-req"><em className="m POST">POST</em><code>{BASE_URL}/v2/invoices</code><span className="dv-chip">Basic auth · test key attached (xnd_development_••••)</span></div>
              <textarea className="dv-ta" rows={8} value={bodyText} onChange={(e) => setBodyText(e.target.value)} spellCheck={false}
                aria-label="Request body" aria-invalid={!!localError || !!apiError} disabled={!!invoice} />
              {localError && <div className="dv-err" role="alert">{localError}</div>}
              <div className="try-actions">
                {!invoice && <button className="dv-btn primary" onClick={send}><Send size={14} />Send request</button>}
                {!invoice && (
                  <label className="try-mode">Simulate
                    <select value={sendMode} onChange={(e) => setSendMode(e.target.value as SendMode)}>
                      {SEND_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </label>
                )}
                <CopyCurl ep={invoiceEndpoint} />
                <button className="dv-btn sm" onClick={() => setFree(invoiceEndpoint)}><SquareTerminal size={14} />Open as free request</button>
                <a className="dv-btn sm" href="/apidocs/get-payment"><BookOpen size={14} />API reference</a>
              </div>

              {apiError && (
                <div className="try-fail" role="alert">
                  <span className="badge-s">{apiError.status} · {apiError.body.error_code}</span>
                  <p><b>What happened:</b> {apiError.what}</p>
                  <p><b>What to do:</b> {apiError.todo}</p>
                  <p className="try-next-locked">Step 3 stays locked until an invoice is created.</p>
                  <CodeBlock title={`Response · ${apiError.status}`} code={pretty(apiError.body)} />
                  <p className="try-assume">Illustrative: error codes follow the public API, but check the exact wording in docs.xendit.co.</p>
                </div>
              )}
              {invoice && <CodeBlock title="Response · 200" code={pretty(invoice.response)} />}
            </>
          )}

          {!locked && panelKind === 'pay' && (
            <>
              <h3>Simulate the payment</h3>
              <p>Pay the invoice as a customer would. Xendit then sends one webhook to your receiver.</p>
              {behaviourButtons}
              <div className="try-actions">
                <button className="dv-btn primary" onClick={simulatePay} disabled={!!delivery}>Simulate payment</button>
              </div>
              <p className="try-assume"><b>Assumed:</b> this button stands in for paying the invoice in test mode. The real mechanism is not an API call shown here — confirm it with engineering.</p>
            </>
          )}

          {!locked && panelKind === 'watch' && delivery && sum && webhookPayload && (
            <>
              <div className={`try-status ${sum.status.toLowerCase()}`} role="status">
                <span className="badge-s">{sum.status}</span>
                <p>{sum.note}</p>
                {sum.nextAt != null && <p className="next">Next redelivery: <b>{fmtOffset(sum.nextAt)}</b> after the invoice request</p>}
              </div>
              {behaviourButtons}
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

              <details className="try-details">
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
        </section>
      )}
      {free && <FreeRequestModal base={free} onClose={() => setFree(null)} />}
    </div>
  );
}
