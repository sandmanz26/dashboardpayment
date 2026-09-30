import { useEffect, useState } from 'react';
import { RotateCw, X } from 'lucide-react';
import { eventAttempts, eventPayload } from '../data/events';
import type { DevEvent } from '../data/events';
import { pretty } from './postman';
import { CodeBlock, CopyButton } from './ui';

export default function EventDrawer({ event, onClose }: { event: DevEvent; onClose: () => void }) {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => setMsg(''), [event.id]);
  const attempts = eventAttempts(event);

  return (
    <>
      <div className="dv-scrim" onClick={onClose} />
      <aside className="dv-drawer" role="dialog" aria-label={`Event ${event.name}`}>
        <header>
          <div>
            <span className={`ev-badge ${event.status === 'Succeeded' ? 'ok' : 'bad'}`}>{event.status}</span>
            <h2 className="mono">{event.name}</h2>
          </div>
          <button className="dv-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>

        <dl className="dv-meta">
          <div><dt>Event ID</dt><dd className="mono">{event.id}<CopyButton text={event.id} label="Copy event ID" /></dd></div>
          <div><dt>Time (UTC+7)</dt><dd>{event.time}</dd></div>
          <div><dt>Event from</dt><dd>{event.from}</dd></div>
          <div><dt>API version</dt><dd className="mono">2025-06-30</dd></div>
        </dl>

        <h3>Payload</h3>
        <CodeBlock title="application/json" code={pretty(eventPayload(event))} />

        <h3>Delivery attempts</h3>
        <ul className="dv-attempts">
          {attempts.map((a, i) => (
            <li key={i}>
              <span className={`code ${a.code < 300 ? 'ok' : 'bad'}`}>{a.code}</span>
              <span className="mono url">{a.url}</span>
              <span className="dv-muted">{a.ms} ms · {a.at}</span>
            </li>
          ))}
        </ul>

        <div className="dv-drawer-foot">
          <button className="dv-btn primary" onClick={() => setMsg('Resend queued — check delivery attempts in a moment.')}><RotateCw size={14} />Resend webhook</button>
          {msg && <span className="dv-muted" role="status">{msg}</span>}
        </div>
      </aside>
    </>
  );
}
