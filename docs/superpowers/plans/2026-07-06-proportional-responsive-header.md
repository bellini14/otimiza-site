# Proportional Responsive Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scale every desktop header element from one shared factor down to the exact 650 px mobile breakpoint.

**Architecture:** Keep the Header component structure and behavior intact. Replace its unrelated CSS interpolation formulas with a shared `--header-scale` custom property, then derive logo, typography, controls, padding, radii, icons, and gaps from their full-size values.

**Tech Stack:** React, Tailwind CSS, plain CSS, Vitest, Testing Library

---

### Task 1: Lock the proportional sizing contract

**Files:**
- Modify: `src/components/Header.test.jsx`
- Test: `src/components/Header.test.jsx`

- [ ] **Step 1: Write the failing test**

Add assertions that the desktop menu surface owns the shared scale hook and that
the logo, navigation links, language selector, and contact button retain the
semantic classes used by the proportional sizing system.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- src/components/Header.test.jsx`

Expected: FAIL because `header-responsive-scale` is not yet present.

- [ ] **Step 3: Add the shared scale hook**

Add `header-responsive-scale` to the desktop menu surface without changing the
component hierarchy or interactions.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- src/components/Header.test.jsx`

Expected: PASS.

### Task 2: Implement one proportional desktop scale

**Files:**
- Modify: `src/index.css:166-246`
- Modify: `src/components/Header.jsx:265-286`
- Test: `src/components/Header.test.jsx`

- [ ] **Step 1: Define the shared desktop factor**

Inside `@media (min-width: 650px)`, set:

```css
.header-responsive-scale {
  --header-scale: clamp(0.75, calc(0.75 + 0.25 * ((100vw - 650px) / 670)), 1);
}
```

Use a CSS expression supported by the project browsers and keep the factor
clamped from `0.75` at 650 px to `1` at 1320 px.

- [ ] **Step 2: Derive every composition size from the factor**

Replace independent `clamp()` declarations with `calc(<full-size> *
var(--header-scale))` for the surface padding, row gaps, primary gap, logo,
links, language control, flag, chevron, and contact control. Set stable
line-height and `flex-shrink: 0` where required to prevent distortion.

- [ ] **Step 3: Remove conflicting fixed utility sizes**

Remove only fixed Tailwind dimensions that override or obscure the CSS sizing
contract. Preserve colors, shadows, transitions, routes, and menu behavior.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- src/components/Header.test.jsx`

Expected: all Header tests pass.

### Task 3: Verify responsive behavior and regressions

**Files:**
- Modify if needed: `src/components/Header.jsx`
- Modify if needed: `src/index.css`
- Test: `src/components/Header.test.jsx`

- [ ] **Step 1: Check representative widths**

Inspect 1440, 1280, 1024, 768, 650, and 649 px. Confirm the desktop composition
is aligned, proportional, unwrapped, and free of overlap through 650 px; confirm
the mobile control is the only navigation variant at 649 px.

- [ ] **Step 2: Run the complete test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: build completes successfully.

- [ ] **Step 4: Review the final diff**

Run: `git diff --check` and inspect the scoped Header changes, preserving all
unrelated user modifications in the dirty worktree.
