/** Design-token store for the checker. Tokens are supplied by the user; nothing here is authoritative. */
export type TokenType = 'color' | 'dimension' | 'font' | 'other';

export interface Token { name: string; value: string; type: TokenType }

const K = 'ds.tokens';

/* ---------- colour parsing ---------- */

/** Canonical "r,g,b,a" key for any CSS colour the browser can compute, or null. */
export function colorKey(input: string): string | null {
  const v = input.trim().toLowerCase();
  if (!v || v === 'transparent' || v === 'none') return null;

  const hex = /^#([0-9a-f]{3,8})$/.exec(v);
  if (hex) {
    const h = hex[1];
    const ex = h.length === 3 || h.length === 4 ? [...h].map((c) => c + c).join('') : h;
    if (ex.length !== 6 && ex.length !== 8) return null;
    const n = (i: number) => parseInt(ex.slice(i, i + 2), 16);
    const a = ex.length === 8 ? n(6) / 255 : 1;
    return `${n(0)},${n(2)},${n(4)},${round(a)}`;
  }

  const fn = /^rgba?\(([^)]+)\)$/.exec(v);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const c = parts.slice(0, 3).map((p) => (p.endsWith('%') ? Math.round(parseFloat(p) * 2.55) : parseInt(p, 10)));
    if (c.some(Number.isNaN)) return null;
    const rawA = parts[3];
    const a = rawA === undefined ? 1 : rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA);
    return `${c[0]},${c[1]},${c[2]},${round(Number.isNaN(a) ? 1 : a)}`;
  }

  // Named colours and modern syntaxes: let the browser resolve it.
  return computeColor(v);
}

const round = (a: number) => Math.round(a * 100) / 100;

let probe: HTMLSpanElement | null = null;
function computeColor(v: string): string | null {
  if (typeof document === 'undefined') return null;
  if (!probe) {
    probe = document.createElement('span');
    probe.setAttribute('data-ds-ui', '');
    probe.style.display = 'none';
    document.body.appendChild(probe);
  }
  probe.style.color = '';
  probe.style.color = v;
  if (!probe.style.color) return null;
  const out = getComputedStyle(probe).color;
  return out && out !== v ? colorKey(out) : null;
}

/* ---------- token parsing ---------- */

const typeOf = (value: string): TokenType => {
  if (colorKey(value)) return 'color';
  if (/^-?[\d.]+(px|rem|em|%)$/.test(value.trim())) return 'dimension';
  if (/[a-z]+(,|\s|$)/i.test(value) && /font|family/i.test(value)) return 'font';
  return 'other';
};

/**
 * Accepts a flat map, a nested object, or W3C design-token JSON ({ $value }).
 * Nested keys are joined with "-", matching the usual CSS custom property naming.
 */
export function parseTokens(raw: string): { tokens: Token[]; error: string | null } {
  let data: unknown;
  try { data = JSON.parse(raw); } catch (e) { return { tokens: [], error: (e as Error).message }; }

  const out: Token[] = [];
  const seen = new Set<string>();
  const walk = (node: unknown, path: string[]) => {
    if (node === null || node === undefined) return;
    if (typeof node === 'string' || typeof node === 'number') {
      add(path.join('-'), String(node));
      return;
    }
    if (typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    const val = obj.$value ?? obj.value;
    if (typeof val === 'string' || typeof val === 'number') {
      add(path.join('-'), String(val));
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$') || k === 'value' || k === 'type') continue;
      walk(v, [...path, k]);
    }
  };
  const add = (name: string, value: string) => {
    const clean = name.replace(/^-+/, '').trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    out.push({ name: clean, value: value.trim(), type: typeOf(String(value)) });
  };

  walk(data, []);
  return out.length ? { tokens: out, error: null } : { tokens: [], error: 'No tokens found in that JSON.' };
}

/** Fallback set: every custom property declared on :root in the page's own stylesheets. */
export function tokensFromCss(): Token[] {
  const out: Token[] = [];
  const seen = new Set<string>();
  const root = getComputedStyle(document.documentElement);
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; } // cross-origin sheet
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule) || !/:root|^html$/.test(rule.selectorText)) continue;
      for (const prop of Array.from(rule.style)) {
        if (!prop.startsWith('--') || seen.has(prop)) continue;
        seen.add(prop);
        const value = root.getPropertyValue(prop).trim();
        if (value) out.push({ name: prop.slice(2), value, type: typeOf(value) });
      }
    }
  }
  return out;
}

export const loadTokens = (): Token[] => {
  try {
    const v = JSON.parse(localStorage.getItem(K) ?? 'null');
    if (Array.isArray(v) && v.length) return v as Token[];
  } catch { /* ignore */ }
  return [];
};

export const saveTokens = (t: Token[]) => {
  try { localStorage.setItem(K, JSON.stringify(t)); } catch { /* storage unavailable */ }
};

export const clearTokens = () => {
  try { localStorage.removeItem(K); } catch { /* storage unavailable */ }
};
