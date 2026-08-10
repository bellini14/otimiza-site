# Home Inspire Drag Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the existing Home Inspire carousel the same pointer-drag physics and feedback as the Cases carousel without changing Inspire card content or styling.

**Architecture:** Move the reusable pointer, inertia, elastic-edge, and hint-following behavior into a focused hook. Keep carousel-specific markup and sizing in their current components, then wire both Cases and Inspire to the shared hook.

**Tech Stack:** React 19, Vitest, Testing Library, Tailwind CSS, Pointer Events, requestAnimationFrame

---

### Task 1: Shared drag behavior

**Files:**
- Create: `src/hooks/useDragCarousel.js`
- Create: `src/hooks/useDragCarousel.test.jsx`
- Modify: `src/pages/Cases.jsx`

- [ ] **Step 1: Write a failing hook harness test**

Create a minimal React harness that supplies shell/track dimensions and asserts pointer movement, elastic limits, cursor state, hint position, direction, and inertial release.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/hooks/useDragCarousel.test.jsx`

Expected: FAIL because `useDragCarousel` does not exist.

- [ ] **Step 3: Implement the minimal shared hook**

Move the constants and pointer/requestAnimationFrame behavior from `CasesCarousel` into `useDragCarousel`, returning refs, state, styles, and pointer handlers.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/hooks/useDragCarousel.test.jsx`

Expected: PASS.

- [ ] **Step 5: Wire Cases to the hook**

Replace local drag state in `CasesCarousel` with the hook while preserving the existing DOM, classes, test IDs, and behavior.

- [ ] **Step 6: Run Cases regression tests**

Run: `npm test -- src/pages/Cases.test.jsx`

Expected: PASS.

### Task 2: Inspire drag integration

**Files:**
- Modify: `src/components/ui/blog-highlights.test.jsx`
- Modify: `src/components/ui/blog-highlights.jsx`

- [ ] **Step 1: Write failing Inspire behavior tests**

Assert that the existing post titles and card links remain present; the track uses grab/grabbing cursors; pointer drag changes translation with the Cases response; links do not initiate drag; hint direction and edge fades are present; and existing responsive card width calculations remain.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/components/ui/blog-highlights.test.jsx`

Expected: FAIL because Inspire still uses arrow navigation.

- [ ] **Step 3: Implement minimal Inspire integration**

Use `useDragCarousel` in `BlogHighlights`. Preserve the `ProjectCard` rendering and section content, remove arrow navigation, add the Cases-style hint/fades, and derive the visible counter range from translation.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/components/ui/blog-highlights.test.jsx`

Expected: PASS.

- [ ] **Step 5: Run Home and Cases regression tests**

Run: `npm test -- src/pages/Home.test.jsx src/pages/Cases.test.jsx`

Expected: PASS.

### Task 3: Verification

**Files:**
- Modify only if verification exposes a scoped defect.

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: no new lint errors.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Build production assets**

Run: `npm run build`

Expected: successful Vite build.

- [ ] **Step 4: Verify in browser**

Check desktop and mobile widths. Confirm unchanged Inspire cards/content, direct dragging, vertical touch scrolling, inertia, elastic limits, pointer hint, fades, usable links, and no Cases regression.
