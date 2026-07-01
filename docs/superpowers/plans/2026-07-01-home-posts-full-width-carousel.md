# Home Posts Full-Width Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Home posts carousel full-width and visually identical to the Cases carousel without changing post card content.

**Architecture:** Keep section copy and controls inside the existing centered container, but move the carousel stage into a full-bleed viewport shell. Reuse the current drag hook and copy the Cases carousel's fades, edge spacers, spacing, and overflow behavior.

**Tech Stack:** React 19, Tailwind CSS, Pointer Events, Vitest, Testing Library.

---

### Task 1: Specify the full-width carousel contract

**Files:**
- Modify: `src/components/ui/blog-highlights.test.jsx`

- [ ] **Step 1: Add a failing layout regression test**

Assert that the stage uses `w-screen`, full-bleed offsets, and hidden overflow; that it has two edge fades and two edge spacers; and that all existing post cards remain rendered.

- [ ] **Step 2: Run the focused test**

Run: `npm test -- src/components/ui/blog-highlights.test.jsx`

Expected: FAIL because the current stage is constrained inside the centered container and lacks Cases-style fades and spacers.

### Task 2: Match the Cases carousel shell

**Files:**
- Modify: `src/components/ui/blog-highlights.jsx`
- Test: `src/components/ui/blog-highlights.test.jsx`

- [ ] **Step 1: Move the stage outside the centered content container**

Keep the section header and footer aligned while making the stage full-bleed.

- [ ] **Step 2: Copy the Cases shell behavior**

Apply the full-viewport offsets, hidden overflow, two background-matched fades, edge spacers, `gap-8`, and equivalent vertical spacing. Preserve all `ProjectCard` props and content.

- [ ] **Step 3: Run the focused test**

Run: `npm test -- src/components/ui/blog-highlights.test.jsx`

Expected: PASS.

- [ ] **Step 4: Run the Home regression tests**

Run: `npm test -- src/pages/Home.test.jsx src/components/ui/blog-highlights.test.jsx`

Expected: PASS.

- [ ] **Step 5: Build for production**

Run: `npm run build`

Expected: successful production build.
