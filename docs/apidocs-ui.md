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
