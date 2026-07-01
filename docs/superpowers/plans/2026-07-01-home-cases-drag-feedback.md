# Home Cases Drag Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the rebuilt home Cases carousel feel smoother and add the same drag-follow hint used on the Cases page.

**Architecture:** Keep the existing three-copy `scrollLeft` loop. Add a requestAnimationFrame-smoothed cursor hint with direction feedback, and refine card transforms plus inertia constants without adding another navigation path.

**Tech Stack:** React 19, Pointer Events, requestAnimationFrame, Vitest, Testing Library.

---

### Task 1: Drag hint

- [ ] Test hint presence, pointer following, and direction changes.
- [ ] Implement the desktop-only “Arrastar” capsule and cleanup its animation frame.

### Task 2: Card and motion response

- [ ] Test dragging state feedback on the active card.
- [ ] Soften release gain, extend friction, and refine card transform transitions.
- [ ] Run component tests, lint, browser interaction checks, and production build.
