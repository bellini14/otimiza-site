# Home Posts Header Cleanup Design

## Goal

Simplify the Home posts section by removing secondary metadata and placing its CTA beside the title.

## Design

Remove the “Inspire” eyebrow, the descriptive copy, and the post range/count. Keep the section title on the left and move the existing “Explorar Inspire” CTA into the right side of the header. On smaller screens, the CTA flows below the title. The carousel, cards, links, data, and drag behavior remain unchanged.

## Verification

The component test must confirm the removed elements are absent, the CTA remains linked to `/inspire`, and the carousel contract continues to pass.
