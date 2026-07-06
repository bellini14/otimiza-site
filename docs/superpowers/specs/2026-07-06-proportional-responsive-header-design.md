# Proportional Responsive Header Design

## Goal

Make the existing desktop header scale smoothly and consistently down to the
exact 650 px mobile boundary. Preserve the current visual language, navigation
content, routes, scroll behavior, and mobile menu.

## Current Problem

The header uses independent `clamp()` formulas for the logo, links, controls,
padding, and gaps. Their minimum and maximum values do not share the same
proportion. Near 650 px, the logo becomes disproportionately small while other
elements shrink at different rates, making the header look compressed and
visually inconsistent.

## Responsive Model

Define one header scale custom property for desktop widths. It will interpolate
from the compact value at 650 px to `1` at the header's full-size width. Every
size that contributes to the header composition will derive from that shared
factor:

- logo height;
- navigation font size and link padding;
- primary and secondary gaps;
- language selector dimensions, text, flag, and chevron;
- contact button height, padding, radius, and text;
- menu surface horizontal and vertical padding.

The compact scale must keep navigation readable and the logo recognizable. It
must also leave enough width for all desktop items without wrapping or overlap.
Below 650 px, the desktop navigation remains hidden and the existing mobile
toggle and menu remain active.

## Component Boundaries

`Header.jsx` keeps responsibility for structure, navigation state, scroll
behavior, and accessibility attributes. `index.css` owns the proportional
desktop sizing system and the exact 650 px visibility boundary.

Existing Header-specific class names will be reused. Fixed utility sizes that
conflict with the shared responsive system may be removed or replaced, while
visual colors, surfaces, shadows, and interactions remain unchanged.

## Behavior and Accessibility

- Desktop links remain on one line at every width from 650 px upward.
- Desktop and mobile variants switch at exactly 650 px.
- The active route, language selector, contact link, scroll-hide behavior, and
  mobile dialog continue to work as they do now.
- Text must not shrink to an impractical size merely to force the layout to fit.
- Reduced-motion behavior and keyboard-accessible controls are preserved.

## Verification

Automated tests will verify the semantic responsive classes, exact visibility
boundary contract, retained navigation structure, and menu interactions.

The implementation will also be checked at representative viewport widths:
1440, 1280, 1024, 768, 650, and 649 px. At each desktop width, the logo, links,
language selector, and contact button must remain aligned, proportional,
unwrapped, and free of overlap. At 649 px, only the mobile navigation controls
must be visible.

Finally, run the focused Header test file, the complete test suite, and the
production build.
