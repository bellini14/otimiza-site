# Home Hero Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development to implement this plan task-by-task.

**Goal:** Replace the home hero heading and paragraph with one heading containing the approved copy and bold emphasis.

**Architecture:** Keep the existing hero component and typography classes. Render one accessible `h1`, using the light title class for the base text and the strong title class for the two emphasized phrases.

**Tech Stack:** React, Vitest, Testing Library

---

### Task 1: Replace the hero copy

**Files:**
- Modify: `src/pages/Home.test.jsx`
- Modify: `src/pages/Home.jsx`

- [ ] Update the hero test to require the complete accessible heading, both emphasized phrases, and absence of the old paragraph.
- [ ] Run the focused test and confirm it fails for the missing new copy.
- [ ] Replace the old heading and paragraph with one `h1`.
- [ ] Run the focused test and full build.
