# Home Inspire Section Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the Inspire block immediately after the home hero and before the brands block.

**Architecture:** Keep the existing section components unchanged and reorder only their composition in `Home.jsx`. Cover the DOM order with the existing React Testing Library suite.

**Tech Stack:** React, Vitest, React Testing Library

---

### Task 1: Reorder the home sections

**Files:**
- Modify: `src/pages/Home.test.jsx`
- Modify: `src/pages/Home.jsx`

- [ ] **Step 1: Write the failing test**

Update the existing order assertion to verify that the Inspire heading precedes “Marcas que confiam na Otimiza”.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/pages/Home.test.jsx`
Expected: FAIL because the brands section currently precedes Inspire.

- [ ] **Step 3: Write minimal implementation**

Move `<BlogHighlights />` above the brands `<section>` without changing either component.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/pages/Home.test.jsx`
Expected: PASS.

- [ ] **Step 5: Verify the focused diff**

Run: `git diff --check -- src/pages/Home.jsx src/pages/Home.test.jsx`
Expected: no errors.
