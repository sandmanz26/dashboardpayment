# API reference page — UI changes

`public/apidocs/get-payment.html` is a capture of the Document360 page Xendit
publishes. We never edit that file; everything below is added at runtime from
`public/apidocs/overlay.js` and styled in `public/apidocs/overlay.css`, so the
capture can be refreshed without losing the work.

## What the page was like

The capture renders the 200 response as 42 fields in one flat column, four
levels deep, over roughly 6,800px of scroll. Reading it as a developer, four
things were missing:

- No way to find a field. The only search on the page is the site-wide docs
  search, which does not look inside the schema.
- No context once you scroll. The method, the path and the section heading all
  leave the viewport, so at 3,000px you no longer know where you are.
- No hierarchy inside a field row. The constraint chips (`MIN LENGTH`,
  `EXAMPLE`) were the heaviest thing in the row, louder than the field name.
- Nothing to share. There was no anchor on a field, so pointing a teammate at
  `reference_id` meant describing where to scroll.

## What was added

**Endpoint bar.** `.api-section.api-path` is now sticky under the site header
and holds the method chip, the path with `{payment_id}` marked as a variable, a
copy button for the full request URL, and the jump rail. It compacts
(`.xd-stuck`) once the page scrolls past its resting place.

**Jump rail.** Pills for Security / Header parameters / Path parameters /
Responses, with scroll-spy. Clicking one offsets the scroll by the header plus
the bar's current height so the heading is not hidden underneath.

**Responses toolbar.** The "Responses" heading became a toolbar: a field filter,
a live count, and Expand all / Collapse all. The filter matches field names and
descriptions, highlights every hit in both, auto-expands any object containing a
match, and clears on `Esc`.

**Collapsible objects.** Each `.api-schema-object` gets a header with its name,
type and field count. Nested objects start closed, which takes the 200 response
from ~6,800px to roughly one screen of top-level fields. The vendor's own
duplicate title and its second "Expand All" button are hidden, so there is one
control per job.

**Field rows.** `.api-schema-title` is laid out as a grid — name and type on the
first line, description on the second, constraints on the third — instead of
flex-wrapping differently per row. Constraint chips are demoted to small light
chips, so the field name leads.

**Deep links.** Every field gets `id="field-<name>"` (the identifier is kept
as-is, so the anchor reads `#field-reference_id`). A link button on hover copies
the URL; opening such a URL expands the enclosing objects and flashes the row.

**Response codes** read `200 OK`, `400 Bad request`, `404 Not found`,
`500 Server error` instead of bare numbers.

**Sample payload.** "Close example" used to hide the whole media-type block,
schema included. It now hides only the sample payload and is labelled
"Hide sample" / "Show sample".

## Conventions

Everything we add is prefixed `.xd-`. Sizes follow the XenDS scale the console
uses (spacing 4/8/12/16/24, radius 5/6/10, type 11.5/12/13/13.5/14) so the two
surfaces read as one product, but the docs site keeps its own palette — it is a
different product from the dashboard and is not on the console's colour tokens.

## Known limits

- Only the `get-payment` page is captured, so the improvements are verified on
  that page alone. The selectors are the generic Document360 ones
  (`.api-schema-property`, `.api-schema-object`, `.api-section`), so another
  captured page should pick them up, but that is untested.
- A nested object whose name the capture does not expose falls back to the label
  "object" (the array item under `captures`, for example).
- The filter matches descriptions as well as names, so searching `reference`
  also returns `payment_id`. The match is highlighted in the description to show
  why the row is there.

## Panels: hide/show and resize

The page is three columns — nav, article, Try it — fixed at 25% / fill / 350px
in the capture. They are now adjustable:

- **Switches.** A `Nav · Doc · Try it` group sits at the right of the breadcrumb
  row, so it is reachable from any scroll position. Each toggles its column. The
  last visible column cannot be hidden — there would be nothing left to read.
- **Drag handles.** Both column borders are draggable (nav 200–560px, Try it
  260–720px). The handle is invisible until you approach it, then shows a blue
  rule. Double-click resets that column; with keyboard focus, arrow keys move it
  10px (40px with Shift).
- **Reset.** The ↺ button next to the switches restores all three columns and
  both default widths.
- **Persistence.** Widths and visibility are stored under `xd.layout` in
  localStorage and restored on the next visit.

Two implementation notes worth keeping:

- The vendor's collapse chevron lived inside the nav column, so hiding that
  column took the only way back with it. `buildPanels()` moves the chevron out to
  `.documentation-main` and positions it at `left: var(--xd-lw)`; when the nav is
  hidden it becomes a tab at the window edge.
- The breadcrumb only shrink-wrapped its crumbs, so `margin-left: auto` on the
  switches had nothing to push against. `d360-breadcrumb` is given `flex: 1`.

Below 1024px the vendor has its own narrow-screen behaviour, so the handles and
the chevron are hidden there and the original flex values are restored.

## The pinned example

The problem this solves: the sample payload sat inline in the article, between
the response tabs and the field list. By the time you had scrolled to the
thirtieth field you could no longer see what the response actually looks like,
which is the one thing you are reading the field list to understand.

The sample now lives in a pinned pane at the bottom of the right column. It
stays on screen however far the article scrolls. The inline copy is folded away
by default behind "Show sample inline"; hide the right column and the inline
copy comes back automatically, so the sample is never simply lost.

What makes it more than a parked code block is that the two halves talk to each
other:

- **Hover a field in the article** → its line lights up in the pinned payload and
  the pane scrolls to it. Click the field to pin that link, so the highlight
  survives moving the mouse away. Click again to release.
- **Click a line in the payload** → the article scrolls to that field, expanding
  any collapsed object on the way, and flashes it.

The pane also carries the status it is showing (`200 OK`, and a plain empty
state for the codes that publish no sample), an example picker when the response
ships more than one, a copy button, a collapse chevron, and a grip to drag its
height. Height and collapsed state persist with the rest of the layout.

Payload lines are numbered and lightly tokenised (keys, strings, numbers,
`true`/`false`/`null`) by a small regex in `overlay.js` — the capture ships the
JSON as plain text with no highlighting.

### Limits

- The field↔line link matches on the field name alone. A name that appears at
  two depths (`capture_id` inside `captures`, say) highlights every line that
  uses it, and clicking such a line jumps to the first field with that name.
- Only the 200 response publishes a sample in this capture; 400/404/500 show the
  empty state.
- Long `VALID VALUES` chips (the currency list is every ISO code) are capped at
  92px and scroll, rather than pushing their own field off the screen.
- The `channel_code` description embeds an iframe from `doc-widget.xendit.co`,
  which cannot load offline and rendered as a broken grey box. It is replaced
  with a labelled placeholder that links out.
