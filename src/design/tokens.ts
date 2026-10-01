/**
 * Reader for the Xendit design-token file (W3C DTCG format, exported from Figma).
 * Preview only — nothing here styles the app.
 */
import raw from './xendit.tokens.json';

export interface ColorToken { path: string; name: string; value: string; ref?: string; description?: string }
export interface DimensionToken { path: string; name: string; value: string; description?: string }
export interface TypographyToken {
  path: string; group: string; name: string;
  fontFamily: string; fontWeight: number; fontSize: string; lineHeight: string; letterSpacing: string;
  description?: string;
}

type Node = Record<string, unknown>;

const isToken = (n: unknown): n is Node => !!n && typeof n === 'object' && '$type' in (n as Node);

/** "{Global.xds.blue.50}" -> "Global.xds.blue.50", or null when the value is literal. */
const aliasOf = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const m = /^\{(.+)\}$/.exec(v.trim());
  return m ? m[1] : null;
};

function at(path: string): Node | null {
  let node: unknown = raw;
  for (const key of path.split('.')) {
    if (!node || typeof node !== 'object') return null;
    node = (node as Node)[key];
  }
  return isToken(node) ? node : null;
}

/** Follows aliases until a literal value is reached. */
function resolve(value: unknown, depth = 0): unknown {
  const alias = aliasOf(value);
  if (!alias || depth > 10) return value;
  const target = at(alias);
  return target ? resolve(target.$value, depth + 1) : value;
}

const dim = (v: unknown): string => {
  if (typeof v === 'number') return `${v}px`;
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'value' in (v as Node)) {
    const o = v as { value: number; unit?: string };
    return `${round(o.value)}${o.unit ?? 'px'}`;
  }
  return '';
};
const round = (n: number) => Math.round(n * 100) / 100;

function walk(node: unknown, path: string[], visit: (path: string[], token: Node) => void) {
  if (!node || typeof node !== 'object') return;
  if (isToken(node)) { visit(path, node as Node); return; }
  for (const [k, v] of Object.entries(node as Node)) {
    if (k.startsWith('$')) continue;
    walk(v, [...path, k], visit);
  }
}

function collectColors(root: unknown, base: string[]): ColorToken[] {
  const out: ColorToken[] = [];
  walk(root, base, (path, t) => {
    if (t.$type !== 'color') return;
    const value = resolve(t.$value);
    if (typeof value !== 'string') return;
    out.push({
      path: path.join('.'),
      name: path.slice(base.length).join('.'),
      value,
      ref: aliasOf(t.$value) ?? undefined,
      description: typeof t.$description === 'string' && t.$description ? t.$description : undefined,
    });
  });
  return out;
}

/* ---------- primitive palette ---------- */

export interface Ramp { name: string; steps: ColorToken[] }

export const palette: Ramp[] = (() => {
  const global = (raw as Node).Global as Node;
  const xds = global?.xds as Node ?? {};
  const ramps: Ramp[] = [];
  const singles: ColorToken[] = [];
  for (const [name, node] of Object.entries(xds)) {
    if (isToken(node)) {
      const v = resolve((node as Node).$value);
      if (typeof v === 'string') singles.push({ path: `Global.xds.${name}`, name, value: v });
      continue;
    }
    const steps = collectColors(node, ['Global', 'xds', name]);
    if (steps.length) ramps.push({ name, steps });
  }
  return singles.length ? [{ name: 'base', steps: singles }, ...ramps] : ramps;
})();

/* ---------- semantic colours ---------- */

export interface SemanticGroup { name: string; tokens: ColorToken[] }

export const semanticColors: SemanticGroup[] = Object.entries(((raw as Node).Color as Node) ?? {})
  .map(([name, node]) => ({ name, tokens: collectColors(node, ['Color', name]) }))
  .filter((g) => g.tokens.length);

/* ---------- dimensions ---------- */

function collectDimensions(root: unknown, base: string[]): DimensionToken[] {
  const out: DimensionToken[] = [];
  walk(root, base, (path, t) => {
    if (t.$type !== 'dimension') return;
    out.push({ path: path.join('.'), name: path[path.length - 1], value: dim(resolve(t.$value)) });
  });
  return out;
}

export const spacing: DimensionToken[] = collectDimensions((raw as Node).Spacing, ['Spacing']);
export const radii: DimensionToken[] = collectDimensions((raw as Node)['Border Radius'], ['Border Radius']);

/* ---------- typography ---------- */

export interface TypeGroup { name: string; styles: TypographyToken[] }

export const typography: TypeGroup[] = Object.entries(((raw as Node)['Typography-styles'] as Node) ?? {})
  .map(([group, node]) => {
    const styles: TypographyToken[] = [];
    walk(node, [group], (path, t) => {
      if (t.$type !== 'typography') return;
      const v = resolve(t.$value) as Record<string, unknown>;
      styles.push({
        path: `Typography-styles.${path.join('.')}`,
        group,
        name: path.slice(1).join(' ') || group,
        fontFamily: String(v.fontFamily ?? 'Inter'),
        fontWeight: Number(v.fontWeight ?? 400),
        fontSize: dim(v.fontSize),
        lineHeight: dim(v.lineHeight),
        letterSpacing: dim(v.letterSpacing),
        description: typeof t.$description === 'string' && t.$description ? t.$description : undefined,
      });
    });
    return { name: group, styles };
  })
  .filter((g) => g.styles.length);

/* ---------- summary + export ---------- */

export const counts = {
  palette: palette.reduce((n, r) => n + r.steps.length, 0),
  semantic: semanticColors.reduce((n, g) => n + g.tokens.length, 0),
  spacing: spacing.length,
  radii: radii.length,
  typography: typography.reduce((n, g) => n + g.styles.length, 0),
};

export const meta = ((raw as Node).$extensions as Node)?.['tokens-bruecke-meta'] as
  { spec?: string; colorMode?: string; createdAt?: string; variableCollections?: string[] } | undefined;

/** Flat { name: value } map, the shape the design-system checker reads. */
export function flatForChecker(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of palette) for (const s of r.steps) out[`xds-${r.name === 'base' ? '' : `${r.name}-`}${s.name}`.replace(/\.+/g, '-')] = s.value;
  for (const g of semanticColors) for (const t of g.tokens) out[`${g.name}-${t.name}`.replace(/\./g, '-')] = t.value;
  for (const d of spacing) out[`xds-spacing-${d.name}`] = d.value;
  for (const d of radii) out[`xds-radius-${d.name}`] = d.value;
  return out;
}
