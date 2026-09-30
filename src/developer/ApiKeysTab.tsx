import { useEffect, useState } from 'react';
import { Eye, EyeOff, Plus, TriangleAlert } from 'lucide-react';
import { IpAllowlist } from '../pages/Developers';
import { BASE_URL } from './postman';
import { CopyButton, Modal } from './ui';

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
  const [access, setAccess] = useState<SecretKey['access']>('Full access');
  const [fresh, setFresh] = useState<string | null>(null); // full key, shown once
  const [showPub, setShowPub] = useState(false);

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(keys)); } catch { /* ignore */ } }, [keys]);

  const create = () => {
    const key = genKey();
    setKeys((k) => [...k, { id: crypto.randomUUID(), name: name.trim() || 'Untitled key', last4: key.slice(-4), access, created: today() }]);
    setFresh(key); setCreating(false); setName(''); setAccess('Full access');
  };

  const maskedPub = `${PUBLIC_KEY.slice(0, 26)}${'•'.repeat(18)}${PUBLIC_KEY.slice(-4)}`;

  return (
    <div className="dv-tab">
      <div className="dv-intro">
        <p>
          Secret keys authenticate server-side requests; the public key is safe to use in the browser. All keys below are <b>test mode</b> and only touch test data.
        </p>
        <button className="dv-btn primary" onClick={() => setCreating(true)}><Plus size={14} />Generate secret key</button>
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
          <table className="dv-table">
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
        <Modal title="Generate secret key" subtitle="Give the key a name so you can recognise it later." onClose={() => setCreating(false)} width={480}>
          <form className="dv-form" onSubmit={(e) => { e.preventDefault(); create(); }}>
            <label>Key name<input autoFocus placeholder="e.g. Backend – staging" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Access
              <select value={access} onChange={(e) => setAccess(e.target.value as SecretKey['access'])}>
                <option>Full access</option><option>Read only</option>
              </select>
            </label>
            <div className="dv-form-foot">
              <button type="button" className="dv-btn" onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className="dv-btn primary">Generate</button>
            </div>
          </form>
        </Modal>
      )}
      {fresh && (
        <Modal title="Your new secret key" onClose={() => setFresh(null)} width={560}>
          <div className="dv-form">
            <div className="dv-warn"><TriangleAlert size={16} />Copy this key now. For your security it will not be shown again.</div>
            <div className="dv-keyrow"><code className="mono">{fresh}</code><CopyButton text={fresh} label="Copy" /></div>
            <div className="dv-form-foot"><button className="dv-btn primary" onClick={() => setFresh(null)}>I&apos;ve stored it</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
