import { useEffect, useRef, useState } from 'react';
import { RotateCw, X } from 'lucide-react';
import { eventAttempts, eventPayload } from '../data/events';
import type { DevEvent } from '../data/events';
import { pretty } from './postman';
import { CodeBlock, CopyButton } from './ui';

export default function EventDrawer({ event, onClose }: { event: DevEvent; onClose: () => void }) {
  const [msg, setMsg] = useState('');
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => setMsg(''), [event.id]);
  const attempts = eventAttempts(event);

  return (
    <>
      <div className="xds-drawer-scrim" onClick={onClose} />
      <aside className="xds-drawer" role="dialog" aria-label={`Event ${event.name}`}>
        <header>
          <div>
            <span className={`xds-tag ${event.status === 'Succeeded' ? 'ok' : 'bad'}`}>{event.status}</span>
            <h2 className="mono">{event.name}</h2>
          </div>
          <button className="xds-icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
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

        <div className="xds-drawer-foot">
          <button className="xds-button primary" onClick={() => setMsg('Resend queued — check delivery attempts in a moment.')}><RotateCw size={14} />Resend webhook</button>
          {msg && <span className="dv-muted" role="status">{msg}</span>}
        </div>
      </aside>
    </>
  );
}
