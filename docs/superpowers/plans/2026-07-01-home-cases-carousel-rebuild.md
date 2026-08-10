# Home Cases Carousel Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home Cases carousel with a stable infinite carousel navigated exclusively by dragging.

**Architecture:** Render three linear copies of the testimonial set inside one horizontal viewport. Pointer dragging controls `scrollLeft`; crossing a copy boundary silently recenters into the middle copy. Release velocity produces bounded inertia followed by deterministic snapping to the nearest card.

**Tech Stack:** React 19, Pointer Events, requestAnimationFrame, Vitest, Testing Library.

---

### Task 1: Specify the new interaction contract

**Files:**
- Modify: `src/components/ui/stagger-testimonials.test.jsx`

- [ ] Assert that no previous/next buttons exist.
- [ ] Assert direct drag, release inertia, and nearest-card snap.
- [ ] Assert three copies support infinite recentering in both directions.
- [ ] Run the tests and confirm they fail against the current implementation.

### Task 2: Replace the carousel implementation

**Files:**
- Modify: `src/components/ui/stagger-testimonials.jsx`

- [ ] Remove virtual-position, click-navigation, and button-navigation logic.
- [ ] Add a linear three-copy track controlled by pointer drag.
- [ ] Add bounded release inertia and deterministic nearest-card snap.
- [ ] Add silent loop recentering and one active visual card.
- [ ] Run component tests until green.

### Task 3: Verify production behavior

**Files:**
- Test: `src/components/ui/stagger-testimonials.test.jsx`

- [ ] Test mouse dragging in the browser.
- [ ] Test strong drags in both directions.
- [ ] Confirm snapping and infinite continuation.
- [ ] Run `npm run build`.
