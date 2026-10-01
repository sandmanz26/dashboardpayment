import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Copy, Plus, Eye, Check } from 'lucide-react';
import { webhookGroups } from '../data/webhooks';
import './webhooks.css';

const PUBLIC_KEY = 'xnd_public_development_Qm3vXk9tLzR2pYd7HcW4aJfN8sUeB6oTgV1iKxZy5CnMqAr0';

function TestBanner() {
  return <div className="test-banner">Test mode</div>;
}

export function ApiKeys() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard?.writeText(PUBLIC_KEY); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="dev-card test">
      <TestBanner />
      <div className="dev-body">
        <h2>API Keys</h2>
        <h3>Secret keys</h3>
        <p className="dev-desc">Secret keys are used to authenticate API requests coming from your servers.</p>
        <table className="dev-table">
          <thead><tr><th>Key name</th><th>Permissions</th><th>Created (GMT +7)</th><th>Last Used (GMT +7)</th></tr></thead>
        </table>
        <div className="dev-empty tight">
          <p>You don&apos;t have any secret keys yet</p>
          <button className="btn primary xs">Generate secret key</button>
        </div>

        <h3 className="mt">Public key</h3>
        <p className="dev-desc">Public keys are used to tokenize card information on the client side.</p>
        <table className="dev-table">
          <thead><tr><th style={{ width: '22%' }}>Key name</th><th style={{ width: '50%' }}>Key</th><th>Created (GMT +7)</th></tr></thead>
          <tbody>
            <tr>
              <td>Public Key</td>
              <td>
                <div className="key-box">
                  <span className="key-text">{PUBLIC_KEY}</span>
                  <button className="btn primary xs" onClick={copy}>{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied' : 'Copy'}</button>
                </div>
              </td>
              <td>30 Sep 2026, 11:17:23 AM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function IpAllowlist() {
  const [ips, setIps] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const add = () => {
    if (value.trim()) setIps((l) => [...l, value.trim()]);
    setValue(''); setAdding(false);
  };
  return (
    <section className="dev-card">
      <div className="dev-body">
        <h2>IP Allowlist</h2>
        <div className="ip-head">
          <p className="dev-desc">
            Secure API access against foreign or malicious IPs by allowing only specific IP addresses to access APIs as IP Allowlist.
            The IP Allowlist will only work for API access through direct integration and will not work for Plugin users
            (Shopify, Woocommerce, etc). Learn more about IP Allowlist <a href="#ip">here</a>
          </p>
          <button className="btn primary xs" onClick={() => setAdding(true)}><Plus size={12} />Add IP Address / CIDR</button>
        </div>
        {adding && (
          <div className="ip-form">
            <input autoFocus placeholder="e.g. 203.0.113.10 or 203.0.113.0/24" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
            <button className="btn primary xs" onClick={add}>Add</button>
            <button className="btn outline xs" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        )}
        {ips.length === 0 ? (
          <div className="dev-empty box">
            <strong>No IP Address added</strong>
            <p>Click &apos;Add IP Address&apos; to start adding your server IP(s) to allowlist.</p>
          </div>
        ) : (
          <ul className="ip-list">{ips.map((ip) => <li key={ip}>{ip}<button onClick={() => setIps((l) => l.filter((x) => x !== ip))}>Remove</button></li>)}</ul>
        )}
      </div>
    </section>
  );
}

export function Webhooks({ filter = '' }: { filter?: string } = {}) {
  const [retry, setRetry] = useState(true);
  const [results, setResults] = useState<Record<string, { state: 'testing' | 'ok' | 'error'; msg: string }>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({
    'Also notify my application when a payment has been received after expiry': true,
  });

  const save = (k: string) => {
    const url = (urls[k] ?? '').trim();
    if (!/^https?:\/\/[^\s/]+\.[^\s/]+/.test(url)) {
      setResults((r) => ({ ...r, [k]: { state: 'error', msg: 'Enter a valid URL starting with https://' } }));
      return;
    }
    setResults((r) => ({ ...r, [k]: { state: 'testing', msg: 'Sending test event…' } }));
    setTimeout(() => setResults((r) => ({ ...r, [k]: { state: 'ok', msg: `200 OK · ${90 + Math.round(Math.random() * 120)} ms` } })), 700);
  };

  const q = filter.trim().toLowerCase();
  const groups = q
    ? webhookGroups
        .map((g) => (g.title.toLowerCase().includes(q) ? g : { ...g, items: g.items.filter((i) => i.toLowerCase().includes(q)), checks: [] }))
        .filter((g) => g.items.length > 0)
    : webhookGroups;

  const configured = (g: (typeof webhookGroups)[number]) =>
    g.items.filter((i) => (urls[`${g.title}/${i}`] ?? '').trim()).length;

  return (
    <section className="wh">
      <header className="wh-head">
        <div>
          <h2>Per-event URLs <span className="wh-legacy">legacy</span></h2>
          <p>One URL per event, kept for products that predate endpoint subscriptions. <a href="#docs">Documentation</a></p>
        </div>
        <button className="btn outline xs"><Eye size={12} />Verification token</button>
      </header>

      <label className="wh-retry">
        <button role="switch" aria-checked={retry} className={`switch ${retry ? 'on' : ''}`} onClick={() => setRetry((r) => !r)}><i /></button>
        <span><b>Auto-retry failed deliveries</b> — exponential backoff, up to 24 hours</span>
      </label>

      <div className="wh-groups">
        {groups.map((g) => {
          const isOpen = open[g.title] ?? !!q;
          const n = configured(g);
          return (
            <div key={g.title} className={`wh-group ${isOpen ? 'open' : ''}`}>
              <button className="wh-group-head" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [g.title]: !isOpen }))}>
                <ChevronDown size={14} className="wh-caret" />
                <span className="wh-group-name">{g.title}</span>
                <span className="wh-count">{n ? `${n} of ${g.items.length} set` : `${g.items.length} event${g.items.length > 1 ? 's' : ''}`}</span>
              </button>

              {isOpen && (
                <div className="wh-rows">
                  {g.items.map((name) => {
                    const key = `${g.title}/${name}`;
                    const disabled = g.title === 'Notifications' && (name === 'Account Created' || name === 'Account Updated');
                    const res = results[key];
                    return (
                      <div className="wh-row" key={key}>
                        <span className="wh-name">{name}{disabled && <span className="wh-off">unavailable</span>}</span>
                        <input className="wh-input" placeholder="https://example.com/webhooks" disabled={disabled}
                          value={urls[key] ?? ''} onChange={(e) => setUrls({ ...urls, [key]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && save(key)} aria-invalid={res?.state === 'error'} />
                        <button className="btn outline xs" disabled={disabled} onClick={() => save(key)}>
                          {res?.state === 'testing' ? 'Testing…' : res?.state === 'ok' ? 'Saved' : 'Test & save'}
                        </button>
                        {res && <div className={`wh-result ${res.state}`} role="status">{res.msg}</div>}
                      </div>
                    );
                  })}
                  {g.checks?.map((c) => (
                    <label className="wh-check" key={c.label}>
                      <input type="checkbox" checked={checks[c.label] ?? c.checked} onChange={(e) => setChecks({ ...checks, [c.label]: e.target.checked })} />
                      {c.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!groups.length && <p className="wh-empty">No product matches that search.</p>}
      </div>
    </section>
  );
}

export default function Developers() {
  return (
    <div className="dev-page">
      <Link to="/settings" className="back-link"><ArrowLeft size={12} />Back to Settings</Link>
      <h1 className="dev-title">Developers</h1>
      <ApiKeys />
      <IpAllowlist />
      <Webhooks />
      <div style={{ height: 40 }} />
    </div>
  );
}
