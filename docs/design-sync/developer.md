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

## Not done

- Spacing and radius elsewhere in the Developer area still use literal px values. Only colour and
  the button were synced; the panels, tables and drawers were not re-measured against XenDS
  spacing tokens.
- Typography is unchanged apart from the button. The XenDS type scale (`Body md` 14/20,
  `Caption regular` 12/16, …) is available as CSS variables but not applied.
- The Developer area has no XenDS counterpart for its code blocks, the flow diagram or the
  design-system checker — those stay as they are.
