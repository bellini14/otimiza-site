# Mobile Menu Footer Background Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent page-specific footer backgrounds from painting the language row inside the mobile menu.

**Architecture:** Give the main site footer an explicit `site-footer` contract and target that class from route-specific CSS. Keep the menu's semantic footer unchanged, and lock the selector boundary with component and stylesheet regression tests.

**Tech Stack:** React 19, Tailwind CSS 3, Vitest, Testing Library

---

### Task 1: Add regression coverage for the footer selector boundary

**Files:**
- Modify: `src/components/Footer.test.jsx`
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/pages/OQueFazemos.test.jsx`

- [ ] **Step 1: Write the failing tests**

Add an assertion that the rendered main content-info element has `site-footer`. Update the route stylesheet assertions to require `html.nossa-abordagem-white-background .site-footer` and `html.oquefazemos-sticky-scroll .site-footer`, and explicitly reject the corresponding generic `footer` selectors.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/Footer.test.jsx src/pages/NossaAbordagem.test.jsx src/pages/OQueFazemos.test.jsx`

Expected: FAIL because `site-footer` is absent and the CSS still targets generic `footer` elements.

### Task 2: Scope route styling to the main footer

**Files:**
- Modify: `src/components/Footer.jsx:75`
- Modify: `src/index.css:988-995`

- [ ] **Step 1: Add the main-footer class**

Add `site-footer` to the class list of the root `<footer>` in `Footer.jsx`.

- [ ] **Step 2: Narrow both route selectors**

Change the selectors to:

```css
html.nossa-abordagem-white-background .site-footer { ... }
html.oquefazemos-sticky-scroll .site-footer { ... }
```

- [ ] **Step 3: Run the focused tests**

Run: `npm test -- src/components/Footer.test.jsx src/pages/NossaAbordagem.test.jsx src/pages/OQueFazemos.test.jsx`

Expected: all focused tests PASS.

- [ ] **Step 4: Run complete verification**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: production build and static SEO generation complete with exit code 0.

