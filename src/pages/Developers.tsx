import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronDown, Copy, Plus, Eye, Check, Search as SearchIcon, X } from 'lucide-react';
import { categories, webhookProducts } from '../data/webhooks';
import type { ApiVersion, Category, WebhookProduct } from '../data/webhooks';
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

interface Delivery { at: string; code: number; ms: number; id: string }

/** Dummy delivery history shown after a successful test, so the success state has something real to read. */
function fakeDeliveries(seed: string): Delivery[] {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rnd = (n: number) => { h = (h * 1664525 + 1013904223) >>> 0; return h % n; };
  return [
    { at: 'just now', code: 200, ms: 90 + rnd(120), id: `whd_${h.toString(16).slice(0, 10)}` },
    { at: '2 h ago', code: 200, ms: 90 + rnd(120), id: `whd_${(h + 7).toString(16).slice(0, 10)}` },
    { at: 'yesterday', code: rnd(4) === 0 ? 500 : 200, ms: 90 + rnd(400), id: `whd_${(h + 13).toString(16).slice(0, 10)}` },
  ];
}

function VersionTag({ v, onOpen }: { v: ApiVersion; onOpen: () => void }) {
  return (
    <span className={`wh-ver ${v.status}`}>
      {v.version}
      <span className="wh-ver-state">{v.status === 'current' ? 'current' : v.status === 'supported' ? 'supported' : 'deprecated'}</span>
      <button className="wh-ver-peek" onClick={(e) => { e.stopPropagation(); onOpen(); }}
        aria-label={`What changed in ${v.version}`} title={`What changed in ${v.version}`}>
        <SearchIcon size={11} />
      </button>
    </span>
  );
}

function ChangesPopover({ product, onClose }: { product: WebhookProduct; onClose: () => void }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <div className="wh-scrim" onClick={onClose} />
      <aside className="wh-changes" role="dialog" aria-label={`${product.title} version history`}>
        <header>
          <div>
            <h3>{product.title}</h3>
            <p>Version history. Pick the version your integration targets.</p>
          </div>
          <button className="wh-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </header>
        <ol>
          {product.versions?.map((v) => (
            <li key={v.version} className={v.status}>
              <div className="wh-chg-head">
                <code>{v.version}</code>
                <span className={`wh-ver ${v.status} flat`}>{v.status}</span>
                <time>{v.released}</time>
              </div>
              <code className="wh-path">{v.path}</code>
              {v.sunset && (
                <p className="wh-sunset">
                  <AlertTriangle size={12} />Stops working on <b>{v.sunset}</b>. Move to {product.versions?.[0].version} before then.
                </p>
              )}
              <ul>{v.changes.map((c) => <li key={c}>{c}</li>)}</ul>
            </li>
          ))}
        </ol>
        <p className="wh-chg-foot">Dummy history for this demo — check docs.xendit.co for the real one.</p>
      </aside>
    </>
  );
}

export function Webhooks({ filter = '' }: { filter?: string } = {}) {
  const [retry, setRetry] = useState(true);
  const [results, setResults] = useState<Record<string, { state: 'testing' | 'ok' | 'error'; msg: string; deliveries?: Delivery[] }>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [own, setOwn] = useState('');
  const [changesFor, setChangesFor] = useState<WebhookProduct | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    'Also notify my application when a payment has been received after expiry': true,
  });
  const searchRef = useRef<HTMLInputElement>(null);

  const save = (k: string) => {
    const url = (urls[k] ?? '').trim();
    if (!/^https?:\/\/[^\s/]+\.[^\s/]+/.test(url)) {
      setResults((r) => ({ ...r, [k]: { state: 'error', msg: 'Enter a valid URL starting with https://' } }));
      return;
    }
    setResults((r) => ({ ...r, [k]: { state: 'testing', msg: 'Sending test event…' } }));
    setTimeout(() => {
      const d = fakeDeliveries(k + url);
      setResults((r) => ({ ...r, [k]: { state: 'ok', msg: `${d[0].code} OK · ${d[0].ms} ms`, deliveries: d } }));
    }, 700);
  };

  // The tab above owns a search box too; this one takes over when the page is used on its own.
  const q = (filter || own).trim().toLowerCase();
  const matches = (p: WebhookProduct) => {
    if (cat !== 'All' && p.category !== cat) return false;
    if (!q) return true;
    if (p.title.toLowerCase().includes(q)) return true;
    if (p.versions?.some((v) => v.path.toLowerCase().includes(q) || v.version.includes(q))) return true;
    return p.items.some((i) => i.toLowerCase().includes(q));
  };
  const visibleItems = (p: WebhookProduct) =>
    q && !p.title.toLowerCase().includes(q) && !p.versions?.some((v) => v.path.toLowerCase().includes(q) || v.version.includes(q))
      ? p.items.filter((i) => i.toLowerCase().includes(q))
      : p.items;

  const shown = webhookProducts.filter(matches);
  const eventCount = shown.reduce((n, p) => n + visibleItems(p).length, 0);
  const configured = (p: WebhookProduct) => p.items.filter((i) => (urls[`${p.title}/${i}`] ?? '').trim()).length;
  const byCategory = categories
    .map((c) => ({ category: c, products: shown.filter((p) => p.category === c) }))
    .filter((g) => g.products.length);

  return (
    <section className="wh">
      <header className="wh-head">
        <div>
          <h2>Per-event URLs <span className="wh-legacy">legacy</span></h2>
          <p>One URL per event, kept for products that predate endpoint subscriptions. <a href="#docs">Documentation</a></p>
        </div>
        <button className="btn outline xs"><Eye size={12} />Verification token</button>
      </header>

      <div className="wh-toolbar">
        <label className="wh-search">
          <SearchIcon size={14} />
          <input ref={searchRef} value={own} onChange={(e) => setOwn(e.target.value)}
            placeholder="Filter by product, event or path — try “payout”, “/v3”, “refund”"
            aria-label="Filter webhooks" disabled={!!filter} />
          {own && <button onClick={() => setOwn('')} aria-label="Clear"><X size={12} /></button>}
        </label>
        <div className="wh-cats" role="group" aria-label="Category">
          {(['All', ...categories] as const).map((c) => (
            <button key={c} aria-pressed={cat === c} onClick={() => setCat(c as Category | 'All')}>{c}</button>
          ))}
        </div>
        <span className="wh-tally">{shown.length} products · {eventCount} events</span>
      </div>

      <label className="wh-retry">
        <button role="switch" aria-checked={retry} className={`switch ${retry ? 'on' : ''}`} onClick={() => setRetry((r) => !r)}><i /></button>
        <span><b>Auto-retry failed deliveries</b> — exponential backoff, up to 24 hours</span>
      </label>

      {byCategory.map(({ category, products }) => (
        <div className="wh-cat" key={category}>
          <h3 className="wh-cat-title">{category}<span>{products.length}</span></h3>
          <div className="wh-groups">
            {products.map((p) => {
              const isOpen = open[p.title] ?? !!q;
              const n = configured(p);
              const items = visibleItems(p);
              return (
                <div key={p.title} className={`wh-group ${isOpen ? 'open' : ''}`}>
                  <button className="wh-group-head" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [p.title]: !isOpen }))}>
                    <ChevronDown size={14} className="wh-caret" />
                    <span className="wh-group-name">{p.title}</span>
                    {p.versions?.map((v) => <VersionTag key={v.version} v={v} onOpen={() => setChangesFor(p)} />)}
                    <span className="wh-count">{n ? `${n} of ${p.items.length} set` : `${items.length} event${items.length > 1 ? 's' : ''}`}</span>
                  </button>

                  {isOpen && (
                    <div className="wh-rows">
                      {items.map((name) => {
                        const key = `${p.title}/${name}`;
                        const disabled = p.disabled?.includes(name) ?? false;
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

                            {res?.state === 'error' && <div className="wh-result error" role="status">{res.msg}</div>}
                            {res?.state === 'testing' && <div className="wh-result" role="status">{res.msg}</div>}
                            {res?.state === 'ok' && res.deliveries && (
                              <div className="wh-ok" role="status">
                                <div className="wh-ok-head">
                                  <Check size={12} />Saved and verified — <b>{res.msg}</b>
                                </div>
                                <table className="wh-log">
                                  <thead><tr><th>When</th><th>Status</th><th>Latency</th><th>Delivery ID</th></tr></thead>
                                  <tbody>
                                    {res.deliveries.map((d) => (
                                      <tr key={d.id}>
                                        <td>{d.at}</td>
                                        <td className={d.code < 300 ? 'ok' : 'bad'}>{d.code}</td>
                                        <td>{d.ms} ms</td>
                                        <td><code>{d.id}</code></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {p.checks?.map((c) => (
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
          </div>
        </div>
      ))}

      {!shown.length && <p className="wh-empty">Nothing matches that filter.</p>}
      {changesFor && <ChangesPopover product={changesFor} onClose={() => setChangesFor(null)} />}
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
