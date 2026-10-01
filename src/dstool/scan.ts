import { colorKey } from './tokens';
import type { Token } from './tokens';

export type Status = 'token' | 'off' | 'none';

export interface PropCheck {
  group: 'color' | 'typography' | 'shape';
  label: string;
  value: string;
  status: Status;
  token?: string;      // matching token name
  nearest?: string;    // closest token when off-scale
}

export interface Lookup {
  color: Map<string, string[]>;      // "r,g,b,a" -> token names
  radius: Map<string, string[]>;     // "4px"     -> radius token names
  spacing: Map<string, string[]>;    // "16px"    -> spacing token names
  fontSize: Map<string, string[]>;   // "14px"    -> type-scale token names
  font: string[];                    // font-family token values
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
  return { color, radius, spacing, fontSize, font };
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

function colorCheck(group: PropCheck['group'], label: string, raw: string, lookup: Lookup, family: string): PropCheck | null {
  const key = colorKey(raw);
  if (!key || key === TRANSPARENT) return null;
  const names = lookup.color.get(key);
  return { group, label, value: raw, status: names ? 'token' : 'off', token: names ? pickToken(names, family) : undefined };
}

/** Each dimension is scored against its own scale — a font size must never match a spacing step. */
function dimensionCheck(group: PropCheck['group'], label: string, raw: string, scale: Map<string, string[]>): PropCheck | null {
  const key = normPx(raw);
  if (!key || key === '0px') return null;
  if (!scale.size) return { group, label, value: key, status: 'none' };
  const names = scale.get(key);
  if (names) return { group, label, value: key, status: 'token', token: names[0] };
  return { group, label, value: key, status: 'off', nearest: nearestDimension(key, scale) };
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

  if (hasOwnText(el)) push(colorCheck('color', 'text', cs.color, lookup, 'text'));
  push(colorCheck('color', 'background', cs.backgroundColor, lookup, 'background'));
  if (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0) {
    push(colorCheck('color', 'border', cs.borderTopColor, lookup, 'border'));
  }

  if (hasOwnText(el)) {
    push(dimensionCheck('typography', 'font-size', cs.fontSize, lookup.fontSize));
    const fam = cs.fontFamily;
    const famOk = lookup.font.some((f) => sameFamily(f, fam));
    out.push({ group: 'typography', label: 'family', value: fam.split(',')[0].replace(/["']/g, ''), status: lookup.font.length ? (famOk ? 'token' : 'off') : 'none' });
    out.push({ group: 'typography', label: 'weight / line-height', value: `${cs.fontWeight} / ${cs.lineHeight}`, status: 'none' });
  }

  push(dimensionCheck('shape', 'radius', cs.borderTopLeftRadius, lookup.radius));
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
    const bad = checks.filter((c) => c.status === 'off').length;
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
