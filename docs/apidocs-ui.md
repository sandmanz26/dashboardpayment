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

## Tidy-up pass

The first cut was built and checked at 1600px. At the width people actually use
it — a ~1000px window with the nav already hidden — it fell apart. What was
wrong, and what fixed it:

**Three columns did not fit.** At 1000px the article column was ~350px, which
broke the `GET` chip across two lines and wrapped the path. No amount of spacing
work fixes that; there simply is not room. The layout now stands a column down
when the window cannot carry it: below 1180px the nav hides, below 820px the Try
it column hides too, and both come back as the window grows. A column the reader
switched themselves is theirs — autofit never touches it again until Reset.

**The payload scrolled sideways out of view.** `white-space: pre` in a 326px
column meant 195px of every line was unreachable. Each line is now a two-column
grid — a fixed gutter for the number, the text in its own column wrapping with
`overflow-wrap: anywhere` — so a long value folds under itself and keeps its
indent. Horizontal overflow is zero at every width.

**The example pane crowded the form above it.** A fixed 320px took two thirds of
a short window. It now defaults to 45% of the column and is clamped to leave the
form at least 180px, re-clamped on every window resize. Dragging the grip marks
the height as the reader's choice and the automatic sizing stops.

**The endpoint bar was 202px of sticky chrome** — a fifth of a short viewport,
because the jump pills wrapped onto three rows. The pills now scroll sideways on
one row with a faded edge, the type is a step smaller, and the description is
dropped below 1200px. The bar is 134px at desktop widths, 90–110px once stuck.

**A stray green rule under the path.** The vendor styles the method box with
`border: 2px solid` *and* `box-shadow: 0 4px #86efac`. The border was already
turned off; the shadow was not, and read as a rule across the bar.

**Loose odds and ends:** the "Show sample inline" button floated on its own above
the field list and is now a toggle beside Expand all / Collapse all; the right
column's 22.5px padding made the example pane stop short of the edge; the
vendor's tree rules are toned to one hairline; and the field rows run on one
rhythm (name/type, description, constraints) at 13px rather than three sizes.

Measured after the pass — endpoint bar height, example pane, form area, and
horizontal overflow in the pane:

| viewport | nav | article | Try it | bar | bar stuck | pane overflow |
|---|---|---|---|---|---|---|
| 1760×1000 | 300 | 1095 | 350 | 134 | 90 | 0 |
| 1440×900 | 300 | 775 | 350 | 134 | 90 | 0 |
| 1280×800 | 300 | 615 | 350 | 134 | 90 | 0 |
| 1120×700 | — | 755 | 350 | 100 | — | 0 |
| 1000×566 | — | 635 | 350 | 100 | — | 0 |
| 760×700 | — | 700 | — | 100 | — | — |
