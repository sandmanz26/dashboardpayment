import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { counts, meta, palette, radii, semanticColors, spacing, typography } from '../design/tokens';
import type { ColorToken } from '../design/tokens';
import './design-tokens.css';

const TABS = [
  { key: 'palette', label: 'Palette' },
  { key: 'color', label: 'Colour roles' },
  { key: 'space', label: 'Spacing & radius' },
  { key: 'type', label: 'Typography' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

/** Rough relative luminance, used only to pick a readable label colour on a swatch. */
function isDark(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.55;
}

function CopyValue({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className="dt-copy" title={`Copy ${text}`} aria-label={`Copy ${text}`}
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1200); } catch { /* clipboard blocked */ } }}>
      {done ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function Swatch({ t }: { t: ColorToken }) {
  return (
    <div className="dt-sw">
      <div className="dt-sw-box" style={{ background: t.value }}>
        <span className={isDark(t.value) ? 'on-dark' : ''}>{t.value}</span>
      </div>
      <div className="dt-sw-meta">
        <b>{t.name}</b>
        <CopyValue text={t.value} />
      </div>
    </div>
  );
}

function RoleRow({ t }: { t: ColorToken }) {
  return (
    <tr>
      <td><span className="dt-chip" style={{ background: t.value }} /><code>{t.name}</code></td>
      <td className="dt-ref">{t.ref ? <code>{t.ref.replace(/^Global\.xds\./, '')}</code> : <span className="dt-lit">literal</span>}</td>
      <td><code>{t.value}</code><CopyValue text={t.value} /></td>
      <td className="dt-desc">{t.description ?? '—'}</td>
    </tr>
  );
}

export default function DesignTokens() {
  const [tab, setTab] = useState<TabKey>('palette');
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();

  const filteredPalette = useMemo(
    () => palette
      .map((r) => ({ ...r, steps: r.steps.filter((s) => !needle || `${r.name} ${s.name} ${s.value}`.toLowerCase().includes(needle)) }))
      .filter((r) => r.steps.length),
    [needle],
  );
  const filteredRoles = useMemo(
    () => semanticColors
      .map((g) => ({ ...g, tokens: g.tokens.filter((t) => !needle || `${g.name} ${t.name} ${t.value} ${t.ref ?? ''}`.toLowerCase().includes(needle)) }))
      .filter((g) => g.tokens.length),
    [needle],
  );

  return (
    <>
      <PageHeader title="Design tokens" />
      <p className="dt-crumb"><Link to="/settings"><ArrowLeft size={14} />Settings</Link></p>

      <section className="dt-head">
        <p className="dt-lede">
          The Xendit design system as exported from Figma. This page only displays the tokens —
          nothing on this page styles the dashboard yet.
        </p>
        <dl className="dt-counts">
          <div><dt>Palette</dt><dd>{counts.palette}</dd></div>
          <div><dt>Colour roles</dt><dd>{counts.semantic}</dd></div>
          <div><dt>Spacing</dt><dd>{counts.spacing}</dd></div>
          <div><dt>Radius</dt><dd>{counts.radii}</dd></div>
          <div><dt>Type styles</dt><dd>{counts.typography}</dd></div>
        </dl>
        {meta && <p className="dt-meta">DTCG {meta.colorMode} · collections: {meta.variableCollections?.join(', ')} · exported {meta.createdAt?.slice(0, 10)}</p>}
      </section>

      <div className="dt-bar">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        {(tab === 'palette' || tab === 'color') && (
          <input className="dt-search" placeholder="Filter by name or hex" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter tokens" />
        )}
      </div>

      {tab === 'palette' && (
        <div className="dt-body">
          {filteredPalette.map((r) => (
            <section key={r.name} className="dt-block">
              <h3>{r.name}</h3>
              <div className="dt-swatches">{r.steps.map((s) => <Swatch key={s.path} t={s} />)}</div>
            </section>
          ))}
          {!filteredPalette.length && <p className="dt-empty">Nothing matches “{q}”.</p>}
        </div>
      )}

      {tab === 'color' && (
        <div className="dt-body">
          {filteredRoles.map((g) => (
            <section key={g.name} className="dt-block">
              <h3>{g.name.replace(/^xds-color-/, '')} <code className="dt-path">{g.name}</code></h3>
              <table className="dt-table">
                <thead><tr><th>Token</th><th>References</th><th>Resolves to</th><th>Description</th></tr></thead>
                <tbody>{g.tokens.map((t) => <RoleRow key={t.path} t={t} />)}</tbody>
              </table>
            </section>
          ))}
          {!filteredRoles.length && <p className="dt-empty">Nothing matches “{q}”.</p>}
        </div>
      )}

      {tab === 'space' && (
        <div className="dt-body">
          <section className="dt-block">
            <h3>Spacing</h3>
            <ul className="dt-scale">
              {spacing.map((d) => (
                <li key={d.path}><code className="dt-k">{d.name}</code><span className="dt-v">{d.value}</span><i className="dt-ruler" style={{ width: d.value }} /></li>
              ))}
            </ul>
          </section>
          <section className="dt-block">
            <h3>Border radius</h3>
            <div className="dt-radii">
              {radii.map((d) => (
                <div key={d.path} className="dt-radius">
                  <i style={{ borderRadius: d.value }} />
                  <b>{d.name}</b><span>{d.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === 'type' && (
        <div className="dt-body">
          {typography.map((g) => (
            <section key={g.name} className="dt-block">
              <h3>{g.name}</h3>
              {g.styles.map((s) => (
                <div key={s.path} className="dt-type">
                  <div className="dt-type-spec">
                    <b>{s.name}</b>
                    <span>{s.fontFamily} · {s.fontWeight} · {s.fontSize}/{s.lineHeight} · tracking {s.letterSpacing}</span>
                    {s.description && <em>{s.description}</em>}
                  </div>
                  <p className="dt-type-sample" style={{ fontFamily: `'${s.fontFamily} Variable', '${s.fontFamily}', system-ui, sans-serif`, fontWeight: s.fontWeight, fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }}>
                    Receive payments the easy way
                  </p>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      <div style={{ height: 48 }} />
    </>
  );
}
