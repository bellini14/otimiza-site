# Home Cases Drag Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home Cases carousel directly draggable with velocity-sensitive inertial movement.

**Architecture:** Preserve the existing looped testimonial cards and add continuous pixel displacement on top of their virtual positions. Pointer movement controls displacement one-to-one; release velocity continues through `requestAnimationFrame` with friction, while crossed card intervals normalize back into the existing virtual loop.

**Tech Stack:** React 19, Pointer Events, requestAnimationFrame, Vitest, Testing Library.

---

### Task 1: Add direct dragging and inertia

**Files:**
- Modify: `src/components/ui/stagger-testimonials.jsx`
- Test: `src/components/ui/stagger-testimonials.test.jsx`

- [ ] **Step 1: Write a failing interaction test**

Render the carousel, drag its viewport with Pointer Events, assert direct pixel movement and continued movement after release.

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- src/components/ui/stagger-testimonials.test.jsx`

Expected: FAIL because the carousel has no pointer-driven displacement.

- [ ] **Step 3: Implement minimal drag physics**

Add pointer capture, direct displacement, sampled release velocity, animation-frame friction, and loop normalization when displacement crosses one card interval.

- [ ] **Step 4: Verify component tests**

Run: `npm test -- src/components/ui/stagger-testimonials.test.jsx`

Expected: PASS.

- [ ] **Step 5: Verify build**

Run: `npm run build`

Expected: successful production build.
