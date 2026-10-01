import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { webhookGroups } from '../data/webhooks';
import { sampleFor } from './samples';
import { pretty } from './postman';
import { CodeBlock, Modal } from './ui';

export interface SavedEndpoint { id: string; name: string; url: string; events: string[]; createdAt: string; lastTest?: { ok: boolean; ms: number } }

/** Rules from the Xendit docs (per the handoff): public URL, no localhost, no port. */
export function validateUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return 'Enter the URL where Xendit should send events.';
  let u: URL;
  try { u = new URL(v); } catch { return 'This doesn’t look like a URL. Start with https:// and include the domain.'; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'Use an http:// or https:// URL.';
  const h = u.hostname;
  if (h === 'localhost' || /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h) || h.endsWith('.local') || h === '::1')
    return 'Xendit can’t reach localhost or private addresses. Use a public URL — a tunnel such as ngrok works while developing.';
  if (u.port) return 'Remove the port number. Xendit only sends to the default port.';
  if (!h.includes('.')) return 'Add a full domain, for example hooks.example.com.';
  return null;
}

const key = (g: string, i: string) => `${g}/${i}`;

function GroupCheck({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate: boolean; onChange: () => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} />;
}

export default function EndpointModal({ onSave, onClose }: { onSave: (e: SavedEndpoint) => void; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState<{ g: string; i: string }>({ g: 'Invoices', i: 'Invoices paid' });
  const [test, setTest] = useState<{ state: 'idle' | 'sending' | 'done'; ms?: number }>({ state: 'idle' });

  const urlError = validateUrl(url);
  const shownError = touched ? urlError : null;

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    return webhookGroups
      .map((g) => ({ ...g, items: s && !g.title.toLowerCase().includes(s) ? g.items.filter((i) => i.toLowerCase().includes(s)) : g.items }))
      .filter((g) => g.items.length);
  }, [q]);

  const toggle = (k: string) => setSel((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleGroup = (g: { title: string; items: string[] }) => setSel((p) => {
    const n = new Set(p);
    const all = g.items.every((i) => n.has(key(g.title, i)));
    g.items.forEach((i) => (all ? n.delete(key(g.title, i)) : n.add(key(g.title, i))));
    return n;
  });

  const sample = sampleFor(focus.i);

  const sendTest = () => {
    setTouched(true);
    if (urlError) return;
    setTest({ state: 'sending' });
    setTimeout(() => setTest({ state: 'done', ms: 90 + Math.round(Math.random() * 120) }), 700);
  };
  const save = () => {
    setTouched(true);
    if (urlError || sel.size === 0) return;
    onSave({
      id: crypto.randomUUID(), name: name.trim() || new URL(url.trim()).hostname, url: url.trim(),
      events: [...sel], createdAt: new Date().toISOString(), lastTest: test.state === 'done' ? { ok: true, ms: test.ms! } : undefined,
    });
  };

  return (
    <Modal title="Add endpoint" subtitle="Choose where Xendit sends events and which events it sends." onClose={onClose} width={1040}>
      <div className="ep-grid">
        <div className="ep-form">
          <label>Endpoint URL
            <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} onBlur={() => setTouched(true)} placeholder="https://hooks.example.com/xendit"
              aria-invalid={!!shownError} aria-describedby="ep-url-err" />
            <span id="ep-url-err" className="dv-err" role={shownError ? 'alert' : undefined}>{shownError}</span>
          </label>
          <label><span>Name <span className="opt">(optional)</span></span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Orders service" />
          </label>

          <div className="ep-picker">
            <div className="ep-picker-head">
              <b>Events</b><span className="dv-muted">{sel.size} selected</span>
            </div>
            <label className="dv-search"><Search size={15} /><input placeholder="Search events" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search events" /></label>
            <div className="ep-list" role="group" aria-label="Events">
              {groups.map((g) => {
                const n = g.items.filter((i) => sel.has(key(g.title, i))).length;
                return (
                  <div key={g.title}>
                    <label className="ep-group"><GroupCheck checked={n === g.items.length} indeterminate={n > 0 && n < g.items.length} onChange={() => toggleGroup(g)} label={`Select all in ${g.title}`} />{g.title}</label>
                    {g.items.map((i) => (
                      <label key={i} className={`ep-item ${focus.i === i && focus.g === g.title ? 'focus' : ''}`} onMouseEnter={() => setFocus({ g: g.title, i })} onFocus={() => setFocus({ g: g.title, i })}>
                        <input type="checkbox" checked={sel.has(key(g.title, i))} onChange={() => toggle(key(g.title, i))} />
                        <span><b>{i}</b><em>{sampleFor(i).fires}</em></span>
                      </label>
                    ))}
                  </div>
                );
              })}
              {groups.length === 0 && <div className="dv-empty"><p className="dv-muted">No events match “{q}”.</p></div>}
            </div>
            {touched && sel.size === 0 && <span className="dv-err" role="alert">Select at least one event to save this endpoint.</span>}
          </div>
        </div>

        <aside className="ep-sample" aria-label="Sample payload">
          <h3>Sample payload</h3>
          <p className="ep-event mono">{focus.i}</p>
          <p className="dv-muted">{sample.fires}</p>
          <CodeBlock title="application/json" code={pretty(sample.payload)} />
          <p className="ep-foot">{sample.illustrative ? 'Illustrative shape with fictional values — check docs.xendit.co for the exact fields.' : 'Fictional values. Fields follow the public docs as closely as this prototype could — verify before relying on them.'}</p>
        </aside>
      </div>
      <footer className="ep-foot-bar">
        <div className="ep-test" role="status">
          {test.state === 'sending' && 'Sending test event…'}
          {test.state === 'done' && <>Test event delivered · <b>200 OK</b> · {test.ms} ms <span className="dv-muted">(simulated)</span></>}
        </div>
        <button className="xds-button" onClick={sendTest} disabled={test.state === 'sending'}>Send test event</button>
        <button className="xds-button primary" onClick={save}>Save endpoint</button>
      </footer>
    </Modal>
  );
}
