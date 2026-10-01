# Class names ↔ XenDS components

A class tells you what it is. `xds-*` means the element implements a design-system component and
should be changed only to match the component; every other prefix is page-specific markup.

| Class | XenDS component | Figma node |
| --- | --- | --- |
| `.xds-button` | Button | `483:1724` |
| `.xds-icon-button`, `.xds-icon-button-copy` | Icon Button | `505:1886` |
| `.xds-tag` | Tag | `55:391` |
| `.xds-tag-plain` | Tag, Color=Neutral, no border | `55:391` |
| `.xds-dialog`, `.xds-dialog-body`, `.xds-dialog-scrim` | Dialog | `6193:5837` |
| `.xds-drawer`, `.xds-drawer-foot`, `.xds-drawer-scrim` | *no XenDS component* — a local pattern | — |
| `.xds-table` | Table | `5479:32884` |
| `.xds-textarea` | Text Input, Type=Text Area | `3755:7409` |
| `.tabs button[role="tab"]` | .Tab Item | `3253:20660` |

Renamed away from a misleading name:

| Old | New | Why |
| --- | --- | --- |
| `.dv-tab` | `.dv-screen` | It wraps a whole screen. The old name read like the Tab component and was the first thing people misread. |

Prefixes still in use, none of them design-system components: `dv-` (developer area layout),
`try-` (the Try flow), `wh-` (webhooks), `ak-` (API key dialog), `ep-` (endpoints), `cl-` (changelog),
`dev-` (the older Developers page).

`src/design/component-map.json` carries a `codeIndex` from each selector to its component and node id,
and `src/design/variant-map.json` carries the variant names to set when instantiating it.
