# XenDS components — study notes for code → Figma

Purpose: enough detail to **instantiate the real component** when pushing code into Figma, instead
of drawing a new frame that merely looks like it.

Three files carry the data:

| File | What it holds |
| --- | --- |
| `src/design/component-map.json` | Node id and page for every component, plus a `codeIndex` from CSS selector → component |
| `src/design/variant-map.json` | Exact property names, valid options, defaults, code aliases, and the measured spec |
| `src/design/token-map.json` | Legacy CSS variable → XenDS token, for the colour side |

## How to instantiate

1. Find the component in `component-map.json` → node id.
2. Find it in `variant-map.json` → translate this codebase's values through `code_aliases`.
3. Check the combination exists under `properties`; fill anything unset from `defaults`.
4. `figma_instantiate_component`, then `figma_set_instance_properties` with the names **verbatim**.
5. Missing from both files → `figma_analyze_component_set`, then add it.

Property names are case-sensitive, and non-variant properties (TEXT, BOOLEAN, INSTANCE_SWAP) carry
a `#id` suffix — `Text#4047:5`, not `Text`. Without the suffix the call fails silently.

## The casing trap

The file is not internally consistent about booleans. Reading the options before every call is not
optional:

| Component | Property | Options |
| --- | --- | --- |
| Tabs.item | `Active?` | `false` / `true` — lowercase |
| PageHeader | `Back button` | `false` / `true` — lowercase |
| Menu.parent | `Selected state` | `False` / `True` — capitalised |
| Tag | `Has Icon` | `True` / `False` — capitalised |
| Toggle | `Use label?` | `Yes` / `No` |
| Checkbox | `Selection` | `Checked` / `Unchecked` / `Indeterminate` |
| Accordion | `Hovered?` | `false` only — the true variant was never built |

## What each component is, measured

| Component | Id | Variants | Spec highlights |
| --- | --- | --- | --- |
| Button | `483:1724` | 234 | Medium 40h pad 12; Small 32h pad 8/12; radius 4; label 14/16 and 12/16 Medium |
| IconButton | `505:1886` | 72 | Regular 40×40, Small 32×32 |
| Menu.parent | `1332:5284` | 8 | 32h, pad 8/4/8/12, radius 4, label 12/16; selected bar 4×16 `background/accent/default` |
| Menu.child | `1332:5353` | 12 | adds `Position` First/Middle/Last |
| Tag | `55:391` | 18 | 20h, pad 2/4, radius 4, gap 4, text 12/16 Medium |
| Badge | `55:204` | 4 | 16h, radius 999, `background/critical/default`, count 10/12 Semi Bold |
| TextInput | `3755:7179` | 10 | 40h, radius 4, border `border/default`, text 14/16, placeholder `text/weak` |
| Checkbox | `186:529` | 14 | 16×16, radius 2, checked `background/accent/default` |
| Toggle | `264:466` | 12 | track 36×24 |
| Tabs.item | `3253:20660` | 4 | 40h, gap 8, rest label `text/weak` |
| PageHeader | `3253:20681` | 4 | 88h, padding-top 32 |
| Dialog | `6193:5837` | 10 | radius 8, border `border/default`, title 18/24 Semi Bold |
| Dropdown.item | `4235:18556` | 8 | 32h, 248w, text 12/16 |
| AlertCallout | `2727:636` | 12 | pad 12, radius 4 |
| Accordion | `7914:5270` | 2 | header 52h, title 14/20 Semi Bold |
| Tooltip | `7760:8776` | 1 | 32h, pad 8/12, radius 4, `background/inverse` |
| Breadcrumbs | `2447:3982` | 4 | 24h, gap 4, links `text/accent` |
| SegmentedControl | `8983:1636` | 1 | 44h, pad 2, radius 4, `background/weak` |
| Avatar | `103:631` | 30 | xs 32 → xl 128, circular, 2px `border/subtle` ring |
| Table | `5479:32884` | 4 | Rows are a variant (`0 / 1 / 5 / 10`); columns and headers are INSTANCE_SWAP slots |

## Table is the awkward one

Table does not take arbitrary rows. `# of Row` is a variant with four options, and each column is an
INSTANCE_SWAP slot (`Column 1#5479:9` … `Column 10#5479:0`, `Header 1#5514:0` … `Header 10#5514:27`).
Pushing a table from code means swapping in the cell components, not drawing cells:

- `.01 TEXT` `5484:32728` — Text only / with Icon / with Logo / with Avatar
- `.02 ASSET` `5484:32908` — Icon / Button / Icon Button / Tag / Input / Toggle
- `.01 HEADER` `5492:33061` — Alignment, Can Sort
- `.00 SELECTABLE ROW` `5515:35319`

Row count snaps: empty → `0 (Empty State)`, one row → `1`, 2–7 → `5`, 8 or more → `10`. So the Events
table (10 rows) and the Transactions table map cleanly; anything in between is approximated.

## Gaps between this codebase and XenDS

Things the code has that the library does not, which will have to be drawn rather than instantiated:

- **Code blocks** (`.dv-code`, the dark `pre` with a copy button) — no XenDS equivalent.
- **The flow diagram** in Try (`CaseFlow`, `TryDiagram`) — SVG, nothing to map to.
- **The design-system checker** (`src/dstool`) — tooling, deliberately outside the system.
- **`.try-picker`** renders as pills; the nearest XenDS component is Segmented Control, which is a
  different shape. Flagged rather than forced.

And the reverse — library components with no use in this codebase yet: Stepper, Skeleton,
Toggle Card, Date Picker, Time Picker, Filter Chip, Slot, Avatar Group, Empty State, Chart.

## Confidence

Every number above was read from the Figma file through the plugin bridge in this session, from the
component set's **first variant**. Variants that differ from the default (hover, pressed, error)
were only measured for Button, Menu.parent and Tag. The rest record the default variant only, which
is enough to instantiate but not to verify every state.
