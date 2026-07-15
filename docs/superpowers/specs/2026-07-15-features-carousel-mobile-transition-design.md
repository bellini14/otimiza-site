# Features carousel mobile transition design

## Goal

Improve the mobile solution carousel so changing slides never makes the outer card appear to vanish and return. Keep the desktop presentation unchanged.

## Design

- Preserve the existing detail-card shell, border, background, radius, spacing, and desktop behavior.
- Below the `lg` breakpoint, remove the entrance animation from the outer `.feature-detail-panel-transition` shell.
- Continue animating the keyed internal header and content items with a restrained fade and short movement, so the visual frame stays stable while its contents communicate the slide change.
- Restore the existing outer-panel animation at `lg` and above with a min-width media query.
- Make the mobile navigation a compact, centered control instead of a full-width bar. Place the previous and next buttons immediately around the slide counter and keep each button at least 44 by 44 pixels.
- Keep the CTA below the navigation and preserve all current carousel wrapping, labels, content, and desktop sidebar controls.

## Accessibility and motion

- Preserve the existing accessible names for previous and next controls.
- Keep touch targets at least 44 pixels square.
- Retain the project's reduced-motion behavior.

## Verification

- Add regression assertions proving the mobile navigation is compact and centered.
- Add CSS regression assertions proving the outer shell has no animation by default and regains the existing animation only at the desktop breakpoint.
- Run the focused component tests, the full test suite, lint, and production build.
