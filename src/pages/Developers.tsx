import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Copy, Info, Plus, Eye, Check } from 'lucide-react';
import { webhookGroups } from '../data/webhooks';

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

  return (
    <section className="dev-card test">
      <TestBanner />
      <div className="dev-body">
        <h2>Webhooks</h2>
        <p className="dev-desc">
          Add your webhook URLs here. To learn how to add and manage your webhooks, read our <a href="#docs">documentation page</a>.
        </p>

        <label className="toggle-row">
          <button role="switch" aria-checked={retry} className={`switch ${retry ? 'on' : ''}`} onClick={() => setRetry((r) => !r)}><i /></button>
          <span>
            <b>Enable auto-retry for failed webhook</b>
            <small>Automatic notify for failed webhook with exponential delay. <a href="#retry">Learn more here</a></small>
          </span>
        </label>

        <h3 className="mt">Webhook verification token</h3>
        <p className="dev-desc">Sent with every webhook. Use the token to validate that a webhook came from our servers.</p>
        <div className="token-row">
          <span>Webhook Verification token</span>
          <button className="btn outline-blue xs wide"><Eye size={12} />View Webhook Verification Token</button>
        </div>

        <div className="legacy-note">
          <b>You&apos;re viewing the legacy version of our webhook page</b>
          <span>To manage webhook URLs of our newest features and products, switch to the latest version <a href="#latest">here</a>.</span>
        </div>

        <h3 className="mt">Webhook URL</h3>
        <p className="dev-desc">Test your webhook URLs and check the status of the webhook resources.</p>

        <table className="dev-table wh">
          <colgroup><col style={{ width: '32%' }} /><col style={{ width: '32%' }} /><col style={{ width: '10%' }} /><col /></colgroup>
          <thead><tr><th>Product</th><th colSpan={3}>Webhook URL</th></tr></thead>
          <tbody>
            {groups.map((g) => (
              <GroupRows key={g.title} g={g} urls={urls} setUrls={setUrls} results={results} save={save} checks={checks} setChecks={setChecks} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GroupRows({ g, urls, setUrls, results, save, checks, setChecks }: {
  g: (typeof webhookGroups)[number];
  urls: Record<string, string>; setUrls: (u: Record<string, string>) => void;
  results: Record<string, { state: 'testing' | 'ok' | 'error'; msg: string }>; save: (k: string) => void;
  checks: Record<string, boolean>; setChecks: (c: Record<string, boolean>) => void;
}) {
  return (
    <>
      <tr className="grp"><td colSpan={4}>{g.title}</td></tr>
      {g.items.map((name) => {
        const key = `${g.title}/${name}`;
        const disabled = g.title === 'Notifications' && (name === 'Account Created' || name === 'Account Updated');
        return (
          <tr key={key}>
            <td><span className="wh-name">{name}<Info size={11} strokeWidth={1.5} /></span></td>
            <td>
              <input className="wh-input" placeholder="http://example.com" disabled={disabled}
                value={urls[key] ?? ''} onChange={(e) => setUrls({ ...urls, [key]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && save(key)} aria-invalid={results[key]?.state === 'error'} />
              {results[key] && <div className={`wh-result ${results[key].state}`} role="status">{results[key].msg}</div>}
            </td>
            <td>
              <button className="btn primary xs wide" disabled={disabled} onClick={() => save(key)}>
                {results[key]?.state === 'testing' ? 'Testing…' : results[key]?.state === 'ok' ? 'Saved' : 'Test and save'}
              </button>
            </td>
            <td className="right"><ChevronDown size={14} strokeWidth={1.5} className="wh-chev" /></td>
          </tr>
        );
      })}
      {g.checks?.map((c) => (
        <tr key={c.label} className="chk">
          <td colSpan={4}>
            <label>
              <input type="checkbox" checked={checks[c.label] ?? c.checked} onChange={(e) => setChecks({ ...checks, [c.label]: e.target.checked })} />
              {c.label}
            </label>
          </td>
        </tr>
      ))}
    </>
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
