# Developer area — XenDS sync

Scope: the Developer menu (`/developer`) — Guides, Try, API keys, Webhooks, Events, plus its modals
and drawers. Files: `src/developer/*`, and the Webhooks / IP Allowlist panels that
`src/pages/Developers.tsx` renders inside it.

## Colour

Every colour in `src/developer/developer.css` now resolves through `src/design/tokens.css`.
Before: 162 literal hex values and legacy `--blue` / `--muted` / `--line` references across
~90 distinct colours. After: none — `grep` for a hex literal in that file returns nothing.

How the mapping was made, by family:

| Legacy values | XenDS role |
| --- | --- |
| `--text`, `#101828`, `#0f172a`, `#172036`, `#1f2937`, `#374151` | `xds-color-text/default` |
| `--muted`, `#667085`, `#6b7280`, `#64748b`, `#475569`, `#475467`, `#6b7a90` | `xds-color-text/weak` |
| `#94a3b8`, `#9aa3b2` | `xds-color-text/disabled` |
| `#4b5563`, `#344054` | `xds-color-icon/default` |
| `--blue`, `#2563eb` | `xds-color-background/accent/default` |
| `#1d4ed8`, `#4f46e5` | `xds-color-text/accent` |
| `#f4f8ff`, `#eff4ff`, `#eef3ff`, `#f7faff`, `#f8faff`, `#f0f1fe` | `xds-color-background/accent/weaker` |
| `#e3edff`, `#e0ecff` | `xds-color-background/accent/weak` |
| `--line`, `--line-soft`, `#e5e7eb`, `#e2e8f0`, `#e3e7ee` | `xds-color-border/default` |
| `#d0d5dd`, `#d5dbe6`, `#d5dae3`, `#c3cad6` | `xds-color-border/weak` |
| `#fff` | `xds-color-background/default` |
| `#f8fafc`, `#f9fafb`, `#f7f9fc`, `#f6f8fb`, `#f3f5f9`, `#f1f4f9`, `#f2f4f7`, `#eef1f6` | `xds-color-background/weak` |
| greens (`#0c6a39`, `#067647`, `#dcf6e7`, `#abdfc1`, …) | `xds-color-*/success/*` |
| reds (`#a4271d`, `#e5484d`, `#fde0dd`, `#f7c6c0`, …) | `xds-color-*/critical/*` |
| ambers (`#8a5a06`, `#b45309`, `#ffefc2`, `#f5dba0`, …) | `xds-color-*/warning/*` |

The app's own `--line` and `--line-soft` both land on `xds-color-border/default`. XenDS has nothing
lighter than `#ededed` at that step — `border/weak` is `#b7b7b7`, which is darker — so the two
shades the code used collapse into one.

## Button

`.dv-btn` is now the XenDS **Button** (Figma `483:1724`), measured from the component set:

| | Figma | Code |
| --- | --- | --- |
| Medium height | 40px | 40px ✓ |
| Medium padding | 12px all round | `var(--xds-spacing-sm)` = 12px ✓ |
| Small height | 32px | 32px ✓ |
| Small padding | 8/12 | 8/12 ✓ |
| Radius | 4px | `var(--xds-radius-sm)` ✓ |
| Label (medium) | 14px / 16, Medium | 14/16, 500 ✓ |
| Label (small) | 12px / 16, Medium | 12/16, 500 ✓ |
| Icon gap | 4px | `var(--xds-spacing-2xs)` ✓ |
| Main / Filled | bg `accent/default`, text `text/inverse` | ✓ |
| Neutral / Outlined | bg `background/default`, border `border/default`, text `text/default` | ✓ |
| Neutral / Outlined hover | bg `background/weak` | ✓ |
| Neutral / Subtle | no fill, text `text/default` | ✓ (`.dv-btn.subtle`) |
| Destructive / Filled | bg `critical/default`, text `text/inverse` | ✓ (`.dv-btn.danger`) |
| Disabled | bg `background/disabled`, text `text/disabled` | ✓ |

The generic `.btn` used by the Webhooks and IP Allowlist panels is remapped to the same spec, but
only under `.dv-tab`, so pages outside the Developer area keep the old button until they are migrated.

### One deliberate difference

In Figma, Button's **Hovered** and **Pressed** variants for Main/Filled are pixel-identical to
**Rest** — same `accent/default` fill, no overlay. A button with no hover feedback is worse than one
with it, so the code uses `accent/strong` on hover. That is this codebase's addition, not the
design file's.

## Verified

Measured in the browser on `/developer`: primary button 40px / 12px padding / radius 4 /
14px-16px / `#1762ee` on `#ffffff`; small outlined 32px / 8px-12px / `#252525` on `#ffffff`
with `#ededed` border. A sweep of all five tabs for the legacy `#0b5fff`, `#eef0f4` and `#6b7280`
returns nothing. No console errors.

## Typography

63 rules in `developer.css` were rewritten onto the XenDS type scale. Each one was matched by
snapping its size to the nearest step the scale has, then picking the style whose weight matched:

| Size after snapping | weight 600 | weight 500 | weight 400 |
| --- | --- | --- | --- |
| 24px | `Heading/H2` | — | — |
| 20px | `Heading/H3` | — | — |
| 18px | `Heading/H4` | — | — |
| 16px | `Subheading/lg` | `Label/lg/semi-bold` | `Body/lg` |
| 14px | `Subheading/md` | `Label/md/semi-bold` | `Body/md` |
| 12px | `Caption/bold` | `Label/sm/semi-bold` | `Caption/regular` |
| 10px | `Label/xs/bold` | `Label/xs/semi-bold` | `Label/xs/regular` |

Sizes the scale does not have — 11, 11.5, 12.5, 13, 13.5, 15, 15.5, 17, 19 — all disappeared.
Each rule now sets size, line-height and weight from the same style, so the three can no longer
drift apart. `.dv-tab`, `.dv-modal` and `.dv-drawer` set `Body/md` as the inherited default, so
anything without its own size still lands on the scale.

The shared `.dev-*` styles from `styles.css` (12.5px descriptions, 13px panel text, 11px notes,
10.5px table groups) are snapped the same way, scoped to `.dv-tab`.

### The one exception

`.mono` keeps `font-size: .92em`. XenDS has no monospace type style, and monospace at the same
nominal size reads larger than the surrounding text, so the optical correction stays. Measured,
that produces 11.04px / 12.88px depending on context — the only off-scale sizes left in the area.

## Spacing and radius

Every `padding`, `margin`, `gap` and `border-radius` in `developer.css` now points at a XenDS step.
171 lines changed. Values were snapped to the nearest step, and **ties round up** — 6px became 8px,
10px became 12px, 14px became 16px — so nothing got tighter than the designer's own step.

| Scale | Steps |
| --- | --- |
| Spacing | 2 (3xs), 4 (2xs), 8 (xs), 12 (sm), 16 (md), 24 (lg), 32 (xl), 40 (2xl), 48 (3xl), 56 (4xl), 64 (5xl), 72 (6xl) |
| Radius | 0 (none), 4 (sm), 8 (md), 12 (lg), 999 (full) |

Off-scale values that disappeared: spacing at 3, 6, 7, 9, 10, 14, 18, 20, 22, 26, 28, 34px;
radius at 6, 9, 10, 14px. A sweep of computed `padding`, `gap` and `border-radius` across the
Developer area and its modals now returns nothing off the scale.

Two values were left deliberately, both commented in the file:

- The drawer's `padding-bottom: 96px` — past the 72px top of the scale, and it exists so content
  can scroll clear of the fixed footer.
- The modal radius was 14px, which the scale does not have; it is now `radius/lg` (12px).

## Letter-spacing

The earlier typography pass did **not** carry tracking across — an error in the previous version of
this note, which claimed it did. It has now been done properly: every rule that uses a XenDS type
style also takes that style's `-tracking` value, so size, line-height, weight and tracking all come
from one place. The hand-written `-.015em`, `-.01em`, `.02em` and `.03em` values are gone.

## Not done

- `src/dstool/*` (the design-system checker) is deliberately excluded. It is tooling that inspects
  the page, so it keeps its own dark palette and sizing.
- The `.mono` exception above still applies.
- The Developer area has no XenDS counterpart for its code blocks, the flow diagram or the
  design-system checker — those stay as they are.
