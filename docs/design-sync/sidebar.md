# Sidebar — Figma vs code

Source: **XenDS Component - DUPLICATED - DANIEL** → page `-> Sidebar` → component `Sidebar` (`2955:18230`),
menu item component set `.parent menu` (`1332:5284`).
Code: `src/components/Sidebar.tsx`, `src/styles.css`.

**Status: aligned.** The table below is the audit as first taken; everything marked ✗ in sections 1–3
has since been fixed in `src/components/sidebar.css`, except where noted under *Still open*.

Measured after the fix, on `/transactions`: width 248px, background `#fbfcfd`, right border `#ededed`,
item 32px high, padding `8px 4px 8px 12px`, radius 4px, label 12px/16px, selected `#1762ee`,
group title 10px/12px `#909090` — all equal to Figma.

### Still open

- **Sub-menu items** follow `.child menu` (1332:5353) only in type and colour; its `Position`
  (First/Middle/Last) rail treatment is not implemented.
- **`Has Tag` and `Has Activity`** now have CSS (`.menu-tag`, `.menu-dot`) bound to the right tokens,
  but no nav item uses them yet — there is no data for them.
- **Selected indicator side** is assumed to be the left edge. The Figma layer (`Rectangle 15`, 4×16,
  radius 4) sits inside the item container; its side was not confirmed.
- **The rest of the app** still uses the legacy variables in `styles.css`. Only the sidebar was moved
  onto XenDS tokens.

## 1. Structure

| Part | Figma | Code | Same? |
| --- | --- | --- | --- |
| Root | `Sidebar` 248 wide, vertical auto-layout | `.sidebar` 280 wide, flex column | ✗ width |
| | `content-wrapper` → `Header` + `Sections of Menu` | `.brand` + `.nav` | ✓ shape |
| Header | 48 high, padding 8/12/8/8, holds `.brand` chip (padding 4, radius 4) | `.brand` 49 high, `padding-left: 22`, bottom border | ✗ |
| Group | `.top-separator` (title) + `Menu` + `.btm-separator` (divider) | `.nav-group` with `.nav-title`, top border between groups | ✓ shape |
| Item | `.base menu` → `.parent menu` → `Container` → `wrapper` (icon + label) + `Badge` | `.nav-item` (icon + span) | ✓ shape |
| Footer | `.footer` = `Notification Button` + `Account Area` | `.org-wrap` (account only) | ✗ no notification button |

Figma's `.parent menu` has 8 variants from three properties: `Selected state`, `Hovered state`, `Has Submenu`,
plus `Has Tag`, `Has Activity`, `Has Icon`, `Text`, `Icon`.
The code covers selected, hover and submenu, but has no equivalent of `Has Tag` (the "New" chip) or
`Has Activity` (the red badge).

## 2. Values

| Property | Figma | Figma token | Code | Verdict |
| --- | --- | --- | --- | --- |
| Sidebar width | 248px | — | 280px | ✗ 32px wider |
| Sidebar background | `#fbfcfd` | *none (hardcoded in Figma)* | `#fff` | ✗ |
| Sidebar right border | `#ededed` | `xds-color-border/default` | `var(--line-soft)` = `#eef0f4` | ✗ value and no matching token |
| Group title size | 10px / 12 line-height, Semi Bold | — | 12px, weight 500 | ✗ |
| Group title colour | `#909090` | `xds-color-text/disabled` | `var(--muted)` = `#6b7280` | ✗ |
| Group title padding | 12/12/8/12 | — | `margin: 0 0 9px 17px` | ✗ |
| Item height | 32px | — | 32.5px | ✗ 0.5px |
| Item padding | 8/4/8/12 | — | `0 12px 0 5px` | ✗ |
| Item gap (icon→label) | 8px (`wrapper`) | — | 12px | ✗ |
| Item radius | 4px | — | 6px | ✗ |
| Label size | 12px / 16 line-height, Regular | — | 14px | ✗ |
| Label colour (rest) | `#252525` | `xds-color-text/default` | `#2b3240` | ✗ value and no token |
| Label colour (selected) | `#1762ee`, weight Medium | `xds-color-text/accent` | `var(--blue)` = `#0b5fff`, weight 500 | ✗ value |
| Hover background | `#f3f7fe` | `xen/blue/50` | `#f1f4f9` | ✗ value and no token |
| Selected indicator | 16px tall bar, radius 4 | `xds-color-background/accent/default` `#1762ee` | 3×10px bar, radius `0 2px 2px 0`, `var(--blue)` | ✗ |
| Badge (activity) | radius 999 | `xds-color-background/critical/default` `#e84855` | not implemented | ✗ missing |
| Tag text ("New") | `#997207`, 10px Medium | `text/warning` | not implemented | ✗ missing |
| Footer background | `#ffffff` | `xds-color-background/default` | — | — |
| Footer padding / gap | 12/0/24/0, gap 16 | — | `padding: 0 12px`, `margin-bottom: 14px` | ✗ |
| Notification button | 224×32, radius 4, border `#ededed` | `xds-color-border/default` | not implemented | ✗ missing |

## 3. Token sync

The code does not reference the XenDS tokens at all. `src/styles.css` declares its own
`--blue`, `--muted`, `--line-soft` and so on, and none of their values match the XenDS token they
stand in for:

| Code variable | Value | Closest XenDS token | Token value | Match |
| --- | --- | --- | --- | --- |
| `--blue` | `#0b5fff` | `xds-color-text/accent` → `blue.500` | `#1762ee` | ✗ |
| `--text` | `#1a1f2b` | `xds-color-text/default` → `gray.900` | `#252525` | ✗ |
| `--muted` | `#6b7280` | `xds-color-text/weak` → `gray.500` | `#7c7c7c` | ✗ |
| `--line-soft` | `#eef0f4` | `xds-color-border/default` → `gray.200` | `#ededed` | ✗ |
| `--blue-soft` | `#e8f0ff` | `xds-color-background/accent/weaker` → `blue.50` | `#f3f7fe` | ✗ |

Every sidebar colour in the code is a near-miss of the token it should be. Nothing is a coincidence
match either — so a hex-only checker would flag all of them, which is correct here.

## 4. Gaps in the Figma file itself

Worth raising with the design side, not fixable in code:

- The sidebar's own background `#fbfcfd` is **not bound to any variable**. There is a sticky note on
  the page admitting this: *"discussion: color of sidebar will use different color set that we currently
  dont have in Global Color"*.
- The menu hover state binds to `xen/blue/50`, a **primitive**, not a semantic role like
  `xds-color-background/accent/weaker` — even though that role exists and resolves to the same colour.
- The tag text binds to `text/warning`, which is from the `Color-styles` collection, while everything
  else in the component uses `xds-color-text/*`. Two naming schemes in one component.
- `.menu tag` and several wrappers carry a hardcoded white fill with no token.

## 5. What a token-sync check needs

Matching hex is not enough. `xds-color-text/default` and `xds-color-icon/default` both resolve to
`#252525`, so a hex-only check cannot tell which role a value came from. To verify sync properly,
each CSS variable needs a declared mapping to the XenDS token it implements, and the check then
compares three things: the mapping exists, the hex matches, and the element uses the variable rather
than a literal.

A `token-map.json` of the form `{ "--blue": "xds-color-text/accent" }` would give the checker that
third dimension.
