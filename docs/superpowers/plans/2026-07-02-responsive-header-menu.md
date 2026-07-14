# Responsive Header Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the complete desktop navigation on one line down to 650px while scaling its contents fluidly, then switch to the mobile menu below 650px.

**Architecture:** Add Header-specific semantic classes and a single CSS scaling system based on `clamp()`. Use an exact 650px media query for desktop/mobile visibility instead of Tailwind's 1024px `lg` breakpoint.

**Tech Stack:** React, Tailwind CSS, plain CSS, Vitest, Testing Library

---

### Task 1: Define responsive Header behavior

**Files:**
- Modify: `src/components/Header.test.jsx`
- Modify: `src/components/Header.jsx`
- Modify: `src/index.css`

- [ ] Add a failing test for fluid menu classes, one-line links, and the 650px visibility boundary.
- [ ] Run `npm test -- src/components/Header.test.jsx` and confirm the expected failure.
- [ ] Add Header-specific classes and fluid CSS sizing for logo, navigation links, language selector, contact button, gaps, and menu surface.
- [ ] Run the focused Header tests.
- [ ] Run the complete test suite and production build.
