import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, History, KeyRound, Webhook, Ellipsis, ExternalLink, Link2, ListFilter, Play, Search, Terminal, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Webhooks } from './Developers';
import { events } from '../data/events';
import type { DevEvent } from '../data/events';
import ApiKeysTab from '../developer/ApiKeysTab';
import EventDrawer from '../developer/EventDrawer';
import PostmanModal from '../developer/PostmanModal';
import EndpointsPanel from '../developer/EndpointsPanel';
import TryFlow from '../developer/TryFlow';
import TryCases, { CASES } from '../developer/TryCases';
import Changelog from '../developer/Changelog';
import { curl, endpoints } from '../developer/postman';
import { CodeBlock, CopyButton } from '../developer/ui';
import '../developer/developer.css';

const TABS = [
  { key: 'guides', label: 'Guides' },
  { key: 'try', label: 'Try' },
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

function TryTab() {
  const [params, setParams] = useSearchParams();
  const c = params.get('case') ?? 'invoice';
  const choose = (id: string) => { const n = new URLSearchParams(params); n.set('tab', 'try'); if (id === 'invoice') n.delete('case'); else n.set('case', id); setParams(n); };
  const items = [{ id: 'invoice', title: 'Receive an invoice payment' }, ...CASES];
  return (
    <>
      <div className="dv-screen" style={{ paddingBottom: 0 }}>
        <div className="try-picker" role="group" aria-label="Try case">
          {items.map((i) => <button key={i.id} aria-pressed={c === i.id} onClick={() => choose(i.id)}>{i.title}</button>)}
        </div>
      </div>
      {c === 'invoice' || !CASES.some((x) => x.id === c) ? <TryFlow /> : <TryCases key={c} caseId={c} />}
    </>
  );
}

function Guides({ go, openPostman }: { go: (t: TabKey) => void; openPostman: () => void }) {
  return (
    <div className="dv-screen">
      <h2 className="dv-h1">Start developing with Xendit</h2>
      <p className="dv-muted">Guides and resources to get you started on developing with Xendit.</p>

      <section className="dv-panel try-cta">
        <div>
          <h3>Try it: receive an invoice payment</h3>
          <p className="dv-muted">Create an invoice, simulate the payment and watch the webhook arrive — then break your receiver on purpose to see retries and timeouts.</p>
        </div>
        <button className="xds-button primary" onClick={() => go('try')}>Start guided flow</button>
      </section>

      <section className="dv-panel">
        <header><h3>Things you can do</h3></header>
        <div className="dv-cards">
          <article className="dv-card">
            <span className="dv-card-ic keys"><KeyRound size={18} /></span>
            <h4>Manage API keys</h4>
            <p className="dv-muted">Generate and manage your API keys.</p>
            <button className="xds-button primary" onClick={() => go('api-keys')}>Manage API keys</button>
          </article>

          <article className="dv-card">
            <span className="dv-card-ic docs"><BookOpen size={18} /></span>
            <h4>Browse the API reference</h4>
            <p className="dv-muted">Endpoints, parameters and responses. Start with how to get the status of a payment.</p>
            <a className="xds-button" href="/apidocs/get-payment"><BookOpen size={14} />Open API reference</a>
          </article>

          <article className="dv-card">
            <span className="dv-card-ic try"><Play size={18} /></span>
            <h4>Try the payment flow</h4>
            <p className="dv-muted">Create an invoice, simulate the payment and watch the webhook arrive. Break your receiver on purpose to see retries and timeouts.</p>
            <button className="xds-button" onClick={() => go('try')}><Play size={14} />Start guided flow</button>
          </article>

          <article className="dv-card">
            <span className="dv-card-ic hooks"><Webhook size={18} /></span>
            <h4>Configure Webhooks</h4>
            <p className="dv-muted">Subscribe to Xendit events and receive notifications.</p>
            <a className="dv-link" href="#webhook-guide"><Link2 size={14} />Webhook guide</a>
            <button className="xds-button" onClick={() => go('webhooks')}>Add Webhook</button>
          </article>

          <article className="dv-card span2">
            <span className="dv-card-ic calls"><Terminal size={18} /></span>
            <h4>Make API calls</h4>
            <p className="dv-muted">Use your account API credentials to make API calls.</p>
            <CodeBlock title="cURL · Get balance" code={curl(endpoints[0])} />
            <a className="dv-link" href="/apidocs/get-payment"><Link2 size={14} />API reference</a>
            <button className="xds-button" onClick={openPostman}><Terminal size={14} />Try on Postman</button>
          </article>
        </div>
      </section>
    </div>
  );
}

function WebhooksTab() {
  return (
    <div className="dv-screen">
      <div className="dv-intro">
        <p>Webhooks send notifications and callbacks for asynchronous updates about events on the Xendit platform. <a className="dv-link inline" href="#webhook-guide">View webhook guide <ExternalLink size={13} /></a></p>
      </div>
      <EndpointsPanel />
      <Webhooks />
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
    <div className="dv-screen">
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
      <table className="xds-table ev">
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
              <td><span className={`xds-tag ${e.status === 'Succeeded' ? 'ok' : 'bad'}`}>{e.status}</span></td>
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
  const [changelog, setChangelog] = useState(false);
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
        <div className="dv-head-actions"><button className="xds-button sm" onClick={() => setChangelog(true)}><History size={14} />Changelog</button></div>
      </PageHeader>

      {tab === 'guides' && <Guides go={go} openPostman={() => setPostman(true)} />}
      {tab === 'try' && <TryTab />}
      {tab === 'api-keys' && <ApiKeysTab />}
      {tab === 'webhooks' && <WebhooksTab />}
      {tab === 'events' && <EventsTab />}
      {changelog && <Changelog onClose={() => setChangelog(false)} />}
      {postman && <PostmanModal onClose={() => setPostman(false)} />}
      <div style={{ height: 48 }} />
    </>
  );
}
