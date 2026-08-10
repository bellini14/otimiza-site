# Home Posts Header Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the posts eyebrow, description, and counter, then move the existing CTA into the header.

**Architecture:** Modify only the presentational composition in `BlogHighlights`. Preserve the carousel and all post card behavior.

**Tech Stack:** React 19, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: Define the simplified header contract

**Files:**
- Modify: `src/components/ui/blog-highlights.test.jsx`

- [ ] Add assertions that the eyebrow, descriptive copy, and range/count are absent.
- [ ] Assert that “Explorar Inspire” remains in the header and links to `/inspire`.
- [ ] Run the focused test and verify it fails for the existing UI.

### Task 2: Simplify the section composition

**Files:**
- Modify: `src/components/ui/blog-highlights.jsx`
- Test: `src/components/ui/blog-highlights.test.jsx`

- [ ] Remove the eyebrow and descriptive copy.
- [ ] Move the existing CTA beside the title with responsive stacking.
- [ ] Remove the footer containing the post count and old CTA.
- [ ] Run the focused test and production build.
