import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Crosshair, Palette, RefreshCw, Search, Settings2, X } from 'lucide-react';
import { buildLookup, checkElement, elementsUsingColor, hasOwnText, ownText, scanPage } from './scan';
import type { Lookup, PropCheck, ScanResult } from './scan';
import { clearTokens, colorKey, loadTokens, parseTokens, saveTokens, tokensFromCss } from './tokens';
import type { Token } from './tokens';
import './dstool.css';

type Panel = 'coverage' | 'colour' | 'tokens';
const POS_KEY = 'ds.pos';
const SIZE = 56;

interface Pos { x: number; y: number }
const clamp = (p: Pos): Pos => ({
  x: Math.min(Math.max(8, p.x), window.innerWidth - SIZE - 8),
  y: Math.min(Math.max(8, p.y), window.innerHeight - SIZE - 8),
});
const loadPos = (): Pos => {
  try {
    const v = JSON.parse(localStorage.getItem(POS_KEY) ?? 'null');
    if (v && typeof v.x === 'number') return clamp(v);
  } catch { /* ignore */ }
  return clamp({ x: window.innerWidth - SIZE - 28, y: window.innerHeight - SIZE - 120 });
};

/* ---------- flagging ---------- */

const FLAG_OK = 'ds-flag-ok';
const FLAG_BAD = 'ds-flag-bad';
const unflag = () => document.querySelectorAll(`.${FLAG_OK}, .${FLAG_BAD}`).forEach((e) => e.classList.remove(FLAG_OK, FLAG_BAD));

/* ---------- inspector ---------- */

interface Hit { el: Element; checks: PropCheck[]; text: string; isText: boolean; rect: DOMRect }

function describe(el: Element): string {
  const cls = Array.from(el.classList).filter((c) => !c.startsWith('ds-flag')).slice(0, 3).map((c) => `.${c}`).join('');
  return el.tagName.toLowerCase() + cls;
}

function Inspector({ lookup, onStop }: { lookup: Lookup; onStop: () => void }) {
  const [hit, setHit] = useState<Hit | null>(null);
  const [frozen, setFrozen] = useState(false);
  const frozenRef = useRef(false);
  frozenRef.current = frozen;

  const inspect = useCallback((el: Element) => {
    setHit({ el, checks: checkElement(el, lookup), text: ownText(el), isText: hasOwnText(el), rect: el.getBoundingClientRect() });
  }, [lookup]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (frozenRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el.closest('[data-ds-ui]')) return;
      inspect(el);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-ds-ui]')) return;
      e.preventDefault(); e.stopPropagation();
      setFrozen((f) => !f);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onStop(); return; }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHit((h) => { const p = h?.el.parentElement; if (p && !p.closest('[data-ds-ui]')) inspect(p); return h; });
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHit((h) => {
          const kid = h && Array.from(h.el.children).find((c) => !c.closest('[data-ds-ui]'));
          if (kid) inspect(kid);
          return h;
        });
      }
    };
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [inspect, onStop]);

  if (!hit) {
    return <div className="ds-inspect-hint" data-ds-ui>Move over the page. Click to freeze · ↑ parent · ↓ child · Esc to stop</div>;
  }

  const r = hit.rect;
  const bad = hit.checks.filter((c) => c.status === 'off').length;
  const scored = hit.checks.filter((c) => c.status !== 'none').length;
  const top = r.bottom + 260 > window.innerHeight ? Math.max(8, r.top - 8 - 260) : r.bottom + 8;
  const groups: PropCheck['group'][] = ['color', 'typography', 'shape'];

  return (
    <>
      <div className="ds-outline" data-ds-ui style={{ top: r.top, left: r.left, width: r.width, height: r.height }} />
      <div className="ds-card" data-ds-ui style={{ top, left: Math.min(r.left, window.innerWidth - 360) }}>
        <div className={`ds-card-head ${bad ? 'bad' : 'ok'}`}>
          {bad ? `✕ ${bad} of ${scored} off the tokens` : scored ? '✓ Fully matches design tokens' : 'Nothing token-relevant here'}
        </div>

        <div className="ds-sel">
          <span className="ds-tag">{hit.el.tagName.toLowerCase()}</span>
          <code>{describe(hit.el).slice(hit.el.tagName.length)}</code>
          {frozen && <span className="ds-frozen">frozen</span>}
        </div>

        <div className="ds-kind">
          {hit.isText
            ? <><span className="ds-badge text">TEXT</span><span className="ds-snip">“{hit.text.slice(0, 48)}{hit.text.length > 48 ? '…' : ''}”</span></>
            : <><span className="ds-badge cont">CONTAINER</span><span className="ds-snip">no text of its own — press ↓ for the text inside</span></>}
        </div>

        {groups.map((g) => {
          const rows = hit.checks.filter((c) => c.group === g);
          if (!rows.length) return null;
          return (
            <div key={g} className="ds-group">
              <h5>{g}</h5>
              {rows.map((c) => (
                <div key={c.label} className="ds-row">
                  <span className="ds-row-l">{c.label}</span>
                  <span className="ds-row-v">
                    {c.group === 'color' && <i className="ds-sw" style={{ background: c.value }} />}
                    {c.value}
                  </span>
                  {c.status === 'token' && <span className="ds-pill ok">✓ {c.token}</span>}
                  {c.status === 'off' && <span className="ds-pill bad">{c.nearest ? `near ${c.nearest}` : 'no token'}</span>}
                  {c.status === 'none' && <span className="ds-pill mute">—</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------- try a colour ---------- */

function TryColour({ tokens }: { tokens: Token[] }) {
  const colors = useMemo(() => tokens.filter((t) => t.type === 'color'), [tokens]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Token | null>(null);
  const [temp, setTemp] = useState('#ff00ff');
  const applied = useRef<Set<string>>(new Set());

  const revert = useCallback(() => {
    applied.current.forEach((n) => document.documentElement.style.removeProperty(`--${n}`));
    applied.current.clear();
    unflag();
  }, []);
  useEffect(() => revert, [revert]);

  const apply = (t: Token, value: string) => {
    document.documentElement.style.setProperty(`--${t.name}`, value);
    applied.current.add(t.name);
  };

  const flagUses = (t: Token) => {
    unflag();
    elementsUsingColor(document.body, t.value).forEach((e) => e.classList.add(FLAG_OK));
  };

  const shown = colors.filter((t) => (t.name + t.value).toLowerCase().includes(q.toLowerCase()));
  const isVar = (t: Token) => getComputedStyle(document.documentElement).getPropertyValue(`--${t.name}`).trim() !== '';

  return (
    <div className="ds-panel-body">
      <p className="ds-note">Temporary — nothing is saved. Reload or press Revert to put everything back.</p>
      <input className="ds-input" placeholder="Filter tokens, e.g. primary" value={q} onChange={(e) => setQ(e.target.value)} />

      <ul className="ds-tokens">
        {shown.slice(0, 80).map((t) => (
          <li key={t.name} className={sel?.name === t.name ? 'on' : ''}>
            <button onClick={() => { setSel(t); flagUses(t); }}>
              <i className="ds-sw lg" style={{ background: t.value }} />
              <span className="ds-tname">{t.name}</span>
              <code>{t.value}</code>
            </button>
          </li>
        ))}
      </ul>
      {shown.length > 80 && <p className="ds-note">Showing 80 of {shown.length} — refine the filter to see the rest.</p>}
      {!colors.length && <p className="ds-note">No colour tokens loaded yet. Paste them under Tokens.</p>}

      {sel && (
        <div className="ds-try">
          <div className="ds-try-head">
            <b>{sel.name}</b>
            <button className="ds-x" onClick={() => { setSel(null); revert(); }} aria-label="Clear selection"><X size={14} /></button>
          </div>
          <p className="ds-note">
            {isVar(sel)
              ? 'This token exists as a CSS custom property. Overriding it will change every element that really uses it.'
              : 'No CSS custom property named --' + sel.name + ' on :root. Overriding it will change nothing — the value is probably hard-coded.'}
          </p>
          <div className="ds-try-row">
            <input type="color" value={temp} onChange={(e) => { setTemp(e.target.value); apply(sel, e.target.value); }} aria-label="Temporary colour" />
            <button className="ds-btn" onClick={() => apply(sel, temp)}>Apply</button>
            <button className="ds-btn" onClick={() => flagUses(sel)}>Flag current uses</button>
            <button className="ds-btn" onClick={revert}>Revert</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- tokens panel ---------- */

function TokensPanel({ tokens, setTokens }: { tokens: Token[]; setTokens: (t: Token[]) => void }) {
  const [raw, setRaw] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    const { tokens: t, error } = parseTokens(raw);
    setErr(error);
    if (!error) { setTokens(t); saveTokens(t); }
  };

  const byType = tokens.reduce<Record<string, number>>((a, t) => ({ ...a, [t.type]: (a[t.type] ?? 0) + 1 }), {});

  return (
    <div className="ds-panel-body">
      <p className="ds-note">
        {tokens.length
          ? `${tokens.length} tokens loaded — ${Object.entries(byType).map(([k, v]) => `${v} ${k}`).join(', ')}.`
          : 'No tokens loaded. Paste your design-token JSON, or start from the CSS variables this app already declares.'}
      </p>
      <textarea className="ds-ta" rows={6} spellCheck={false} value={raw} onChange={(e) => setRaw(e.target.value)}
        placeholder={'{\n  "color": { "primary": { "$value": "#2563eb" } },\n  "radius-md": "8px"\n}'} />
      {err && <p className="ds-err">{err}</p>}
      <div className="ds-try-row">
        <button className="ds-btn primary" onClick={load} disabled={!raw.trim()}>Load tokens</button>
        <button className="ds-btn" onClick={() => { const t = tokensFromCss(); setTokens(t); saveTokens(t); }}>Read from CSS variables</button>
        <button className="ds-btn" onClick={() => { setTokens([]); clearTokens(); }}>Clear</button>
      </div>
      <ul className="ds-tokens compact">
        {tokens.slice(0, 40).map((t) => (
          <li key={t.name}>
            <span className="ds-tline">
              {t.type === 'color' && colorKey(t.value) && <i className="ds-sw" style={{ background: t.value }} />}
              <span className="ds-tname">{t.name}</span><code>{t.value}</code>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- widget ---------- */

export default function DsTool() {
  const [pos, setPos] = useState<Pos>(loadPos);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [panel, setPanel] = useState<Panel>('coverage');
  const [tokens, setTokensState] = useState<Token[]>(loadTokens);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);

  const lookup = useMemo(() => buildLookup(tokens), [tokens]);
  const setTokens = (t: Token[]) => { setTokensState(t); setResult(null); unflag(); };

  const rescan = useCallback(() => { unflag(); setResult(scanPage(document.body, lookup)); }, [lookup]);

  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => () => unflag(), []);

  const start = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-nodrag]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, moved: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    d.moved = true;
    setPos(clamp({ x: e.clientX - d.dx, y: e.clientY - d.dy }));
  };
  const end = () => {
    const moved = drag.current?.moved;
    drag.current = null;
    if (moved) { try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* ignore */ } }
    else setOpen((o) => !o);
  };

  const pct = result && result.checks ? Math.round((result.usingToken / result.checks) * 100) : 0;

  return (
    <div className="ds-root" data-ds-ui style={{ left: pos.x, top: pos.y }}>
      {open && (
        <section className="ds-panel" aria-label="Design system checker">
          <header>
            <span className="ds-dot" />
            <h4>{panel === 'coverage' ? 'Token coverage' : panel === 'colour' ? 'Try a colour' : 'Tokens'}</h4>
            <button data-nodrag className={`ds-ic ${inspecting ? 'on' : ''}`} title="Inspect elements" aria-pressed={inspecting} onClick={() => { unflag(); setInspecting((v) => !v); }}><Crosshair size={15} /></button>
            <button data-nodrag className={`ds-ic ${panel === 'colour' ? 'on' : ''}`} title="Try a colour" onClick={() => setPanel((p) => (p === 'colour' ? 'coverage' : 'colour'))}><Palette size={15} /></button>
            <button data-nodrag className={`ds-ic ${panel === 'tokens' ? 'on' : ''}`} title="Tokens" onClick={() => setPanel((p) => (p === 'tokens' ? 'coverage' : 'tokens'))}><Settings2 size={15} /></button>
            <button data-nodrag className="ds-ic" title="Rescan" onClick={rescan}><RefreshCw size={15} /></button>
            <button data-nodrag className="ds-ic" title={collapsed ? 'Expand' : 'Collapse'} onClick={() => setCollapsed((c) => !c)}>{collapsed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
          </header>

          {!collapsed && panel === 'coverage' && (
            <div className="ds-panel-body">
              <p className="ds-path">{location.pathname}</p>
              {!tokens.length && <p className="ds-note">Load your design tokens first — open the gear icon above.</p>}
              {tokens.length > 0 && !result && <button className="ds-btn primary wide" onClick={rescan}>Scan this page</button>}
              {result && (
                <>
                  <div className="ds-bar"><i style={{ width: `${pct}%` }} /></div>
                  <div className="ds-stats">
                    <button className="ds-stat ok" onClick={() => { unflag(); result.tokenElements.forEach((e) => e.classList.add(FLAG_OK)); }}>
                      <b>{result.usingToken}</b><span>✓ Using token</span>
                    </button>
                    <button className="ds-stat bad" onClick={() => { unflag(); result.offElements.forEach((e) => e.classList.add(FLAG_BAD)); }}>
                      <b>{result.offToken}</b><span>✕ Not using token</span>
                    </button>
                  </div>
                  <p className="ds-note center">{pct}% token coverage · {result.elements} elements checked</p>
                  <p className="ds-note center">Click a number to flag those elements on the page</p>
                </>
              )}
            </div>
          )}

          {!collapsed && panel === 'colour' && <TryColour tokens={tokens} />}
          {!collapsed && panel === 'tokens' && <TokensPanel tokens={tokens} setTokens={setTokens} />}
        </section>
      )}

      <button
        className={`ds-fab ${inspecting ? 'on' : ''}`}
        onPointerDown={start} onPointerMove={move} onPointerUp={end}
        aria-label="Design system checker" aria-expanded={open}
      >
        <Search size={22} />
        {tokens.length > 0 && <i className="ds-fab-dot" />}
      </button>

      {inspecting && <Inspector lookup={lookup} onStop={() => setInspecting(false)} />}
    </div>
  );
}
