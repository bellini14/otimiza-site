# Page Title Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the “Nossa Abordagem” and “O Que Fazemos” title sizing and animation to “Quem Somos”, without changing Home or Cases.

**Architecture:** Export one immutable title-animation preset and reuse it in the three internal pages. Keep each page’s alignment, color, text, and special font-weight treatment local, while sharing the responsive size and line-height through one CSS class.

**Tech Stack:** React, GSAP SplitText wrapper, CSS, Vitest, Testing Library.

---

### Task 1: Lock the shared contract with failing tests

**Files:**
- Create: `src/components/pageTitleMotion.js`
- Create: `src/components/pageTitleMotion.test.js`
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/pages/OQueFazemos.test.jsx`

- [ ] Add tests for the canonical animation values and shared sizing class.
- [ ] Run the targeted tests and confirm failure because the preset and class usage do not exist.

### Task 2: Apply the canonical animation

**Files:**
- Modify: `src/pages/QuemSomos.jsx`
- Modify: `src/pages/NossaAbordagem.jsx`
- Modify: `src/pages/OQueFazemos.jsx`
- Create: `src/components/pageTitleMotion.js`

- [ ] Export the canonical `SplitText` properties from `pageTitleMotion.js`.
- [ ] Spread the preset into the three titles.
- [ ] Remove the divergent `35 ms / 0.42 s` values from “Nossa Abordagem”.
- [ ] Run the targeted tests and confirm they pass.

### Task 3: Apply the canonical responsive size

**Files:**
- Modify: `src/index.css`
- Modify: `src/pages/QuemSomos.jsx`
- Modify: `src/pages/NossaAbordagem.jsx`
- Modify: `src/pages/OQueFazemos.jsx`

- [ ] Add a shared class with `clamp(4.35rem, 8.35vw, 7.35rem)` and `line-height: 0.92`.
- [ ] Apply it only to the three in-scope titles.
- [ ] Remove conflicting local size and line-height declarations.
- [ ] Preserve page-specific alignment, width, color, and weight.

### Task 4: Verify

- [ ] Run the page-title and page component tests.
- [ ] Run the full test suite.
- [ ] Run the production build.
- [ ] Inspect the three pages in the browser at desktop and mobile widths.
