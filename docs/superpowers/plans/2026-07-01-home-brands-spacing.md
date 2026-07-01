# Home Brands Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase the top and bottom spacing of the Home brands section.

**Architecture:** Update only the section's responsive Tailwind padding utilities.

**Tech Stack:** React 19, Tailwind CSS, Vitest.

---

### Task 1: Increase section spacing

**Files:**
- Modify: `src/pages/Home.jsx`
- Test: `src/pages/Home.test.jsx`

- [ ] Add a failing assertion for `py-24 sm:py-32`.
- [ ] Update the section utilities.
- [ ] Run the focused test and production build.
