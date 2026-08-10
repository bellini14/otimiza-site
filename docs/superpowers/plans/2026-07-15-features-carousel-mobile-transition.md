# Features Carousel Mobile Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the solution card shell stable during mobile carousel navigation, animate only its internal content, and center the mobile arrow controls without changing desktop behavior.

**Architecture:** `FeaturesSection` will observe the existing `lg` breakpoint and choose a stable shell key on mobile while retaining the current feature-specific shell key on desktop. The inner content wrapper remains feature-keyed so mobile slide changes animate only the content. CSS disables shell animation by default and restores it at `lg`; the mobile footer stays stacked until `lg`.

**Tech Stack:** React 19, Tailwind CSS utilities, project CSS, Vitest, Testing Library

---

### Task 1: Preserve node identity at the correct breakpoint

**Files:**
- Modify: `src/components/FeaturesSection.test.jsx`
- Modify: `src/components/FeaturesSection.jsx`

- [ ] **Step 1: Add deterministic media-query test helpers**

Add after the existing `originalIntersectionObserver` constant:

```jsx
const originalMatchMedia = window.matchMedia
let desktopMediaQuery

function setDesktopLayout(matches) {
  desktopMediaQuery = {
    matches,
    media: '(min-width: 1024px)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }
  window.matchMedia = vi.fn(() => desktopMediaQuery)
}
```

Call `setDesktopLayout(false)` in the existing `beforeEach`. In `afterEach`, restore `window.matchMedia = originalMatchMedia` in addition to the existing cleanup.

- [ ] **Step 2: Write the failing node-identity tests**

```jsx
it('keeps the mobile shell mounted and replaces only its internal content', () => {
  renderFeaturesSection()
  const shell = document.querySelector('.feature-detail-panel-transition')
  const content = document.querySelector('.feature-detail-transition')

  fireEvent.click(screen.getByRole('button', { name: 'Proxima solucao' }))

  expect(document.querySelector('.feature-detail-panel-transition')).toBe(shell)
  expect(document.querySelector('.feature-detail-transition')).not.toBe(content)
})

it('preserves the existing desktop shell replacement behavior', () => {
  setDesktopLayout(true)
  renderFeaturesSection()
  const shell = document.querySelector('.feature-detail-panel-transition')

  fireEvent.click(screen.getByRole('button', { name: 'Gestão estratégica' }))

  expect(document.querySelector('.feature-detail-panel-transition')).not.toBe(shell)
})

it('removes the desktop media-query listener on unmount', () => {
  const { unmount } = renderFeaturesSection()
  const changeHandler = desktopMediaQuery.addEventListener.mock.calls[0][1]

  unmount()

  expect(desktopMediaQuery.removeEventListener).toHaveBeenCalledWith('change', changeHandler)
})
```

- [ ] **Step 3: Run the focused tests to verify RED**

Run: `npm test -- src/components/FeaturesSection.test.jsx`

Expected: FAIL because the mobile shell is replaced and no media-query listener exists.

- [ ] **Step 4: Add the minimal responsive hook and keys**

Add before `FeaturesSection`:

```jsx
function useDesktopFeaturesLayout() {
  const [isDesktop, setIsDesktop] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  ))

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event) => setIsDesktop(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}
```

Inside `FeaturesSection`, call `const isDesktopLayout = useDesktopFeaturesLayout()`. Change the shell key to:

```jsx
key={isDesktopLayout ? activeFeature.id : 'mobile-feature-detail-shell'}
```

Add the feature key to the immediate inner wrapper:

```jsx
<div key={activeFeature.id} className="feature-detail-transition ...">
```

- [ ] **Step 5: Run focused tests to verify GREEN**

Run: `npm test -- src/components/FeaturesSection.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit responsive identity behavior**

```powershell
git add -- src/components/FeaturesSection.jsx src/components/FeaturesSection.test.jsx
git commit -m "fix: preserve mobile solution card shell"
```

### Task 2: Scope animation and navigation geometry to mobile

**Files:**
- Modify: `src/components/FeaturesSection.test.jsx`
- Modify: `src/components/FeaturesSection.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add ESM-safe CSS fixture setup**

At the top of the test file add:

```jsx
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
```

Then add:

```jsx
const styles = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8')
```

- [ ] **Step 2: Write failing animation-scope test**

```jsx
it('animates the solution shell only from the desktop breakpoint', () => {
  const baseRule = styles.match(/\.feature-detail-panel-transition\s*\{[^}]*\}/)?.[0] || ''
  const desktopRules = styles.match(/@media \(min-width: 1024px\)\s*\{[\s\S]*?\n\s*\}/g)?.join('\n') || ''

  expect(baseRule).toMatch(/animation:\s*none;/)
  expect(desktopRules).toMatch(/\.feature-detail-panel-transition\s*\{[^}]*animation:\s*feature-panel-rise 640ms cubic-bezier\(0\.2, 0\.8, 0\.2, 1\) both;/)
})
```

- [ ] **Step 3: Write failing compact mobile-footer test**

Extend the existing footer-navigation test with:

```jsx
const footer = mobileNavigation.parentElement
const [previousButton, nextButton] = screen.getAllByRole('button', { name: /solucao/i })

expect(footer).toHaveClass('flex-col', 'lg:block')
expect(footer).not.toHaveClass('sm:flex-row')
expect(footer).not.toHaveClass('sm:items-center')
expect(footer).not.toHaveClass('sm:justify-between')
expect(mobileNavigation).toHaveClass('w-fit', 'self-center', 'justify-center', 'gap-2')
expect(previousButton).toHaveClass('h-11', 'w-11')
expect(nextButton).toHaveClass('h-11', 'w-11')
expect(mobileNavigation.nextElementSibling).toBe(document.querySelector('#nossas-solucoes a.btn-primary'))
```

This asserts the CTA remains below the controls across the entire below-`lg` range, including 640–1023 px.

- [ ] **Step 4: Run focused tests to verify RED**

Run: `npm test -- src/components/FeaturesSection.test.jsx`

Expected: FAIL because the base shell still animates, the footer changes to a row at `sm`, and the controls are full-width with 40 px buttons.

- [ ] **Step 5: Implement minimal responsive animation CSS**

Replace the current base rule with:

```css
.feature-detail-panel-transition {
  animation: none;
}
```

Immediately after it add:

```css
@media (min-width: 1024px) {
  .feature-detail-panel-transition {
    animation: feature-panel-rise 640ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
}
```

- [ ] **Step 6: Implement compact stacked mobile footer**

Remove `sm:flex-row sm:items-center sm:justify-between` from the CTA wrapper, retaining `flex flex-col gap-4 lg:block`. Change navigation utilities from `justify-between gap-3` to `w-fit self-center justify-center gap-2`. Change both buttons from `h-10 w-10` to `h-11 w-11`. Do not alter sidebar or `lg+` geometry.

- [ ] **Step 7: Run focused tests to verify GREEN**

Run: `npm test -- src/components/FeaturesSection.test.jsx`

Expected: PASS.

- [ ] **Step 8: Commit mobile motion and controls**

```powershell
git add -- src/components/FeaturesSection.jsx src/components/FeaturesSection.test.jsx src/index.css
git commit -m "fix: refine mobile solution carousel motion"
```

### Task 3: Verify automated and rendered behavior

**Files:**
- Verify: `src/components/FeaturesSection.jsx`
- Verify: `src/components/FeaturesSection.test.jsx`
- Verify: `src/index.css`

- [ ] **Step 1: Run full verification commands**

```powershell
npm test
npm run lint
npm run build
```

Expected: each exits with code 0; Vitest reports no failed tests.

- [ ] **Step 2: Start the local site**

Run from the repository root:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/#nossas-solucoes`.

- [ ] **Step 3: Inspect mobile at 390 × 844**

Click the next and previous arrows. Verify the border/background shell never disappears, only inner content moves/fades, controls appear in previous-arrow / counter / next-arrow order and are centered, each target is 44 px square, and CTA remains below the controls.

- [ ] **Step 4: Inspect desktop at 1440 × 900**

Use the sidebar to change solutions. Verify sidebar visibility, panel geometry, 540 px desktop height constraints, and whole-panel entrance animation match the existing desktop behavior; mobile controls remain hidden.

- [ ] **Step 5: Review the scoped diff**

Run:

```powershell
git diff HEAD~2 -- src/components/FeaturesSection.jsx src/components/FeaturesSection.test.jsx src/index.css
```

Expected: only breakpoint state/keying, below-`lg` footer utilities, responsive shell animation CSS, and regression tests changed.
