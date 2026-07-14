# Remove Service Numbers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the decorative service numbers from the “O Que Fazemos” cards.

**Architecture:** Keep the sticky-card structure and index-based stacking unchanged. Remove only the visible heading number and the visual element’s numbering attribute.

**Tech Stack:** React, Vitest, Testing Library

---

### Task 1: Remove visible service numbering

**Files:**
- Modify: `src/pages/OQueFazemos.jsx`
- Test: `src/pages/OQueFazemos.test.jsx`

- [ ] Change the numbering test to assert that `01` and `data-number` are absent.
- [ ] Run `npm test -- src/pages/OQueFazemos.test.jsx` and confirm the test fails.
- [ ] Remove the visible number span, `data-number`, and unused formatter.
- [ ] Run the focused test and the production build.
