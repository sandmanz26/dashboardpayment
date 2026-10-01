import { useEffect, useState } from 'react';
import { Eye, EyeOff, Plus, TriangleAlert } from 'lucide-react';
import { IpAllowlist } from '../pages/Developers';
import { BASE_URL } from './postman';
import { CopyButton, Modal } from './ui';
import { FEATURES, NAME_LIMIT } from './apikeyFeatures';

interface SecretKey { id: string; name: string; last4: string; access: 'Full access' | 'Read only'; created: string }
const STORE = 'dev.secretKeys';
const PUBLIC_KEY = 'xnd_public_development_Qm3vXk9tLzR2pYd7HcW4aJfN8sUeB6oTgV1iKxZy5CnMqAr0';

const load = (): SecretKey[] => {
  try { const v = JSON.parse(localStorage.getItem(STORE) ?? '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
};
const genKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const buf = crypto.getRandomValues(new Uint8Array(48));
  return 'xnd_development_' + Array.from(buf, (b) => chars[b % chars.length]).join('');
};
const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ApiKeysTab() {
  const [keys, setKeys] = useState<SecretKey[]>(load);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [perms, setPerms] = useState<Record<string, 'none' | 'read' | 'write'>>({});
  // The access column in the key list is derived from the matrix: any write → full access.
  const access: SecretKey['access'] = Object.values(perms).some((p) => p === 'write') ? 'Full access' : 'Read only';
  const [fresh, setFresh] = useState<string | null>(null); // full key, shown once
  const [showPub, setShowPub] = useState(false);

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(keys)); } catch { /* ignore */ } }, [keys]);

  const create = () => {
    const key = genKey();
    setKeys((k) => [...k, { id: crypto.randomUUID(), name: name.trim() || 'Untitled key', last4: key.slice(-4), access, created: today() }]);
    setFresh(key); setCreating(false); setName(''); setPerms({});
  };

  const maskedPub = `${PUBLIC_KEY.slice(0, 26)}${'•'.repeat(18)}${PUBLIC_KEY.slice(-4)}`;

  return (
    <div className="dv-screen">
      <div className="dv-intro">
        <p>
          Secret keys authenticate server-side requests; the public key is safe to use in the browser. All keys below are <b>test mode</b> and only touch test data.
        </p>
        <button className="xds-button primary" onClick={() => setCreating(true)}><Plus size={14} />Generate secret key</button>
      </div>

      <div className="dv-strip">
        <span>Base URL</span><code>{BASE_URL}</code><CopyButton text={BASE_URL} label="Copy" />
        <span className="sep" />
        <span>Auth</span><code>HTTP Basic · key as username</code>
      </div>

      <section className="dv-panel">
        <header><h3>Secret keys</h3><span className="dv-muted">{keys.length} active</span></header>
        {keys.length === 0 ? (
          <div className="dv-empty">
            <p><b>No secret keys yet</b></p>
            <p className="dv-muted">Generate a key to start calling the API. It is shown once — store it in a secrets manager.</p>
          </div>
        ) : (
          <table className="xds-table">
            <thead><tr><th>Name</th><th>Key</th><th>Access</th><th>Created</th><th /></tr></thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>{k.name}</td>
                  <td className="mono">xnd_development_••••••••{k.last4}</td>
                  <td>{k.access}</td>
                  <td>{k.created}</td>
                  <td className="right"><button className="dv-danger" onClick={() => setKeys((l) => l.filter((x) => x.id !== k.id))}>Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dv-panel">
        <header><h3>Public key</h3><span className="dv-muted">Created 30 Sep 2026, 11:17 AM</span></header>
        <div className="dv-keyrow">
          <code className="mono">{showPub ? PUBLIC_KEY : maskedPub}</code>
          <button className="dv-icon" aria-label={showPub ? 'Hide key' : 'Reveal key'} onClick={() => setShowPub((s) => !s)}>{showPub ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          <CopyButton text={PUBLIC_KEY} label="Copy" />
        </div>
      </section>

      <div className="dev-page flush dv-legacy"><IpAllowlist /></div>

      {creating && (
        <Modal title="Generate API key" onClose={() => setCreating(false)} width={720}>
          <form className="ak-form" onSubmit={(e) => { e.preventDefault(); if (name.trim()) create(); }}>
            <div className="ak-body">
              <label className="ak-label" htmlFor="ak-name">API key name <span aria-hidden="true">*</span></label>
              <input id="ak-name" className="ak-input" autoFocus required maxLength={NAME_LIMIT}
                placeholder="Public Key" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="ak-count">{name.length}/{NAME_LIMIT}</div>

              <div className="ak-matrix" role="table" aria-label="Permissions">
                <div className="ak-mhead" role="row">
                  <span role="columnheader">Feature</span>
                  <span role="columnheader">None</span>
                  <span role="columnheader">Read</span>
                  <span role="columnheader">Write</span>
                </div>
                {FEATURES.map((f) => (
                  <div className="ak-mrow" role="row" key={f.name}>
                    <div className="ak-feature">
                      <b>{f.name}</b>
                      {f.desc && <span>{f.desc}</span>}
                    </div>
                    {(['none', 'read', 'write'] as const).map((lvl) => (
                      <div className="ak-cell" role="cell" key={lvl}>
                        {f.levels.includes(lvl) && (
                          <input type="radio" name={`perm-${f.name}`} aria-label={`${f.name} — ${lvl}`}
                            checked={(perms[f.name] ?? 'none') === lvl}
                            onChange={() => setPerms((p) => ({ ...p, [f.name]: lvl }))} />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="ak-foot">
              <button type="button" className="xds-button" onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className="xds-button primary" disabled={!name.trim()}>Generate key</button>
            </div>
          </form>
        </Modal>
      )}
      {fresh && (
        <Modal title="Your new secret key" onClose={() => setFresh(null)} width={560}>
          <div className="dv-form">
            <div className="dv-warn"><TriangleAlert size={16} />Copy this key now. For your security it will not be shown again.</div>
            <div className="dv-keyrow"><code className="mono">{fresh}</code><CopyButton text={fresh} label="Copy" /></div>
            <div className="dv-form-foot"><button className="xds-button primary" onClick={() => setFresh(null)}>I&apos;ve stored it</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
