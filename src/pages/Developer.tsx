import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ellipsis, ExternalLink, Link2, ListFilter, Plus, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { ApiKeys, IpAllowlist, Webhooks } from './Developers';
import { events } from '../data/events';

const TABS = [
  { key: 'guides', label: 'Guides' },
  { key: 'api-keys', label: 'API keys' },
  { key: 'webhooks', label: 'Webhooks' },
  { key: 'events', label: 'Events' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

function Guides({ go }: { go: (t: TabKey) => void }) {
  return (
    <div className="guides">
      <h2>Start developing with Xendit</h2>
      <p className="muted">Guides and resources to get you started on developing with Xendit.</p>

      <section className="guide-card">
        <header>Things you can do</header>
        <div className="guide-row">
          <div>
            <h3>Manage API keys</h3>
            <p className="muted">Generate and manage your API keys.</p>
          </div>
          <button className="btn primary" onClick={() => go('api-keys')}>Manage API keys</button>
        </div>
        <div className="guide-row">
          <div>
            <h3>Make API calls</h3>
            <p>Use your account API credentials to make API calls.</p>
            <a className="guide-link" href="#api-guide"><Link2 size={14} />API guide</a>
          </div>
          <button className="btn outline-blue">Try on Postman</button>
        </div>
        <div className="guide-row">
          <div>
            <h3>Configure Webhooks</h3>
            <p>Subscribe to Xendit events and receive notifications.</p>
            <a className="guide-link" href="#webhook-guide"><Link2 size={14} />Webhook guide</a>
          </div>
          <button className="btn outline-blue" onClick={() => go('webhooks')}>Add Webhook</button>
        </div>
      </section>
    </div>
  );
}

function EventsTab() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const rows = useMemo(
    () => events.filter((e) => !q || `${e.id} ${e.name}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  const all = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="dev-tab">
      <div className="filter-row">
        <button className="filter-btn"><ListFilter size={16} strokeWidth={1.6} />Filters</button>
        <label className="filter-search">
          <Search size={16} strokeWidth={1.6} />
          <input placeholder="Search by Source ID" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <table className="ev-table">
        <thead>
          <tr>
            <th className="chk"><input type="checkbox" checked={all} onChange={() => setSel(all ? new Set() : new Set(rows.map((r) => r.id)))} /></th>
            <th>Time (UTC+7)</th><th>Event name</th><th>Event from</th><th>Status</th><th>Event ID</th><th />
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="chk"><input type="checkbox" checked={sel.has(e.id)} onChange={() => toggle(e.id)} /></td>
              <td>{e.time} UTC+7</td>
              <td>{e.name}</td>
              <td>{e.from}</td>
              <td><span className={`ev-badge ${e.status === 'Succeeded' ? 'ok' : 'bad'}`}>{e.status}</span></td>
              <td className="ev-id">{e.id}</td>
              <td className="right"><button className="dots" aria-label="Actions"><Ellipsis size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty">No events found</div>}
    </div>
  );
}

export default function Developer() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: TabKey = TABS.some((t) => t.key === raw) ? (raw as TabKey) : 'guides';
  const go = (t: TabKey) => setParams(t === 'guides' ? {} : { tab: t }, { replace: false });

  return (
    <>
      <PageHeader title="Developer">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => go(t.key)}>{t.label}</button>
          ))}
        </div>
      </PageHeader>

      {tab === 'guides' && <Guides go={go} />}
      {tab === 'api-keys' && (
        <div className="dev-tab">
          <div className="tab-intro">
            <p>Secret and public keys authenticate your API requests, and the IP allowlist restricts which servers may call the API. <a href="#api-guide" className="guide-link inline">View API guide <ExternalLink size={13} /></a></p>
            <button className="btn outline-blue"><Plus size={14} />New secret key</button>
          </div>
          <div className="dev-page flush"><ApiKeys /><IpAllowlist /></div>
        </div>
      )}
      {tab === 'webhooks' && (
        <div className="dev-tab">
          <div className="dev-page flush"><Webhooks /></div>
        </div>
      )}
      {tab === 'events' && <EventsTab />}
      <div style={{ height: 40 }} />
    </>
  );
}
