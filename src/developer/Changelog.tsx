import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Kind = 'New' | 'Improved' | 'Fixed';
interface Entry { date: string; title: string; kind: Kind; items: string[] }

/** Newest first. Mirrors the actual history of this dashboard's Developer area. */
export const CHANGELOG: Entry[] = [
  { date: '2026-10-01', title: 'More Try cases and a changelog', kind: 'New', items: [
    'Try now has four extra cases: send a payout, refund a payment, a declined payment, and verify a webhook.',
    'Each case lets you pick an outcome and shows the response and the webhook that follows.',
    'This changelog.' ] },
  { date: '2026-09-30', title: 'API reference page', kind: 'New', items: [
    'Open the Get payment reference from Guides at /apidocs/get-payment.',
    'The page is a read-only copy; Try it does not send requests.' ] },
  { date: '2026-09-30', title: 'Flowchart Try flow', kind: 'Improved', items: [
    'The guided flow is now a flowchart; select a step to see its simulation.',
    'Invalid API key and duplicate external_id are simulated as API failures, and later steps stay locked.' ] },
  { date: '2026-09-30', title: 'Webhook testing and Add endpoint', kind: 'New', items: [
    'Add endpoint modal with sample payloads, delivery timeline and manual resend.',
    'Retry schedule simulation, including 30 s timeouts.' ] },
  { date: '2026-09-30', title: 'Try on Postman', kind: 'New', items: [
    'Download a Postman collection and environment for every endpoint.',
    'Generate API keys and inspect events in a side drawer.' ] },
  { date: '2026-09-30', title: 'Modal input focus', kind: 'Fixed', items: [
    'Typing in a modal field no longer loses focus after every keystroke.' ] },
  { date: '2026-09-30', title: 'Developer area launched', kind: 'New', items: [
    'New Developer menu with Guides, API keys, Webhooks and Events.' ] },
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
      <div className="dv-scrim" onClick={onClose} />
      <aside className="dv-drawer" role="dialog" aria-label="Changelog">
        <header>
          <div><h2 style={{ marginTop: 0 }}>Changelog</h2><p className="dv-muted">History of changes to the Developer area.</p></div>
          <button className="dv-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <ol className="cl-list">
          {CHANGELOG.map((e, i) => (
            <li key={i}>
              <div className="cl-meta"><time>{e.date}</time><span className={`cl-kind ${e.kind.toLowerCase()}`}>{e.kind}</span></div>
              <h3>{e.title}</h3>
              <ul>{e.items.map((t, k) => <li key={k}>{t}</li>)}</ul>
            </li>
          ))}
        </ol>
      </aside>
    </>
  );
}
