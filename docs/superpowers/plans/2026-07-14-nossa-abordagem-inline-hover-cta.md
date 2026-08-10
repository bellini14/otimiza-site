# Nossa Abordagem Inline Hover CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate closing prompt and filled contact button with one underlined editorial link whose visual label animates between “Por que não?” and “Fale com a Otimiza”.

**Architecture:** Keep the existing closing section and route destination, but move both visual labels into one semantic anchor. Use a CSS grid stack and overflow clipping for a reversible, CSS-only vertical transition that mirrors the hero easing without introducing React state.

**Tech Stack:** React 19, CSS, Vitest, Testing Library, Vite.

---

### Task 1: Specify the inline CTA contract

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Test: `src/pages/NossaAbordagem.test.jsx`

- [ ] **Step 1: Replace the old closing CTA test with a failing behavior test**

Use this structure in the existing `turns the closing statement...` test:

```jsx
const closing = screen.getByTestId('nossa-abordagem-closing')
const cta = within(closing).getByRole('link', {
  name: 'Por que não? Fale com a Otimiza',
})
const labels = cta.querySelector('.nossa-abordagem-closing__labels')

expect(cta).toHaveAttribute('href', '/contato')
expect(within(cta).getByText('Por que não?')).toHaveClass('nossa-abordagem-closing__label--idle')
expect(within(cta).getByText('Fale com a Otimiza')).toHaveClass('nossa-abordagem-closing__label--active')
expect(labels).toHaveAttribute('aria-hidden', 'true')
expect(cta.querySelector('.nossa-abordagem-closing__arrow')).toHaveTextContent('→')
expect(cta.querySelector('.nossa-abordagem-closing__arrow')).toHaveAttribute('aria-hidden', 'true')
expect(within(closing).getAllByRole('link')).toHaveLength(1)
expect(within(closing).queryByRole('button')).not.toBeInTheDocument()
expect(closing.querySelector('.nossa-abordagem-closing__prompt')).not.toBeInTheDocument()
```

Replace old filled-button CSS assertions with exact assertions for:

```jsx
expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/display:\s*inline-flex;/)
expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/max-width:\s*100%;/)
expect(cssBlock('.nossa-abordagem-closing__cta')).not.toMatch(/width:\s*100%;/)
expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/padding:\s*0\.2em 0 0\.18em;/)
expect(cssBlock('.nossa-abordagem-closing__cta')).toMatch(/border-bottom:\s*1px solid currentColor;/)
expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/display:\s*grid;/)
expect(cssBlock('.nossa-abordagem-closing__labels')).toMatch(/overflow:\s*hidden;/)
expect(cssBlock('.nossa-abordagem-closing__label')).toMatch(/grid-area:\s*1 \/ 1;/)
expect(cssBlock('.nossa-abordagem-closing__label')).toMatch(/white-space:\s*nowrap;/)
expect(cssBlock('.nossa-abordagem-closing__label')).toMatch(/280ms cubic-bezier\(0\.165,\s*0\.84,\s*0\.44,\s*1\)/)
expect(cssBlock('.nossa-abordagem-closing__label--active')).toMatch(/transform:\s*translateY\(110%\);/)
expect(cssBlock('.nossa-abordagem-closing__cta:hover .nossa-abordagem-closing__label--idle,\n  .nossa-abordagem-closing__cta:focus-visible .nossa-abordagem-closing__label--idle')).toMatch(/translateY\(-110%\)/)
expect(cssBlock('.nossa-abordagem-closing__cta:hover .nossa-abordagem-closing__label--active,\n  .nossa-abordagem-closing__cta:focus-visible .nossa-abordagem-closing__label--active')).toMatch(/translateY\(0\)/)
expect(cssBlock('.nossa-abordagem-closing__cta:focus-visible')).toMatch(/outline:\s*2px solid var\(--brand-red\);/)
expect(cssBlock('.nossa-abordagem-closing__cta:focus-visible')).toMatch(/outline-offset:\s*4px;/)
```

Use these exact `siteCss()` assertions:

```jsx
const css = siteCss()
expect(css).toMatch(/@media\s*\(max-width:\s*639px\)[\s\S]*?\.nossa-abordagem-closing__cta\s*\{[^}]*font-size:\s*clamp\(1\.65rem,\s*8\.2vw,\s*2\.6rem\);[^}]*margin-top:\s*1\.5rem;/)
expect(css).toMatch(/@media\s*\(max-width:\s*20rem\)[\s\S]*?\.nossa-abordagem-closing__labels\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-width:\s*0;[\s\S]*?\.nossa-abordagem-closing__label\s*\{[^}]*white-space:\s*normal;/)
expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.nossa-abordagem-closing__label\s*\{[^}]*transition:\s*none;[^}]*transform:\s*none;[\s\S]*?\.nossa-abordagem-closing__label--active\s*\{[^}]*visibility:\s*hidden;[^}]*opacity:\s*0;[\s\S]*?\.nossa-abordagem-closing__cta:hover \.nossa-abordagem-closing__label--idle,[\s\S]*?\.nossa-abordagem-closing__cta:focus-visible \.nossa-abordagem-closing__label--idle\s*\{[^}]*visibility:\s*hidden;[^}]*opacity:\s*0;[\s\S]*?\.nossa-abordagem-closing__cta:hover \.nossa-abordagem-closing__label--active,[\s\S]*?\.nossa-abordagem-closing__cta:focus-visible \.nossa-abordagem-closing__label--active\s*\{[^}]*visibility:\s*visible;[^}]*opacity:\s*1;/)
expect(css).not.toMatch(/@media\s*\(max-width:\s*(?:639px|20rem)\)[\s\S]*?\.nossa-abordagem-closing__cta\s*\{[^}]*width:\s*100%;/)
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npm test -- src/pages/NossaAbordagem.test.jsx`

Expected: FAIL because the current markup still contains a separate prompt and the filled-button CSS.

### Task 2: Implement the semantic animated link

**Files:**
- Modify: `src/pages/NossaAbordagem.jsx`
- Modify: `src/index.css`
- Test: `src/pages/NossaAbordagem.test.jsx`

- [ ] **Step 1: Replace the prompt and button markup exactly**

```jsx
<a
  className="nossa-abordagem-closing__cta"
  href="/contato"
  aria-label="Por que não? Fale com a Otimiza"
>
  <span className="nossa-abordagem-closing__labels" aria-hidden="true">
    <span className="nossa-abordagem-closing__label nossa-abordagem-closing__label--idle">
      {block.content[0]}
    </span>
    <span className="nossa-abordagem-closing__label nossa-abordagem-closing__label--active">
      Fale com a Otimiza
    </span>
  </span>
  <span className="nossa-abordagem-closing__arrow" aria-hidden="true">→</span>
</a>
```

Remove `.nossa-abordagem-closing__prompt`, the old label span, the icon span, and its SVG.

- [ ] **Step 2: Replace the filled-button CSS with the exact editorial contract**

```css
.nossa-abordagem-closing__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.22em;
  max-width: 100%;
  margin-top: 2.5rem;
  padding: 0.2em 0 0.18em;
  border-bottom: 1px solid currentColor;
  color: #5a6572;
  font-size: clamp(2.2rem, 5vw, 5.8rem);
  font-weight: 300;
  line-height: 1.05;
  text-decoration: none;
}

.nossa-abordagem-closing__labels {
  display: grid;
  min-width: 0;
  overflow: hidden;
}

.nossa-abordagem-closing__label {
  grid-area: 1 / 1;
  white-space: nowrap;
  transition: transform 280ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: transform;
}

.nossa-abordagem-closing__label--active { transform: translateY(110%); }
.nossa-abordagem-closing__cta:hover .nossa-abordagem-closing__label--idle,
.nossa-abordagem-closing__cta:focus-visible .nossa-abordagem-closing__label--idle { transform: translateY(-110%); }
.nossa-abordagem-closing__cta:hover .nossa-abordagem-closing__label--active,
.nossa-abordagem-closing__cta:focus-visible .nossa-abordagem-closing__label--active { transform: translateY(0); }

.nossa-abordagem-closing__arrow { flex: 0 0 auto; font-size: 0.72em; line-height: 1; }
.nossa-abordagem-closing__cta:focus-visible { outline: 2px solid var(--brand-red); outline-offset: 4px; }
```

Add the exact responsive and reduced-motion blocks:

```css
@media (max-width: 639px) {
  .nossa-abordagem-closing__cta {
    margin-top: 1.5rem;
    font-size: clamp(1.65rem, 8.2vw, 2.6rem);
  }
}

@media (max-width: 20rem) {
  .nossa-abordagem-closing__labels {
    flex: 1 1 auto;
    min-width: 0;
  }

  .nossa-abordagem-closing__label {
    white-space: normal;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nossa-abordagem-closing__label {
    transition: none;
    transform: none;
  }

  .nossa-abordagem-closing__label--active { visibility: hidden; opacity: 0; }
  .nossa-abordagem-closing__cta:hover .nossa-abordagem-closing__label--idle,
  .nossa-abordagem-closing__cta:focus-visible .nossa-abordagem-closing__label--idle { visibility: hidden; opacity: 0; }
  .nossa-abordagem-closing__cta:hover .nossa-abordagem-closing__label--active,
  .nossa-abordagem-closing__cta:focus-visible .nossa-abordagem-closing__label--active { visibility: visible; opacity: 1; }
}
```

Do not set `width: 100%` at any breakpoint. The anchor remains inline and its `max-width: 100%` plus the shrinkable label window provides containment. The stacked grid row automatically adopts the taller wrapped label at extreme reflow widths.

- [ ] **Step 3: Run the focused test and confirm GREEN**

Run: `npm test -- src/pages/NossaAbordagem.test.jsx`

Expected: PASS.

- [ ] **Step 4: Do not commit overlapping production files**

`NossaAbordagem.jsx`, `NossaAbordagem.test.jsx`, and `index.css` already contain user changes. Preserve them and do not create a commit that could capture pre-existing work. Review only the task hunks with `git diff --`.

### Task 3: Verify behavior and integration

**Files:**
- Verify: `src/pages/NossaAbordagem.jsx`
- Verify: `src/index.css`
- Verify: `src/pages/NossaAbordagem.test.jsx`

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 3: Inspect desktop, mobile, zoom, and keyboard behavior**

Run `npm run dev -- --host 127.0.0.1`, then open `http://127.0.0.1:5173/nossa-abordagem` at desktop, 390 px, and 320 px. At each width, confirm the link remains content-width, its longer label remains on one line, and hover changes both directions without layout shift. At 200% zoom, confirm wrapping occurs only if needed and text, arrow, and underline remain inside the viewport. Tab from the previous control to the CTA, confirm the visible red outline and 4 px separation from the underline, press Enter, and confirm navigation to `/contato`. Emulate reduced motion and confirm the labels swap instantly without translation.

- [ ] **Step 4: Review the final diff**

Run: `git diff -- src/pages/NossaAbordagem.jsx src/pages/NossaAbordagem.test.jsx src/index.css`

Confirm the task hunks only replace the closing CTA markup/styles/assertions and preserve all unrelated user changes.

- [ ] **Step 5: Commit the standalone plan document only**

```powershell
git add -- docs/superpowers/plans/2026-07-14-nossa-abordagem-inline-hover-cta.md
git commit -m "docs: plan inline hover CTA"
```
