# Home Posts Full-Width Carousel Design

## Goal

Make the Home posts carousel match the Cases carousel layout and interaction while preserving every post card's existing content.

## Design

The section header and footer remain aligned to the site's `1380px` content container. The carousel stage becomes a full-viewport shell using the same full-bleed positioning, edge fades, drag hint, edge spacers, gap, and overflow strategy as the Cases carousel.

The existing post cards, data fetching, links, text, images, and card internals remain unchanged. The shared `useDragCarousel` hook continues to provide dragging, elastic edges, and inertia.

## Verification

Component tests will assert the full-width shell, hidden horizontal overflow, matching edge fades and spacers, and preserved post cards. The focused test suite and production build must pass.
