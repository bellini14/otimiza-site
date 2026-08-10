# Home Posts Bottom Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase only the bottom spacing of the Home posts section.

**Architecture:** Replace symmetric vertical padding utilities with independent top and bottom padding utilities on `BlogHighlights`.

**Tech Stack:** React 19, Tailwind CSS, Vitest.

---

### Task 1: Adjust section spacing

**Files:**
- Modify: `src/components/ui/blog-highlights.jsx`
- Test: `src/components/ui/blog-highlights.test.jsx`

- [ ] Add a failing assertion for `pt-16 pb-32 sm:pt-24 sm:pb-40`.
- [ ] Replace the symmetric padding classes.
- [ ] Run the focused test and production build.
