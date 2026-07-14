# Nossa Abordagem Closing CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing final “Decidir melhor agora / Por que não?” block into a contact CTA without altering its current desktop composition, while improving its mobile spacing and usability.

**Architecture:** Keep the CTA inside the existing `closing` variant in `NossaAbordagem.jsx`. Add one semantic link to `/contato` and isolate all new presentation in dedicated `nossa-abordagem-closing-*` CSS classes, with mobile-only overrides below 640px. Preserve the existing copy, white background, typography, and desktop scale.

**Tech Stack:** React 19, React Router application routes, Tailwind utilities, project CSS, Vitest, Testing Library.

---

### Task 1: Specify the CTA behavior and responsive contract

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`

- [ ] **Step 1: Write a failing test**

Add assertions that the closing block is a labelled `<section>`, includes a link named “Fale com a Otimiza” with `href="/contato"`, includes a decorative arrow, preserves the two existing text lines, and uses dedicated closing classes. Add `siteCss()`/`cssBlock()` assertions for the desktop baseline and every mobile override listed in Task 2, including focus visibility. This ensures the test fails for both missing markup and missing responsive styles.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- src/pages/NossaAbordagem.test.jsx`

Expected: FAIL because the contact link and dedicated closing classes do not exist yet.

### Task 2: Implement the closing CTA

**Files:**
- Modify: `src/pages/NossaAbordagem.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add the minimal semantic markup**

Add `nossa-abordagem-closing-block` to the enclosing article when `block.variant === 'closing'`. In the article spacing branch, use `py-0 sm:py-20 lg:py-24` for `closing`, retain `py-0` for `quote`, and retain `py-16 sm:py-20 lg:py-24` for other variants. This removes only the narrow-screen outer padding while preserving the existing spacing from 640px upward. Test the closing article for the exact responsive class contract. Replace only the inner closing wrapper with:

```jsx
<section
  className="nossa-abordagem-closing"
  aria-labelledby="nossa-abordagem-closing-title"
  data-testid="nossa-abordagem-closing"
>
  <h2 id="nossa-abordagem-closing-title" className="nossa-abordagem-closing__title font-display">
    {block.title}
  </h2>
  <p className="nossa-abordagem-closing__prompt">{block.content[0]}</p>
  <a className="nossa-abordagem-closing__cta" href="/contato">
    <span>Fale com a Otimiza</span>
    <span className="nossa-abordagem-closing__cta-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  </a>
</section>
```

- [ ] **Step 2: Add isolated presentation styles**

Use these exact desktop values, matching the existing baseline:

- `.nossa-abordagem-closing`: `min-height: 36rem`, `padding: 3.5rem 1.75rem`, white background.
- At `min-width: 640px`, change horizontal padding to `3rem`; at `min-width: 1024px`, to `4rem`.
- Title: `font-size: clamp(4rem, 9vw, 9rem)`, weight `300`, line-height `1`, color `#39424c`.
- Prompt: `margin-top: 2.5rem`, max-width `48rem`, `font-size: clamp(2.2rem, 5vw, 5.8rem)`, weight `300`, line-height `1`, color `#5a6572`.
- CTA: `display: inline-flex`, `align-items: center`, `justify-content: space-between`, `gap: 1rem`, `min-height: 3.5rem`, `margin-top: clamp(2.5rem, 5vw, 4rem)`, `padding: 0.75rem 0.8rem 0.75rem 1.25rem`, `border: 1px solid #39424c`, `border-radius: 1rem`, `background: #39424c`, `color: #ffffff`, `font-size: 1rem`, `font-weight: 500`, `line-height: 1.2`, and no text decoration. Transition `transform 300ms cubic-bezier(0.22, 1, 0.36, 1)`, `background-color 250ms ease`, and `box-shadow 250ms ease`.
- CTA hover: `background: #2f3740`, `transform: translateY(-2px)`, `box-shadow: 0 0.75rem 1.75rem rgb(57 66 76 / 0.18)`.
- CTA focus: `.nossa-abordagem-closing__cta:focus-visible { outline: 2px solid var(--brand-red); outline-offset: 4px; }`.
- Icon: `display: inline-grid`, `width/height: 2rem`, centered content, pill radius, `background: rgb(255 255 255 / 0.12)`. SVG is `1rem` square with `stroke: currentColor`, `stroke-width: 1.8`, round caps/joins, and a `transform 300ms cubic-bezier(0.22, 1, 0.36, 1)` transition. On CTA hover, translate the SVG `0.18rem` on the x-axis.

Under `max-width: 639px`, the JSX `py-0 sm:py-20 lg:py-24` contract neutralizes inherited article spacing without a CSS cascade conflict. Then use:

- `.nossa-abordagem-closing`: `min-height: auto`, `padding: clamp(4.5rem, 18vw, 6.25rem) clamp(1.25rem, 6vw, 1.75rem)`.
- Title: `font-size: clamp(3.25rem, 16vw, 4rem)`, line-height `0.95`.
- Prompt: `margin-top: 1.5rem`, `font-size: clamp(2rem, 11vw, 2.75rem)`, line-height `1.02`.
- CTA: `width: 100%`, `min-height: 3.5rem`, `margin-top: 2.5rem`, justify content between.

The failing test must assert these deterministic values using `cssBlock()` for `.nossa-abordagem-closing`, `__title`, `__prompt`, `__cta`, `__cta:hover`, `__cta:focus-visible`, `__cta-icon`, `__cta-icon svg`, and the hover SVG selector, plus `siteCss()` regular expressions for the 640px, 1024px, and max-639px media rules.

- [ ] **Step 3: Run the focused test to verify it passes**

Run: `npm test -- src/pages/NossaAbordagem.test.jsx`

Expected: PASS.

### Task 3: Verify the integrated result

**Files:**
- Verify only: `src/pages/NossaAbordagem.jsx`
- Verify only: `src/index.css`

- [ ] **Step 1: Run project verification**

Run: `npm run test -- --run`

Run: `npm run build`

Expected: both commands exit with code 0.

- [ ] **Step 2: Inspect desktop and mobile rendering**

Open `/nossa-abordagem`, inspect the closing CTA at desktop and narrow mobile widths, activate the CTA, and confirm navigation to `/contato`.

- [ ] **Step 3: Review the final diff**

Confirm the diff is limited to the plan, CTA test, closing markup, and isolated CTA styles. Do not stage or commit because the workspace contains unrelated user changes.
