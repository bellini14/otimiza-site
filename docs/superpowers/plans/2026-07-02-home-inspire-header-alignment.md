# Home Inspire Header Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Inspire heading and CTA with the outer edges of the desktop header shell.

**Architecture:** Change only the header row container in `BlogHighlights`; retain responsive padding below the desktop breakpoint and leave the carousel unchanged.

**Tech Stack:** React, Tailwind CSS, Vitest, React Testing Library

---

### Task 1: Align the Inspire header row

**Files:**
- Modify: `src/components/ui/blog-highlights.test.jsx`
- Modify: `src/components/ui/blog-highlights.jsx`

- [ ] Add a failing assertion for the wider desktop container.
- [ ] Run the focused test and confirm the expected failure.
- [ ] Set the container to `max-w-[1455px]` and remove desktop padding with `lg:px-0`.
- [ ] Run the component test suite and verify the diff.
