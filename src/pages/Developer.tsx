import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ellipsis, ExternalLink, Link2, ListFilter, Search, Terminal, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Webhooks } from './Developers';
import { events } from '../data/events';
import type { DevEvent } from '../data/events';
import ApiKeysTab from '../developer/ApiKeysTab';
import EventDrawer from '../developer/EventDrawer';
import PostmanModal from '../developer/PostmanModal';
import { curl, endpoints } from '../developer/postman';
import { CodeBlock, CopyButton } from '../developer/ui';
import '../developer/developer.css';

const TABS = [
  { key: 'guides', label: 'Guides' },
  { key: 'api-keys', label: 'API keys' },
  { key: 'webhooks', label: 'Webhooks' },
  { key: 'events', label: 'Events' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

/** Focus the given input when "/" is pressed outside a text field. */
function useSlashFocus(ref: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault(); ref.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ref]);
}

function Guides({ go, openPostman }: { go: (t: TabKey) => void; openPostman: () => void }) {
  return (
    <div className="dv-tab">
      <h2 className="dv-h1">Start developing with Xendit</h2>
      <p className="dv-muted">Guides and resources to get you started on developing with Xendit.</p>

      <section className="dv-panel">
        <header><h3>Things you can do</h3></header>
        <div className="dv-row">
          <div>
            <h4>Manage API keys</h4>
            <p className="dv-muted">Generate and manage your API keys.</p>
          </div>
          <button className="dv-btn primary" onClick={() => go('api-keys')}>Manage API keys</button>
        </div>
        <div className="dv-row">
          <div className="grow">
            <h4>Make API calls</h4>
            <p>Use your account API credentials to make API calls.</p>
            <CodeBlock title="cURL · Get balance" code={curl(endpoints[0])} />
            <a className="dv-link" href="#api-guide"><Link2 size={14} />API guide</a>
          </div>
          <button className="dv-btn" onClick={openPostman}><Terminal size={14} />Try on Postman</button>
        </div>
        <div className="dv-row">
          <div>
            <h4>Configure Webhooks</h4>
            <p>Subscribe to Xendit events and receive notifications.</p>
            <a className="dv-link" href="#webhook-guide"><Link2 size={14} />Webhook guide</a>
          </div>
          <button className="dv-btn" onClick={() => go('webhooks')}>Add Webhook</button>
        </div>
      </section>
    </div>
  );
}

function WebhooksTab() {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useSlashFocus(ref);
  return (
    <div className="dv-tab">
      <div className="dv-intro">
        <p>Webhooks send notifications and callbacks for asynchronous updates about events on the Xendit platform. <a className="dv-link inline" href="#webhook-guide">View webhook guide <ExternalLink size={13} /></a></p>
      </div>
      <label className="dv-search wide">
        <Search size={16} />
        <input ref={ref} placeholder="Search products or events, e.g. “payout”  (press / to focus)" value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button aria-label="Clear" onClick={() => setQ('')}><X size={14} /></button>}
      </label>
      <div className="dev-page flush"><Webhooks filter={q} /></div>
    </div>
  );
}

function EventsTab() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'All' | 'Succeeded' | 'Failed'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<DevEvent | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  useSlashFocus(ref);

  const rows = useMemo(
    () => events.filter((e) => (status === 'All' || e.status === status) && (!q || `${e.id} ${e.name}`.toLowerCase().includes(q.toLowerCase()))),
    [q, status],
  );
  const all = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="dv-tab">
      <div className="dv-filterbar">
        <button className={`dv-filter ${showFilters || status !== 'All' ? 'on' : ''}`} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
          <ListFilter size={16} />Filters{status !== 'All' && <i className="dot" />}
        </button>
        <label className="dv-search">
          <Search size={16} />
          <input ref={ref} placeholder="Search by event name or ID  (press / to focus)" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      {showFilters && (
        <div className="dv-chips" role="group" aria-label="Status">
          {(['All', 'Succeeded', 'Failed'] as const).map((s) => (
            <button key={s} className={status === s ? 'on' : ''} aria-pressed={status === s} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      )}
      <table className="dv-table ev">
        <thead>
          <tr>
            <th className="chk"><input type="checkbox" aria-label="Select all" checked={all} onChange={() => setSel(all ? new Set() : new Set(rows.map((r) => r.id)))} /></th>
            <th>Time (UTC+7)</th><th>Event name</th><th>Event from</th><th>Status</th><th>Event ID</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="clickable" tabIndex={0} onClick={() => setOpen(e)} onKeyDown={(ev) => ev.key === 'Enter' && setOpen(e)}>
              <td className="chk" onClick={(ev) => ev.stopPropagation()}><input type="checkbox" aria-label={`Select ${e.name}`} checked={sel.has(e.id)} onChange={() => toggle(e.id)} /></td>
              <td>{e.time}</td>
              <td className="mono">{e.name}</td>
              <td>{e.from}</td>
              <td><span className={`ev-badge ${e.status === 'Succeeded' ? 'ok' : 'bad'}`}>{e.status}</span></td>
              <td className="mono idcell"><span>{e.id}</span><CopyButton text={e.id} label="Copy event ID" className="hover" /></td>
              <td className="right"><button className="dv-icon" aria-label="Actions" onClick={(ev) => { ev.stopPropagation(); setOpen(e); }}><Ellipsis size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="dv-empty"><p><b>No events match</b></p><p className="dv-muted">Try clearing the search or status filter.</p></div>}
      {open && <EventDrawer event={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

export default function Developer() {
  const [params, setParams] = useSearchParams();
  const [postman, setPostman] = useState(false);
  const raw = params.get('tab');
  const tab: TabKey = TABS.some((t) => t.key === raw) ? (raw as TabKey) : 'guides';
  const go = (t: TabKey) => setParams(t === 'guides' ? {} : { tab: t });

  return (
    <>
      <PageHeader title="Developer">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => go(t.key)}>{t.label}</button>
          ))}
        </div>
      </PageHeader>

      {tab === 'guides' && <Guides go={go} openPostman={() => setPostman(true)} />}
      {tab === 'api-keys' && <ApiKeysTab />}
      {tab === 'webhooks' && <WebhooksTab />}
      {tab === 'events' && <EventsTab />}
      {postman && <PostmanModal onClose={() => setPostman(false)} />}
      <div style={{ height: 48 }} />
    </>
  );
}
