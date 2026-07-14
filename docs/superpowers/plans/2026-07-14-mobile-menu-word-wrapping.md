# Mobile Menu Word Wrapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the mobile menu's per-character animation while allowing line wrapping only between complete words at viewports down to 280 CSS pixels.

**Architecture:** Keep the behavior local to `AnimatedMobileMenuLabel`: tokenize each label into words and whitespace, wrap each word in a semantic styling hook, and retain the original global character index on animated characters. Add one focused CSS rule that makes each word indivisible while leaving actual whitespace outside the word wrapper.

**Tech Stack:** React 19, CSS, Vitest, Testing Library

---

### Task 1: Add the word-boundary regression test

**Files:**
- Modify: `src/components/Header.test.jsx`
- Test: `src/components/Header.test.jsx`

- [ ] **Step 1: Add a failing structural regression test**

Open the mobile menu, locate “Nossa abordagem”, and assert that it contains two `.mobile-menu-link-word` elements with text `Nossa` and `abordagem`. Assert that the whitespace remains outside both wrappers, that the link still contains one `.mobile-menu-link-char` per non-space character, and that the first character of the second word retains original index `6`.

Update the existing “Quem somos” character-count assertion to expect the label's non-space character count because spaces will become plain wrapping opportunities instead of animated character spans.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/components/Header.test.jsx -t "keeps mobile menu words indivisible"`

Expected: FAIL because `.mobile-menu-link-word` does not exist.

### Task 2: Group animated characters into indivisible words

**Files:**
- Modify: `src/components/Header.jsx:25-43`
- Modify: `src/index.css:395-407`
- Test: `src/components/Header.test.jsx`

- [ ] **Step 1: Implement minimal word tokenization**

Split the label with `/(\s+)/`, keep whitespace as text nodes, and render each non-space token inside `<span className="mobile-menu-link-word">`. Render the token's characters with the existing `.mobile-menu-link-char` class and calculate each `--mobile-menu-char-index` from the token's starting offset in the original label.

- [ ] **Step 2: Add the indivisible word style**

Add:

```css
.mobile-menu-link-word {
  display: inline-block;
  white-space: nowrap;
}
```

- [ ] **Step 3: Run the focused test and verify GREEN**

Run: `npm test -- src/components/Header.test.jsx -t "keeps mobile menu words indivisible"`

Expected: PASS.

- [ ] **Step 4: Run all Header tests**

Run: `npm test -- src/components/Header.test.jsx`

Expected: all Header tests pass.

### Task 3: Verify the complete project and responsive behavior

**Files:**
- Verify: `src/components/Header.jsx`
- Verify: `src/components/Header.test.jsx`
- Verify: `src/index.css`

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0 without errors.

- [ ] **Step 3: Build production assets**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 4: Inspect responsive viewports**

Run the local site and open the mobile menu at 280, 320, 360, 375, 390, and 412 px. Confirm that line breaks occur only at spaces, the animated letters remain visible, the controls remain usable, and the document has no horizontal overflow.

- [ ] **Step 5: Review the final diff**

Confirm the implementation touches only the approved menu behavior and does not overwrite unrelated local changes.
