# Cases Mobile Inspire Carousel Design

## Goal

Rebuild the selected cases carousel on the Cases page at mobile widths so it follows the existing Inspire carousel pattern from the Home page while preserving every current case logo, title, description, image, and destination link.

## Scope

- Apply the Inspire carousel layout and interaction pattern below 768px.
- Preserve the existing Cases carousel presentation and behavior from 768px upward.
- Preserve the current case data source, rendering order, card content, and links.
- Do not change the Home Inspire carousel.

## Architecture

`CasesCarousel` will consume the existing shared `useDragCarousel` hook, which already powers the Home Inspire carousel. Below 768px, Cases will enable the same touch-axis locking, scaled touch movement, release physics, and measured-slide snapping used by Inspire. From 768px upward, the hook configuration will reproduce the existing Cases pointer and touch kinetics: direct `0.96` drag response, existing release velocity and friction, and no snap. This prevents the mobile rebuild from changing desktop or large-tablet behavior.

Responsive CSS classes dedicated to the Cases carousel will mirror the Inspire geometry literally at its existing breakpoints. From 0–639px, each slide is the viewport width minus twice the Home inline margin and the edge spacers use that same inline margin. From 640–767px, slides use Inspire's two-column width formula and 12rem edge spacers even though release snapping remains enabled. From 768px upward, Cases returns to its current fixed card widths and current edge spacers.

## Mobile Layout

- The carousel shell clips horizontal overflow like the Home Inspire carousel.
- From 0–639px, each case slide occupies the viewport width minus twice the shared Home inline margin; leading and trailing spacers use that inline margin.
- From 640–767px, slide width and 12rem spacers match the Home Inspire carousel's existing `sm` geometry.
- The track keeps the Inspire gap and horizontal movement model.
- Edge fades and the pointer hint are hidden from 0–639px and become available from 640px upward, exactly matching Inspire. The hint still depends on hover-capable pointer interaction and therefore does not obstruct touch use.
- Existing case cards keep their content hierarchy, colors, logo treatment, and CTA destination, while their width fills the mobile slide.

## Interaction and Accessibility

- Touch gestures use `touch-action: pan-y`, preserving vertical page scrolling.
- The shared hook locks to horizontal movement only after intent is clear and yields to vertical gestures.
- Below 768px, release snaps to the nearest measured case slide. Cases supplies a positive snap step equal to the active slide width plus the existing 32px gap so measured targets are enabled by the hook.
- A reactive viewport-width state updates on resize. Crossing the 768px boundary cancels active inertia, resets translation to the leading edge, and applies the newly active geometry and physics; resizing within one mode clamps translation to the newly measured bounds.
- From 768px upward, touch and pointer gestures retain the current Cases kinetics and never snap.
- Mouse and pen dragging retain grab/grabbing feedback.
- Starting a gesture on a link or other interactive descendant does not initiate dragging.
- Existing semantic articles, image alternatives, headings, and links remain unchanged.

## Data Flow

Sanity continues to supply `caseLogos` to `CasesCarousel`. The carousel maps that array without transforming or replacing its content. Only responsive layout metadata and drag configuration change; no case fields or routes are modified.

## Testing

Tests will first establish the new mobile contract:

- At a mobile viewport, the Cases track exposes mobile snap metadata.
- The shell clips overflow and uses the Inspire-aligned mobile geometry.
- Case slides and edge spacers use dedicated responsive classes matching the Inspire pattern.
- Touch dragging preserves vertical scrolling behavior and moves/snaps through the shared hook.
- Existing logo source and alternative text, title, description, item order, and destination link assertions continue to pass.
- Desktop card widths and edge spacing remain unchanged.
- Boundary tests cover 639/640px and 767/768px behavior, including fade and hint visibility rules.
- A resize across 768px resets the offset and selects the correct interaction mode; a resize within a mode clamps it.
- Desktop touch interaction retains the current non-snapping Cases response.

Verification will include the focused Cases tests, relevant shared carousel and Home Inspire tests, the full test suite, lint, a production build, and browser inspection at mobile and desktop widths.
