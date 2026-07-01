# Language selector dropdown design

## Goal

Replace the Brazilian flag emoji in the desktop header with crisp SVG artwork based on the supplied references and turn the static language control into a functional two-option dropdown.

## Scope

- Provide inline React SVG components for the circular Brazil and United States icons.
- Show the selected icon and locale code in the existing header control.
- Offer `Brasil — pt-BR` and `United States — en-US` in a dropdown.
- Update the visible selection and persist it in `localStorage`.
- Do not translate content, change routes, or modify application locale behavior.

## Interaction

The control opens and closes on click. Choosing an option updates the trigger, marks the active option, persists the locale, and closes the dropdown. Clicking outside or pressing Escape closes it without changing the selection. The initial selection is the saved supported locale, falling back to `pt-BR`.

The trigger exposes its expanded state and relationship to the menu. Options are keyboard-accessible buttons with an explicit selected state. Flag SVGs are decorative because adjacent text identifies each language.

## Visual treatment

Both flags use circular silhouettes matching the references. The Brazilian icon uses a green field, yellow diamond, blue globe, and white curved band. The United States icon uses clipped red and white stripes with a blue canton and simplified white stars. The dropdown follows the header's translucent light and dark surfaces, rounded corners, border, shadow, spacing, and typography.

## Structure

Keep the feature local to `Header.jsx`: small flag components, a supported-language data array, locale initialization, and the selector component. No general internationalization system is introduced.

## Verification

Component tests cover the default state, opening the menu, selecting `en-US`, persistence, restoration, Escape, and outside-click dismissal. Existing header tests, lint, and production build must continue to pass. A browser check verifies alignment, dropdown placement, both themes, and the supplied visual references.
