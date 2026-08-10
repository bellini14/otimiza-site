# Language Selector Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the header's flag emoji with inline SVG flags and add a persistent, accessible `pt-BR`/`en-US` dropdown without translating the site.

**Architecture:** Keep the feature inside the existing header module, with two decorative SVG components, a fixed language definition array, and a stateful selector component. Persist only the selected locale code in `localStorage`; no routing or internationalization layer is added.

**Tech Stack:** React 19, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Specify language selector behavior

**Files:**
- Modify: `src/components/Header.test.jsx`

- [ ] Add tests that assert the default Brazilian SVG and locale, menu expanded state, both options, `en-US` selection, persistence, restoration, Escape dismissal, and outside-click dismissal.
- [ ] Run `npm test -- src/components/Header.test.jsx` and confirm the new assertions fail against the static selector.

### Task 2: Implement SVG flags and dropdown

**Files:**
- Modify: `src/components/Header.jsx`

- [ ] Add focused `BrazilFlag` and `UnitedStatesFlag` inline SVG components with circular clipping and decorative accessibility semantics.
- [ ] Add the supported-language definitions and safe `localStorage` initializer.
- [ ] Convert `LanguageSelector` to stateful behavior with selected locale, expanded state, option selection, Escape handling, and outside-click handling.
- [ ] Match the existing translucent header styling in light and dark modes and expose appropriate ARIA state.
- [ ] Run `npm test -- src/components/Header.test.jsx` and confirm all header tests pass.

### Task 3: Verify the integrated result

**Files:**
- Modify only if verification reveals a defect: `src/components/Header.jsx`, `src/components/Header.test.jsx`

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Open the site in the in-app browser and verify both flag renderings, alignment, selection, dismissal behavior, and light/dark appearance.
- [ ] Review the diff to ensure unrelated existing workspace changes remain untouched.
