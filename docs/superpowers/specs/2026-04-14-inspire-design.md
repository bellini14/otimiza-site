# Inspire Design

## Context

The current blog area lives under `Insights e Blog` and uses the same institutional chrome as the rest of the site.
That structure no longer fits the requested experience.
The new area must feel like an editorial product with its own identity, closely inspired by the supplied Medium-like reference, while still running on the site's existing post data.

The user approved these core constraints:

- replace the old blog area with `Inspire`
- create a new top-level route at `/inspire`
- remove the old `/insights-e-blog` route
- migrate post detail routes to `/inspire/:slug`
- use a page-specific menu only inside `Inspire`
- keep the visual direction very close to the reference image
- make the page feel intentionally different from the rest of the site

## Approved Outcome

Build a new editorial surface called `Inspire` that replaces the current `Insights e Blog` page and article route family.

The finished experience should:

- use a dedicated header and page shell for `/inspire` and `/inspire/:slug`
- avoid reusing the institutional header and footer inside the new editorial routes
- render a two-column editorial feed on desktop, closely matching the reference composition
- preserve responsive behavior with the sidebar collapsing below the main feed on smaller screens
- continue using the same post source and fallback data already present in the project
- update all internal blog links to the new `/inspire` route family

## Visual Direction

The target is a faithful reinterpretation of the supplied print, not a loose inspiration.
That means the page should preserve the same visual grammar:

- light editorial canvas
- thin dividers
- compact fixed header
- serif brand mark with sans-serif interface copy
- left feed column with horizontal story cards
- right sidebar with stacked editorial modules
- restrained black, gray, and off-white palette

Small brand-safe adjustments are allowed where needed to avoid a raw clone or to fit the existing content model, but the page should clearly read as "the page from the print, rebuilt inside this project."

## Route and Shell Architecture

### Route changes

Replace the old blog routes with:

- `/inspire`
- `/inspire/:slug`

Remove:

- `/insights-e-blog`
- `/insights-e-blog/:slug`

All internal navigation that currently points to the old blog route family should point to `/inspire`.

### Layout isolation

`Inspire` should not render inside the same chrome as the institutional pages.
The current `Layout` component always injects the default `Header`, spacing, and `Footer`.
That is incompatible with the requested visual separation.

The approved solution is to introduce a dedicated layout shell for the new editorial routes so that:

- the existing site keeps its current header and footer
- `Inspire` uses its own header and body spacing
- article detail pages under `/inspire/:slug` stay visually aligned with the editorial experience

This should be handled at the router level rather than by conditionally mutating the current global header.

## Inspire Landing Page Structure

### Header

The landing page header should closely follow the reference:

- hamburger/menu icon at the far left
- `Inspire` wordmark beside it
- large pill-shaped search field
- compact utility actions on the right

This menu is page-specific and should only exist on editorial routes.
It does not replace the global site navigation elsewhere.

The search field only needs to work as a visual and structural element in this iteration unless an existing search behavior is already trivial to wire.
The priority is visual fidelity and layout rhythm, not adding a new data feature.

### Main feed

The left column is the primary reading surface.
At the top, render tab-like controls in the style of the reference, such as:

- `For you`
- `Featured`

For the first implementation these tabs can be presentational or map to lightweight feed states, but they must look and behave like real navigation controls.

Below the tabs, render a vertical stack of story rows.
Each row should contain:

- author/source metadata
- bold title
- summary/excerpt
- compact meta row with date and engagement-like labels
- small action icons
- thumbnail image aligned to the right

The feed should feel editorial and scan-friendly, not like the current product-card grid.

### Sidebar

The right column should mirror the reference structure with editorial support modules.
Approved modules:

- `Staff Picks`
- recommended topics as rounded chips
- a follow/recommendation block for authors or sources

The content can be derived from the existing posts and their category-like metadata.
This does not need a new CMS model in the first version.

### Responsive behavior

On desktop:

- two columns with a clear vertical divider
- feed on the left
- sidebar on the right

On tablet:

- feed remains primary
- sidebar can narrow or move below depending on breakpoints

On mobile:

- header simplifies
- tabs remain visible
- story rows compress cleanly
- sidebar modules stack below the feed

The page should preserve the clean editorial feel at smaller sizes instead of collapsing into the site's default card layout.

## Data and Content Mapping

The existing post source remains the source of truth.
That includes the Sanity fetch and the local fallback data.

The implementation should continue using lightweight listing fields such as:

- `title`
- `description`
- `imgSrc` or `mainImage`
- `slug`
- `eyebrow`
- `publishedAt`

The routing link field should change to `/inspire/:slug`.

Where the reference shows engagement counts or social-like metadata, the first version may use lightweight derived or placeholder-friendly metadata from existing content, as long as the result feels coherent and deliberate.
The key requirement is matching the visual structure, not inventing a new engagement backend.

## Article Detail Experience

The detail page under `/inspire/:slug` should join the same editorial universe.

At minimum:

- it should use the Inspire-specific shell instead of the institutional one
- breadcrumbs, spacing, typography, and article framing should feel related to the landing page
- links back to the list should point to `/inspire`

The user did not ask for a full redesign of article content rendering beyond route migration, so the focus should stay on shell consistency and route correctness.

## Component Boundaries

The existing `InsightsBlog.jsx` page and supporting presentation pieces were designed for a previous editorial-grid direction.
They should not be stretched to fit this new concept.

Preferred structure:

- a dedicated page component for `Inspire`
- dedicated editorial subcomponents for header, feed list, story row, sidebar modules, and optional tabs
- existing shared data utilities reused where they still help

The current `FeaturedHero`, `FilterBar`, and `ProjectCard` components should not define the main structure of the new page.
Using new local components is preferable to forcing the old card language into a Medium-style layout.

## Navigation Updates

The global site nav still needs an entry point into the editorial area, but only as a destination link.
It should point to `/inspire` and use the new label `Inspire`.

Once the user enters `/inspire`, the page-specific editorial header takes over.

## Testing Scope

Update and add focused tests for the route migration and new shell behavior:

- the app renders `/inspire` successfully
- the old blog route is no longer referenced by navigation
- post detail links target `/inspire/:slug`
- the editorial shell renders instead of the institutional shell on Inspire routes
- the landing page renders the two-column editorial structure
- the detail route still resolves correctly from loaded post data

The tests should protect routing and layout behavior without over-specifying visual minutiae.

## Non-Goals

This redesign does not require:

- a full-text search backend
- new CMS schema fields
- a complete social system for real engagement metrics
- reuse of the institutional footer inside Inspire

The first version should prioritize visual fidelity, route migration, and clean component boundaries over secondary feature depth.
