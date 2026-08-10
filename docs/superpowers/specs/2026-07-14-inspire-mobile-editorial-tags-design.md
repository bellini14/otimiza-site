# Inspire Mobile, Editorial Filter, and Article Tags Design

## Context

The Inspire feed now has category filters, but its mobile layout can grow wider than the viewport. The no-wrap filter row contributes a large intrinsic width to the feed grid item; the outer shell then clips that overflow, leaving article thumbnails partially outside the visible canvas. The filter row itself also appears cut off.

The requested follow-up adds the missing `Editorial` category and gives each article category label the yellow highlight treatment shown in the supplied reference.

## Approved Outcome

- Add `Editorial` as a functional single-select filter after `Artigos`.
- Keep the filter labels visible in two wrapped rows on narrow screens rather than requiring horizontal scrolling.
- Constrain the feed grid track to the viewport so article text and thumbnails remain fully visible.
- Preserve the right-aligned thumbnail composition on mobile, using a narrower image column and gap where necessary.
- Apply a compact pale-yellow background only to the category label above each feed article.
- Do not apply the yellow treatment to filter controls or sidebar categories.

## Data Contract

The new filter uses separate display and query values:

| Key | Visible label | Sanity `eyebrow` value |
| --- | --- | --- |
| `editorial` | Editorial | Editorial |

Sanity currently contains posts with the exact `Editorial` value. The static fallback assigns the integration-test post to `Editorial`, ensuring the filter remains demonstrable when Sanity is unavailable.

## Responsive Layout

The root fix is containment, not hiding overflow:

- `.inspire-page__grid` uses `minmax(0, 1fr)` for its single mobile column.
- `.inspire-page__feed` has `min-width: 0` and `max-width: 100%` so children cannot expand the page track.
- From 320px through `max-width: 720px`, `.inspire-page__tabs` becomes a deterministic three-column CSS grid, producing exactly two rows for the six filters, and disables horizontal overflow.
- Filter buttons remain keyboard-focusable buttons with the existing active underline. They align to the start of each grid cell and may wrap their own label only when the cell is narrower than the text.
- Mobile article cards use `minmax(0, 1fr)` plus a compact fixed thumbnail column, and the thumbnail link is constrained to its grid area.
- Article content, meta rows, and summaries retain `min-width: 0` so long text cannot force the image off canvas.

No global `overflow: hidden` rule is added as a substitute for proper sizing.

## Article Category Highlight

The existing `.inspire-story__kicker` becomes a content-width label with small inline and block padding and a pale editorial yellow background matching the reference. Typography and ink color remain aligned with the current Inspire system. The treatment has no border radius unless a minimal sub-pixel rendering adjustment is needed.

## Accessibility

Wrapping does not change filter semantics: the controls stay native buttons in the labelled group and continue exposing `aria-pressed`. The visual order and DOM order remain identical. No category text is conveyed by color alone.

## Testing

Automated coverage will verify:

- the six filter labels appear in the required order;
- selecting `Editorial` sends the canonical Sanity category and displays matching posts;
- fallback `Editorial` data exists and filters correctly;
- the mobile CSS constrains the feed/grid width;
- the mobile filter container declares three equal columns and no horizontal scrolling, deterministically producing two rows for the six controls;
- the mobile story track uses a zero-minimum content column and a fully constrained thumbnail;
- the article kicker receives the yellow, content-width treatment;
- existing category, pagination, search, fallback, lint, and build checks remain green.

The rendered layout should be inspected at 320px, 375px, and 720px widths when browser control is available, verifying two filter rows and that every thumbnail's right edge stays inside the main content box. Source-level CSS regression assertions protect the same containment contract in automated tests.

## Non-Goals

This change does not redesign the header, move thumbnails below articles, add a mobile category dropdown, change sidebar tags, or alter desktop article proportions beyond necessary containment safeguards.
