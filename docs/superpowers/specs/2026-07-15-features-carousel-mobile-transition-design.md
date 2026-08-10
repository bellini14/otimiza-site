# Features carousel mobile transition design

## Goal

Improve the mobile solution carousel so changing slides never makes the outer card appear to vanish and return. Keep the desktop presentation unchanged.

## Design

- Preserve the existing detail-card shell, border, background, radius, spacing, and desktop behavior.
- Track the `lg` media query in the component. Below `lg`, give the outer `.feature-detail-panel-transition` shell a stable key so React preserves the same shell node between slides. At `lg` and above, retain the current feature-specific shell key and remount behavior.
- Move the feature-specific key to the inner `.feature-detail-transition` wrapper as well. This remounts and animates only the content on mobile while the frame stays mounted; on desktop it remains nested inside the already-remounted shell and does not change the current result.
- Below the `lg` breakpoint, remove the entrance animation from the outer shell. Restore the existing outer-panel animation at `lg` and above with a min-width media query.
- Make the mobile navigation a compact, centered control instead of a full-width bar. Place the previous and next buttons immediately around the slide counter and keep each button at least 44 by 44 pixels.
- Keep the CTA below the navigation and preserve all current carousel wrapping, labels, content, and desktop sidebar controls.

## Accessibility and motion

- Preserve the existing accessible names for previous and next controls.
- Keep touch targets at least 44 pixels square.
- Retain the project's reduced-motion behavior.

## Verification

- Add regression assertions proving the mobile navigation is compact and centered.
- Add regression assertions with controlled `matchMedia` values proving the mobile shell node survives a real slide change while the inner node is replaced, and proving the desktop shell node retains the existing replacement behavior.
- Add CSS regression assertions proving the outer shell has no animation by default and regains the existing animation only at the desktop breakpoint.
- Inspect at least one mobile viewport and one desktop viewport after a real slide change, checking shell stability, arrow-counter-arrow order, CTA placement, and unchanged desktop geometry/sidebar.
- Run the focused component tests, the full test suite, lint, and production build.
