import { colorKey } from './tokens';
import type { Token } from './tokens';

export type Status = 'token' | 'off' | 'none';

export interface PropCheck {
  group: 'color' | 'typography' | 'shape';
  label: string;
  value: string;       // the computed value, e.g. "rgb(124, 124, 124)"
  status: Status;
  token?: string;      // the token whose value this matches
  nearest?: string;    // closest token when off-scale
  /** The CSS variable the stylesheet actually declares, when it declares one. */
  varName?: string;
  /** True when the value matches a token but the stylesheet writes a literal instead of the variable. */
  literal?: boolean;
}

/* ---------- what the stylesheet actually declares ---------- */

interface DeclRule { sel: string; props: Record<string, string> }
const WATCHED = ['color', 'background-color', 'background', 'border-top-color', 'border-color',
  'font-size', 'border-radius', 'border-top-left-radius'];
let declCache: DeclRule[] | null = null;

/** Author-level declarations for the properties we score. Same-origin sheets only. */
function declaredRules(): DeclRule[] {
  if (declCache) return declCache;
  const out: DeclRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; }
    const visit = (list: CSSRuleList) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSStyleRule) {
          const props: Record<string, string> = {};
          for (const prop of WATCHED) {
            const v = rule.style.getPropertyValue(prop);
            if (v) props[prop] = v.trim();
          }
          if (Object.keys(props).length) out.push({ sel: rule.selectorText, props });
        } else if ('cssRules' in rule) {
          visit((rule as CSSGroupingRule).cssRules);
        }
      }
    };
    visit(rules);
  }
  declCache = out;
  return out;
}

/** Re-read the stylesheets, e.g. after a hot reload. */
export const resetDeclarations = () => { declCache = null; };

const PROP_ALIASES: Record<string, string[]> = {
  color: ['color'],
  background: ['background-color', 'background'],
  border: ['border-top-color', 'border-color'],
  'font-size': ['font-size'],
  radius: ['border-top-left-radius', 'border-radius'],
};

/** color and font-size inherit, so the declaration that produced them may sit on an ancestor. */
const INHERITED = new Set(['color', 'font-size']);

function declaredOn(el: Element, props: string[]): string | null {
  const inline = (el as HTMLElement).style;
  for (const p of props) { const v = inline?.getPropertyValue(p); if (v) return v.trim(); }
  let found: string | null = null;
  for (const rule of declaredRules()) {
    let matches = false;
    try { matches = el.matches(rule.sel); } catch { continue; }
    if (!matches) continue;
    for (const p of props) if (rule.props[p]) found = rule.props[p];
  }
  return found;
}

/** The declaration that wins for this element, following inheritance, or null when there is none. */
function declaredFor(el: Element, kind: keyof typeof PROP_ALIASES): string | null {
  const props = PROP_ALIASES[kind];
  let node: Element | null = el;
  const inherits = INHERITED.has(props[0]);
  while (node) {
    const v = declaredOn(node, props);
    if (v && v !== 'inherit') return v;
    if (!inherits) return null;
    node = node.parentElement;
  }
  return null;
}

const VAR_RE = /var\(\s*(--[\w-]+)/;

export interface Lookup {
  color: Map<string, string[]>;      // "r,g,b,a" -> token names
  radius: Map<string, string[]>;     // "4px"     -> radius token names
  spacing: Map<string, string[]>;    // "16px"    -> spacing token names
  fontSize: Map<string, string[]>;   // "14px"    -> type-scale token names
  font: string[];                    // font-family token values
  names: Set<string>;                // every token name, for resolving a declared variable
}

/** Which scale a dimension token belongs to, read from its name. */
const scaleOf = (name: string): 'radius' | 'spacing' | 'fontSize' | 'other' => {
  if (/radius|corner/i.test(name)) return 'radius';
  if (/spacing|space|gap|padding|margin/i.test(name)) return 'spacing';
  if (/-size$|font-?size/i.test(name)) return 'fontSize';
  return 'other';
};

export function buildLookup(tokens: Token[]): Lookup {
  const color = new Map<string, string[]>();
  const radius = new Map<string, string[]>();
  const spacing = new Map<string, string[]>();
  const fontSize = new Map<string, string[]>();
  const font: string[] = [];
  const add = (m: Map<string, string[]>, k: string, name: string) => m.set(k, [...(m.get(k) ?? []), name]);

  for (const t of tokens) {
    if (t.type === 'color') {
      const k = colorKey(t.value);
      if (k) add(color, k, t.name);
    } else if (t.type === 'dimension') {
      const k = normPx(t.value);
      if (!k) continue;
      const scale = scaleOf(t.name);
      if (scale === 'radius') add(radius, k, t.name);
      else if (scale === 'spacing') add(spacing, k, t.name);
      else if (scale === 'fontSize') add(fontSize, k, t.name);
      else { add(radius, k, t.name); add(spacing, k, t.name); add(fontSize, k, t.name); }
    } else if (t.type === 'font') {
      font.push(t.value);
    }
  }
  // A role such as xds-color-text/default is the answer a designer expects; a primitive that
  // happens to carry the same hex is not. Sort roles first so the inspector names the role.
  const roleFirst = (names: string[]) =>
    [...names].sort((a, b) => Number(/^xds-color|color-/.test(b)) - Number(/^xds-color|color-/.test(a)));
  for (const [k, v] of color) color.set(k, roleFirst(v));
  return { color, radius, spacing, fontSize, font, names: new Set(tokens.map((t) => t.name)) };
}

/** px value rounded to 2 decimals, converting rem at the document root size. */
export function normPx(v: string): string | null {
  const m = /^(-?[\d.]+)(px|rem|em)?$/.exec(v.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  const base = typeof document !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;
  const px = m[2] === 'rem' || m[2] === 'em' ? n * base : n;
  return `${Math.round(px * 100) / 100}px`;
}

const TRANSPARENT = '0,0,0,0';

/** True when the element renders text of its own, rather than only wrapping children. */
export function hasOwnText(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim()) return true;
  }
  return false;
}

export function ownText(el: Element): string {
  return Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => (n.textContent ?? '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * One hex usually carries several roles — #252525 is text/default, icon/default and
 * background/inverse at once. Name the role that belongs to the property being checked, so a text
 * colour is never reported as a background role.
 */
function pickToken(names: string[], family: string): string {
  return names.find((n) => new RegExp(`(^|[-/])${family}([-/]|$)`, 'i').test(n)) ?? names[0];
}

function colorCheck(el: Element, group: PropCheck['group'], label: string, raw: string, lookup: Lookup, family: string,
                    kind: keyof typeof PROP_ALIASES): PropCheck | null {
  const key = colorKey(raw);
  if (!key || key === TRANSPARENT) return null;
  const names = lookup.color.get(key);
  const declared = declaredFor(el, kind);
  const varName = declared ? (VAR_RE.exec(declared)?.[1] ?? undefined) : undefined;
  const named = varName && lookup.names.has(varName.slice(2)) ? varName.slice(2) : undefined;
  return {
    group, label, value: raw,
    status: names || named ? 'token' : 'off',
    token: named ?? (names ? pickToken(names, family) : undefined),
    varName,
    literal: !!names && !varName,
  };
}

/** Each dimension is scored against its own scale — a font size must never match a spacing step. */
function dimensionCheck(el: Element, group: PropCheck['group'], label: string, raw: string, scale: Map<string, string[]>,
                        kind: keyof typeof PROP_ALIASES, allNames: Set<string>): PropCheck | null {
  const key = normPx(raw);
  if (!key || key === '0px') return null;
  const declared = declaredFor(el, kind);
  const varName = declared ? (VAR_RE.exec(declared)?.[1] ?? undefined) : undefined;
  const named = varName && allNames.has(varName.slice(2)) ? varName.slice(2) : undefined;
  if (!scale.size && !named) return { group, label, value: key, status: 'none', varName };
  const names = scale.get(key);
  if (named || names) return { group, label, value: key, status: 'token', token: named ?? names![0], varName, literal: !varName };
  return { group, label, value: key, status: 'off', nearest: nearestDimension(key, scale), varName };
}

function nearestDimension(value: string, scale: Map<string, string[]>): string | undefined {
  const n = parseFloat(value);
  let best: { name: string; v: number } | null = null;
  for (const [k, names] of scale) {
    const d = Math.abs(parseFloat(k) - n);
    if (!best || d < Math.abs(best.v - n)) best = { name: `${names[0]} (${k})`, v: parseFloat(k) };
  }
  return best?.name;
}

/** Every token-relevant property of one element, with its verdict. */
export function checkElement(el: Element, lookup: Lookup): PropCheck[] {
  const cs = getComputedStyle(el);
  const out: PropCheck[] = [];
  const push = (c: PropCheck | null) => { if (c) out.push(c); };

  if (hasOwnText(el)) push(colorCheck(el, 'color', 'text', cs.color, lookup, 'text', 'color'));
  push(colorCheck(el, 'color', 'background', cs.backgroundColor, lookup, 'background', 'background'));
  if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0) {
    push(colorCheck(el, 'color', 'border', cs.borderTopColor, lookup, 'border', 'border'));
  }

  if (hasOwnText(el)) {
    push(dimensionCheck(el, 'typography', 'font-size', cs.fontSize, lookup.fontSize, 'font-size', lookup.names));
    const fam = cs.fontFamily;
    const famOk = lookup.font.some((f) => sameFamily(f, fam));
    out.push({ group: 'typography', label: 'family', value: fam.split(',')[0].replace(/["']/g, ''), status: lookup.font.length ? (famOk ? 'token' : 'off') : 'none' });
    out.push({ group: 'typography', label: 'weight / line-height', value: `${cs.fontWeight} / ${cs.lineHeight}`, status: 'none' });
  }

  push(dimensionCheck(el, 'shape', 'radius', cs.borderTopLeftRadius, lookup.radius, 'radius', lookup.names));
  return out;
}

const sameFamily = (a: string, b: string) =>
  a.split(',')[0].trim().replace(/["']/g, '').toLowerCase() === b.split(',')[0].trim().replace(/["']/g, '').toLowerCase();

export interface ScanResult {
  elements: number;
  checks: number;
  usingToken: number;
  offToken: number;
  offElements: Element[];
  tokenElements: Element[];
}

export const SKIP = 'script,style,link,meta,title,head,svg *,[data-ds-ui],[data-ds-ui] *';

/** Walk the page and score every element against the tokens. */
export function scanPage(root: ParentNode, lookup: Lookup): ScanResult {
  const res: ScanResult = { elements: 0, checks: 0, usingToken: 0, offToken: 0, offElements: [], tokenElements: [] };
  for (const el of Array.from(root.querySelectorAll('*'))) {
    if (el.matches(SKIP) || el.closest('[data-ds-ui]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const checks = checkElement(el, lookup).filter((c) => c.status !== 'none');
    if (!checks.length) continue;
    res.elements += 1;
    res.checks += checks.length;
    // A literal that happens to equal a token is not "using" it — the stylesheet must say var(--…).
    const bad = checks.filter((c) => c.status === 'off' || c.literal).length;
    res.usingToken += checks.length - bad;
    res.offToken += bad;
    (bad ? res.offElements : res.tokenElements).push(el);
  }
  return res;
}

/** Elements whose computed colour equals this one — used to prove a token is really applied. */
export function elementsUsingColor(root: ParentNode, value: string): Element[] {
  const key = colorKey(value);
  if (!key) return [];
  const out: Element[] = [];
  for (const el of Array.from(root.querySelectorAll('*'))) {
    if (el.matches(SKIP) || el.closest('[data-ds-ui]')) continue;
    const cs = getComputedStyle(el);
    const hit = (hasOwnText(el) && colorKey(cs.color) === key)
      || colorKey(cs.backgroundColor) === key
      || (parseFloat(cs.borderTopWidth) > 0 && colorKey(cs.borderTopColor) === key);
    if (hit) out.push(el);
  }
  return out;
}
