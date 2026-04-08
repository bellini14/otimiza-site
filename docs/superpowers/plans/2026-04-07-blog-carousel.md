# Blog Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage blog carousel logic so it advances one card at a time, feels smoother, and blocks button clicks during active animation.

**Architecture:** Rebuild `BlogHighlights` around a single horizontal track that always stays mounted. Navigation updates a single visible index and uses an explicit animation lock released from the track transition lifecycle, with a reduced-motion fallback for deterministic behavior.

**Tech Stack:** React 19, Vite, Vitest, Testing Library, Tailwind utility classes

---

### Task 1: Cover the new carousel behavior with tests

**Files:**
- Modify: `src/components/ui/blog-highlights.test.jsx`
- Test: `src/components/ui/blog-highlights.test.jsx`

- [ ] **Step 1: Write the failing test**

Add tests that assert:
- the carousel renders as one persistent track
- next and previous advance one card at a time
- buttons become disabled during animation
- extra clicks during animation do not advance the index again
- buttons disable correctly at the start and end

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/components/ui/blog-highlights.test.jsx`
Expected: FAIL because the current implementation does not expose the new locked-track behavior.

- [ ] **Step 3: Write minimal implementation**

Replace the staged animation model in `src/components/ui/blog-highlights.jsx` with:
- a single `displayIndex`
- a single `isAnimating`
- a persistent track transform
- `transitionend`-driven unlock with fallback for reduced motion

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/components/ui/blog-highlights.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/blog-highlights.jsx src/components/ui/blog-highlights.test.jsx docs/superpowers/plans/2026-04-07-blog-carousel.md
git commit -m "fix: rebuild blog carousel interactions"
```

### Task 2: Verify integration safety

**Files:**
- Modify: `src/components/ui/blog-highlights.jsx`
- Test: `src/pages/Home.test.jsx`

- [ ] **Step 1: Run focused home-page verification**

Run: `npm test -- --run src/pages/Home.test.jsx`
Expected: PASS

- [ ] **Step 2: Run broader verification for touched behavior**

Run: `npm test -- --run src/components/ui/blog-highlights.test.jsx src/pages/Home.test.jsx`
Expected: PASS
