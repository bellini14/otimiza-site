# Nossa Abordagem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `/nossa-abordagem` page using only the content from `Apresentação Otimiza.pdf`, with each PDF page represented as one site block.

**Architecture:** Add a focused React page component for the PDF-derived content, route it through `App.jsx`, and enable the existing header nav item. Keep content data colocated in the page to avoid introducing a CMS dependency for a fixed institutional page.

**Tech Stack:** React 19, React Router, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Route and Header Behavior

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Header.jsx`
- Modify: `src/data/sitePages.js`
- Test: `src/components/Header.test.jsx`

- [ ] Add a failing header test that expects `Nossa abordagem` to be an enabled link to `/nossa-abordagem`.
- [ ] Run `npm test -- src/components/Header.test.jsx` and verify the test fails because the link is disabled or points to the old anchor.
- [ ] Create the route import placeholder for `NossaAbordagem` and route `/nossa-abordagem`.
- [ ] Update header/site nav data so `Nossa abordagem` points to `/nossa-abordagem` and is not disabled.
- [ ] Run the header test and verify it passes.

### Task 2: Page Rendering

**Files:**
- Create: `src/pages/NossaAbordagem.jsx`
- Create: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/App.jsx`

- [ ] Add a failing page test that renders `/nossa-abordagem` and asserts there are 13 content blocks.
- [ ] Assert representative PDF-only text is present: `Criar o Atemporal`, `A visão da Otimiza sobre valor`, `Mais de 1.000 clientes atendidos`, and `Decidir melhor agora`.
- [ ] Run `npm test -- src/pages/NossaAbordagem.test.jsx` and verify it fails because the page does not exist.
- [ ] Implement `NossaAbordagem.jsx` with page data for 13 blocks, preserving PDF text only.
- [ ] Use editorial and comparison-panel layouts, with page 11 as a client grid.
- [ ] Run the page test and verify it passes.

### Task 3: Visual Polish and Verification

**Files:**
- Modify: `src/pages/NossaAbordagem.jsx`
- Optionally modify: `src/index.css`

- [ ] Refine responsive spacing, typography, and contrast for desktop and mobile.
- [ ] Run targeted tests for the new page and header.
- [ ] Run `npm run build`.
- [ ] Start or reuse a Vite server and inspect `/nossa-abordagem` in the browser at desktop and mobile sizes.
