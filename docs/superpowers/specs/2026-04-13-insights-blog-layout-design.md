# Insights Blog Layout Design

## Context

The current `src/pages/InsightsBlog.jsx` page renders a flat grid of up to 50 posts with equal weight.
This makes the page feel dense, gives no editorial hierarchy, and exposes too many articles at once.
The page also lacks any way to narrow the feed by publication period or topic, even though the Sanity `post` schema already provides `publishedAt` and a single category label through `eyebrow`.

## Approved Behavior

- Rebuild the `Insights e Blog` page around a stronger editorial layout that shows fewer posts at once.
- Show `1` primary featured post and `3` secondary featured posts at the top of the page.
- Add a `mês/ano` filter with immediate updates and a default `Todos os períodos` option.
- Add category chips with multiple selection and immediate updates.
- Keep the feed ordered by `publishedAt desc`.
- Show `10` grid posts initially and reveal more in batches of `10` through `Carregar mais`.
- Recalculate the featured area whenever filters change.
- Reset the visible grid count back to `10` whenever filters change.
- Show a clear empty state with an action to clear filters when no posts match.

## Proposed Design

Replace the current single flat grid with a three-part page structure:

1. an editorial hero area
2. a reactive filter bar
3. a paged grid feed

The editorial hero area will use the current filtered result set, not a separate curated source.
The first filtered post becomes the main feature card.
The next three filtered posts become compact secondary stories beside the main feature.
The remaining filtered posts feed the grid below.

This keeps the page behavior simple:

- one source list from Sanity
- one filtered list derived in the page component
- one presentation split into featured content and grid content

The page becomes more selective without hiding content behind pagination or route changes.

## Data Model and Filtering

The current Sanity model is sufficient for this redesign.
No schema expansion is required for planning or implementation.

Use these fields from each post:

- `title`
- `description`
- `mainImage`
- `slug`
- `eyebrow`
- `publishedAt`

The current page-level fetch should remove the hard `[0...50]` cap.
This redesign is intended to work against the full archive returned by Sanity for the lightweight listing fields above, so filters and `Carregar mais` reflect the whole available set instead of an arbitrary first slice.
If archive scale later makes full fetch impractical, that should be treated as a separate pagination redesign rather than hidden inside this implementation.

Filtering rules:

- `mês/ano` is single-select
- categories are multi-select
- multiple selected categories use `OR` matching
- different filter types combine with `AND`

Examples:

- `Abr 2026` returns only posts published in April 2026
- `Tecnologia` + `Gestão` returns posts whose `eyebrow` matches either selected category
- `Abr 2026` + `Tecnologia` returns only April 2026 posts in category `Tecnologia`

Available month options should be derived from the loaded posts, sorted from newest to oldest, and formatted for `pt-BR`.
Available category options should also be derived from the loaded posts, normalized for stable matching, and displayed with their original labels.

Because `eyebrow` is currently a single string field, multi-select categories do not imply multi-category posts.
The feature only allows users to activate multiple category filters at the same time and include posts that match any selected category.
`Sem categoria` should be exposed as a selectable chip when such posts exist, so legacy content without `eyebrow` remains discoverable.

## Layout Structure

### Header

Keep the current page header structure and title tone, but tighten the transition into the editorial section so the new top layout appears as the core of the page instead of a separate block below an oversized intro.

### Featured Area

Render:

- `1` large primary article card
- `3` smaller secondary article cards

The primary card should carry the strongest visual weight through image size, title scale, and spacing.
The secondary cards should stay compact and readable, with enough information to scan quickly without competing with the primary story.

Responsive behavior:

- large screens: primary feature on the left, three secondary stories stacked on the right
- medium screens: primary feature full width first, secondary stories in a compact grid below
- small screens: primary feature first, then secondary stories stacked vertically

If the filtered result set has fewer than four posts, the featured layout should collapse gracefully:

- `1` post: only the primary feature renders
- `2-4` posts: render only the available secondary items

### Filter Bar

Place the filter bar directly below the featured area so it is visible before the main grid starts.

The filter bar contains:

- a `mês/ano` control with `Todos os períodos`
- category chips with active and inactive states
- an optional compact summary of active filters

Filter changes should update results immediately with no submit button.

### Grid Feed

After removing up to four featured posts from the filtered result set, render the remaining posts in the existing card language using `ProjectCard`.
Show `10` grid posts initially.
Each `Carregar mais` interaction reveals `10` more posts from the already filtered remainder.

If there are no more posts available, hide or disable `Carregar mais`.

## State Behavior

### Loading

While posts are loading, show a page-level loading treatment that preserves layout stability.
It can be a lightweight skeleton or a restrained loader, but it should not flash a large empty gap and then reflow the entire page.

### Empty Results

If no posts match the active filters, replace the featured area and grid with an empty state that includes:

- a short message explaining that no results were found
- a compact summary of the active filters
- a `Limpar filtros` action

### Missing Metadata

Posts without `publishedAt` or `eyebrow` should remain usable instead of silently disappearing.

Fallback rules:

- posts without `publishedAt` stay visible only under `Todos os períodos` and do not generate a month option
- posts without `publishedAt` sort after all dated posts
- posts without `publishedAt` should not occupy featured slots while any dated filtered posts exist
- posts without `eyebrow` can map to `Sem categoria`

This keeps filtering deterministic even when legacy content is incomplete.

## Component Boundaries

`src/pages/InsightsBlog.jsx` should become the page coordinator for:

- fetching posts
- deriving filter options
- holding active filter state
- computing featured and grid subsets
- controlling the visible grid count

The current `ProjectCard` should remain the reusable unit for the grid feed.
The featured section should use a dedicated layout structure instead of overloading `ProjectCard`, because the main feature and compact side stories need a different hierarchy than the standard listing card.

If extracting small local helpers improves clarity, prefer narrowly scoped helpers over growing `InsightsBlog.jsx` into another oversized page file.

## Interaction Model

On initial load:

- fetch the posts
- sort them by newest publication date
- render the first post as primary feature
- render the next three as secondary features
- render the next ten as the initial grid

On month change:

- update the active month
- recompute filtered posts
- recompute featured posts
- reset visible grid count to `10`

On category toggle:

- add or remove the selected category from the active set
- recompute filtered posts immediately
- recompute featured posts
- reset visible grid count to `10`

On `Carregar mais`:

- keep current filters
- increase the visible grid count by `10`

## Testing

Add focused tests for the page behavior that matters to planning:

- renders the editorial layout with one primary feature and three secondary features when enough posts exist
- shows only `10` grid posts initially
- reveals `10` more posts per `Carregar mais`
- derives month options from post dates and filters correctly by selected month
- supports multiple active category chips and matches by `OR`
- combines month and category filters using `AND`
- resets the visible grid count when filters change
- recomputes the featured area from the filtered result set
- renders the empty state and restores content through `Limpar filtros`

This scope is enough to protect the redesigned behavior without over-specifying presentational details.
