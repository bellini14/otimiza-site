# O Que Fazemos Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar tipografia, hierarquia, superfícies, animações de scroll e experiência mobile da página `/o-que-fazemos` sem alterar conteúdo, identidade ou funcionamento.

**Architecture:** Manter a estrutura `OQueFazemos`/`ServiceChapter` e a geometria sticky existente. Amortecer o `scrollYProgress` de cada capítulo com Motion `useSpring` e aplicar transformações discretas somente aos wrappers atuais; concentrar todo o refinamento visual e os fallbacks responsivos no bloco CSS específico da página.

**Tech Stack:** React 19, Motion 12, GSAP/SplitText, Lenis, CSS responsivo, Vitest e Testing Library.

---

## Estado do worktree

`src/pages/OQueFazemos.jsx`, `src/pages/OQueFazemos.test.jsx` e `src/index.css` já possuem
alterações locais do usuário. Preservá-las integralmente. Não criar commits de implementação
que capturem essas mudanças preexistentes; o commit da especificação já foi isolado.

## Estrutura de arquivos

- Modify: `src/pages/OQueFazemos.test.jsx` — contratos TDD de motion, tipografia,
  responsividade e reduced motion.
- Modify: `src/pages/OQueFazemos.jsx` — progresso de scroll amortecido e estilos Motion nos
  elementos existentes.
- Modify: `src/index.css` — refinamento visual específico da página, mobile e fallbacks.
- Reference: `docs/superpowers/specs/2026-07-13-o-que-fazemos-visual-refinement-design.md`.

## Preflight obrigatório

- [ ] **Registrar a linha de base das mudanças locais do usuário**

Antes da primeira edição de teste ou produção, inspecionar e manter no contexto da sessão:

```powershell
git diff -- src/pages/OQueFazemos.jsx src/pages/OQueFazemos.test.jsx src/index.css
```

No diff final, conferir explicitamente que os hunks preexistentes de `SplitText`, remoção do
número pequeno e estilos sticky continuam presentes. Não salvar esse baseline em arquivo e
não sobrescrever o índice Git.

### Task 1: Contrato e implementação do motion por capítulo

**Files:**
- Modify: `src/pages/OQueFazemos.test.jsx`
- Modify: `src/pages/OQueFazemos.jsx`

- [ ] **Step 1: Escrever o teste que exige amortecimento e camadas animadas**

Ler o source da página junto com o CSS no topo do teste:

```jsx
const pageSource = readFileSync(resolve(testDir, './OQueFazemos.jsx'), 'utf8')
```

Adicionar um teste que falhe no estado atual:

```jsx
it('smooths each chapter progress and animates only the existing visual layers', () => {
  renderPage()

  expect(pageSource).toMatch(/useSpring\(scrollYProgress,\s*\{/s)
  expect(pageSource).toContain('useReducedMotion')
  expect(pageSource).toMatch(
    /<MotionDiv[^>]*className="oquefazemos-service-chapter__heading"[^>]*style=\{prefersReducedMotion \? undefined : \{ opacity: headingOpacity, y: headingY \}\}[^>]*>/s,
  )
  expect(pageSource).toMatch(
    /<MotionDiv[^>]*className="oquefazemos-service-chapter__content"[^>]*style=\{prefersReducedMotion \? undefined : \{ opacity: contentOpacity, y: contentY \}\}[^>]*>/s,
  )
  expect(pageSource).toMatch(
    /<MotionDiv[^>]*className="oquefazemos-service-chapter__visual"[^>]*style=\{prefersReducedMotion \? undefined : \{ x: visualX, scale: visualScale \}\}[^>]*>/s,
  )
  expect(indexCss).toMatch(
    /\.oquefazemos-service-chapter__(?:heading|content|visual)\s*\{[^}]*will-change:\s*transform,\s*opacity/s,
  )

  expect(screen.getAllByTestId('solution-sticky-section')).toHaveLength(11)
})
```

No teste de conteúdo existente, comparar também os 11 títulos e sua ordem:

```jsx
expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
  'Diagnóstico',
  'Gestão estratégica',
  'Inteligência de negócios',
  'Gestão de Pessoas',
  'Gestão de Processos de Negócio',
  'Gestão integrada da manufatura',
  'Gestão estratégica de custos',
  'Programa de otimização de desempenho (POD)',
  'Tecnologia de negócios',
  'Academia Otimiza de inteligência empresarial',
  'Consultoria on-line (ECN)',
])
```

- [ ] **Step 2: Rodar o teste e confirmar RED**

Run:

```powershell
npm test -- src/pages/OQueFazemos.test.jsx
```

Expected: FAIL porque `useSpring`, `useReducedMotion`, estilos Motion e `will-change` ainda
não existem.

- [ ] **Step 3: Implementar o progresso amortecido**

Atualizar o import:

```jsx
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
```

Dentro de `ServiceChapter`, após `useScroll`, adicionar:

```jsx
const prefersReducedMotion = useReducedMotion()
const smoothProgress = useSpring(scrollYProgress, {
  stiffness: 110,
  damping: 28,
  mass: 0.35,
  restDelta: 0.001,
})

const headingY = useTransform(smoothProgress, [0, 0.16, 0.3, 0.78, 1], [32, 20, 0, 0, -10])
const headingOpacity = useTransform(
  smoothProgress,
  [0, 0.12, 0.26, 0.82, 1],
  [0, 0.42, 1, 1, 0.76],
)
const contentY = useTransform(smoothProgress, [0, 0.18, 0.32, 0.8, 1], [40, 28, 0, 0, -8])
const contentOpacity = useTransform(
  smoothProgress,
  [0, 0.18, 0.32, 0.84, 1],
  [0, 0.2, 1, 1, 0.8],
)
const visualX = useTransform(smoothProgress, [0, 0.18, 0.34], [40, 18, 0])
const visualScale = useTransform(smoothProgress, [0, 0.34], [0.985, 1])
const depthOpacity = useTransform(
  smoothProgress,
  [0, 0.4, 0.72, 1],
  [0, 0.035, 0.18, 0.3],
)
```

O bloco acima substitui a declaração `depthOpacity` existente; não manter duas constantes
com esse nome.

Substituir apenas os três `div` existentes de heading, content e visual por `MotionDiv`,
mantendo classes, filhos, `data-number` e `aria-hidden`. Aplicar:

```jsx
style={prefersReducedMotion ? undefined : { opacity: headingOpacity, y: headingY }}
style={prefersReducedMotion ? undefined : { opacity: contentOpacity, y: contentY }}
style={prefersReducedMotion ? undefined : { x: visualX, scale: visualScale }}
```

No overlay existente, usar:

```jsx
style={prefersReducedMotion ? undefined : { opacity: depthOpacity }}
```

- [ ] **Step 4: Adicionar hints de composição sem alterar layout**

Em `src/index.css`:

```css
.oquefazemos-service-chapter__heading,
.oquefazemos-service-chapter__content,
.oquefazemos-service-chapter__visual {
  will-change: transform, opacity;
}

.oquefazemos-service-chapter__visual {
  transform-origin: 100% 50%;
}
```

- [ ] **Step 5: Rodar o teste e confirmar GREEN**

Run: `npm test -- src/pages/OQueFazemos.test.jsx`

Expected: PASS para o novo contrato de motion e para os contratos existentes.

### Task 2: Tipografia, hierarquia e superfícies editoriais

**Files:**
- Modify: `src/pages/OQueFazemos.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Escrever os contratos tipográficos que falham**

No teste existente `keeps the sticky stack composed as overlapping service chapters`,
substituir as três asserções antigas pelos valores novos, para que o mesmo teste não exija
simultaneamente o contrato anterior:

```jsx
expect(indexCss).toMatch(/\.oquefazemos-page\s*\{[^}]*--oquefazemos-card-y:\s*clamp\(4\.5rem,\s*9svh,\s*6rem\)/s)
expect(indexCss).toMatch(/\.oquefazemos-service-chapter__stack\s*\{[^}]*grid-template-rows:\s*minmax\(clamp\(5\.5rem,\s*12svh,\s*8\.75rem\),\s*auto\)\s*minmax\(0,\s*1fr\)/s)
expect(indexCss).toMatch(/\.oquefazemos-service-chapter__heading h2\s*\{[^}]*font-size:\s*clamp\(2\.35rem,\s*4\.1vw,\s*4\.6rem\)/s)
```

Adicionar um teste de CSS para exigir:

```jsx
it('uses a readable editorial type hierarchy without changing the service content', () => {
  renderPage()

  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(11)
  expect(indexCss).toMatch(/\.oquefazemos-service-chapter__heading\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s)
  expect(indexCss).toMatch(/\.oquefazemos-service-chapter__heading h2\s*\{[^}]*font-size:\s*clamp\(2\.35rem,\s*4\.1vw,\s*4\.6rem\)/s)
  expect(indexCss).toMatch(/\.oquefazemos-service-chapter__intro\s*\{[^}]*font-size:\s*clamp\(1\.25rem,\s*1\.9vw,\s*2\.15rem\)/s)
  expect(indexCss).toMatch(/\.oquefazemos-service-chapter__detail h3\s*\{[^}]*font-size:\s*0\.78rem/s)
  expect(indexCss).toMatch(/\.oquefazemos-service-chapter__detail p\s*\{[^}]*font-size:\s*clamp\(0\.95rem,\s*0\.92vw,\s*1\.05rem\)/s)
  expect(indexCss).toMatch(/\.oquefazemos-service-chapter__cta\s*\{[^}]*font-size:\s*0\.98rem/s)
  expect(indexCss).toMatch(/\.oquefazemos-service-chapter__cta:focus-visible\s*\{/s)
})
```

- [ ] **Step 2: Rodar o teste e confirmar RED**

Run: `npm test -- src/pages/OQueFazemos.test.jsx`

Expected: FAIL nos novos valores de grade, fonte e foco.

- [ ] **Step 3: Refinar hero e entrada do subtítulo**

Aplicar no bloco específico da página:

```css
.oquefazemos-page {
  --oquefazemos-card-y: clamp(4.5rem, 9svh, 6rem);
}

.oquefazemos-hero {
  background:
    radial-gradient(circle at 50% 42%, rgb(255 255 255 / 0.48), transparent 46%),
    #e5e9f1;
}

.oquefazemos-hero__copy {
  max-width: 46rem;
  margin-top: clamp(1.5rem, 3vw, 2.25rem);
  font-size: clamp(1.05rem, 1.25vw, 1.2rem);
  line-height: 1.55;
  text-wrap: pretty;
  animation: oquefazemos-copy-enter 780ms cubic-bezier(0.22, 1, 0.36, 1) 680ms both;
}

@keyframes oquefazemos-copy-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 1.1rem, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
```

- [ ] **Step 4: Refinar painel e hierarquia interna**

Atualizar os seletores existentes com estes valores, sem duplicar regras:

```css
.oquefazemos-service-chapter__panel {
  background:
    radial-gradient(circle at 82% 18%, rgb(255 255 255 / 0.96), transparent 34%),
    linear-gradient(160deg, rgb(255 255 255 / 0.9), rgb(239 239 244 / 0.98)),
    #efeff4;
  box-shadow: 0 -1.75rem 4.5rem -4rem rgb(90 101 114 / 0.58);
}

.oquefazemos-service-chapter__stack {
  grid-template-rows: minmax(clamp(5.5rem, 12svh, 8.75rem), auto) minmax(0, 1fr);
}

.oquefazemos-service-chapter__heading {
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(0.75rem, 1.5vw, 1.5rem);
}

.oquefazemos-service-chapter__heading h2 {
  grid-column: 1 / -1;
  max-width: 62rem;
  font-size: clamp(2.35rem, 4.1vw, 4.6rem);
  font-weight: 500;
  line-height: 0.98;
  letter-spacing: -0.025em;
}

.oquefazemos-service-chapter__content {
  gap: clamp(1.1rem, 1.8vw, 1.55rem);
  padding-top: clamp(1.2rem, 2vw, 1.75rem);
  border-color: rgb(90 101 114 / 0.24);
}

.oquefazemos-service-chapter__intro {
  max-width: 40rem;
  font-size: clamp(1.25rem, 1.9vw, 2.15rem);
  line-height: 1.12;
}

.oquefazemos-service-chapter__capabilities {
  gap: clamp(1.25rem, 2vw, 2rem);
}

.oquefazemos-service-chapter__detail h3 {
  margin-bottom: 0.7rem;
  font-size: 0.78rem;
  letter-spacing: 0.13em;
}

.oquefazemos-service-chapter__detail p {
  font-size: clamp(0.95rem, 0.92vw, 1.05rem);
  line-height: 1.55;
}

.oquefazemos-service-chapter__cta {
  min-height: 2.9rem;
  font-size: 0.98rem;
  transition:
    color 260ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    outline-color 260ms ease;
}

.oquefazemos-service-chapter__cta:hover,
.oquefazemos-service-chapter__cta:focus-visible {
  color: var(--brand-red);
  transform: translateY(-2px);
}

.oquefazemos-service-chapter__cta:focus-visible {
  outline: 2px solid var(--brand-red);
  outline-offset: 0.4rem;
}

.oquefazemos-service-chapter__cta:hover svg,
.oquefazemos-service-chapter__cta:focus-visible svg {
  transform: translate(0.18rem, -0.18rem);
}
```

Refinar o visual existente sem adicionar markup:

```css
.oquefazemos-service-chapter__visual {
  border-left-color: rgb(90 101 114 / 0.24);
  background:
    linear-gradient(135deg, rgb(224 32 32 / 0.14), transparent 44%),
    linear-gradient(180deg, rgb(255 255 255 / 0.58), transparent 72%),
    repeating-linear-gradient(90deg, rgb(90 101 114 / 0.11) 0 1px, transparent 1px 4.8rem);
}

.oquefazemos-service-chapter__visual::after {
  color: rgb(224 32 32 / 0.13);
}

.oquefazemos-service-chapter__depth-overlay {
  background:
    linear-gradient(180deg, rgb(17 24 39 / 0.08), rgb(17 24 39 / 0.44)),
    linear-gradient(90deg, transparent, rgb(90 101 114 / 0.28));
}
```

- [ ] **Step 5: Rodar o teste e confirmar GREEN**

Run: `npm test -- src/pages/OQueFazemos.test.jsx`

Expected: PASS.

### Task 3: Mobile, altura compacta e reduced motion

**Files:**
- Modify: `src/pages/OQueFazemos.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Escrever os contratos responsivos que falham**

Adicionar:

```jsx
it('uses one scroll owner on mobile and a linear fallback for compact heights', () => {
  expect(indexCss).toMatch(
    /@media\s*\(max-width:\s*767px\)[\s\S]*\.oquefazemos-service-chapter__panel\s*\{[^}]*overflow:\s*clip/s,
  )
  expect(indexCss).toMatch(
    /@media\s*\(max-width:\s*767px\)\s*and\s*\(max-height:\s*699px\)[\s\S]*\.oquefazemos-service-chapter\s*\{[^}]*min-height:\s*auto\s*!important/s,
  )
  expect(indexCss).toMatch(
    /@media\s*\(max-width:\s*767px\)\s*and\s*\(max-height:\s*699px\)[\s\S]*\.oquefazemos-service-chapter__panel\s*\{[^}]*position:\s*relative\s*!important/s,
  )
  expect(indexCss).toMatch(
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.oquefazemos-page \.split-char[\s\S]*transform:\s*none\s*!important/s,
  )
})
```

- [ ] **Step 2: Rodar o teste e confirmar RED**

Run: `npm test -- src/pages/OQueFazemos.test.jsx`

Expected: FAIL porque o painel ainda usa `overflow-y: auto`, não existe fallback de 699 px e
os caracteres do título ainda não são neutralizados.

- [ ] **Step 3: Refinar o breakpoint mobile padrão**

Primeiro, dentro do `@media (max-width: 1024px)` existente, eliminar a linha vazia também
no tablet:

```css
.oquefazemos-service-chapter__heading {
  grid-template-columns: minmax(0, 1fr);
}

.oquefazemos-service-chapter__heading h2 {
  grid-row: 1;
}
```

Dentro de `@media (max-width: 767px)`, aplicar:

```css
.oquefazemos-page {
  --oquefazemos-card-y: clamp(3.5rem, 8.5svh, 4.5rem);
}

.oquefazemos-hero__copy {
  max-width: 31rem;
  margin-top: 1.5rem;
  font-size: clamp(1rem, 4.4vw, 1.1rem);
  line-height: 1.55;
}

.oquefazemos-service-chapter__panel {
  overflow: clip;
}

.oquefazemos-service-chapter__stack {
  gap: clamp(1rem, 2.4svh, 1.35rem);
}

.oquefazemos-service-chapter__heading h2 {
  grid-row: 1;
  font-size: clamp(1.95rem, 8.7vw, 2.8rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
}

.oquefazemos-service-chapter__content {
  gap: 0.9rem;
  padding-top: 1rem;
}

.oquefazemos-service-chapter__intro {
  font-size: clamp(1.08rem, 4.9vw, 1.45rem);
  line-height: 1.15;
}

.oquefazemos-service-chapter__capabilities {
  gap: 0.9rem;
}

.oquefazemos-service-chapter__detail h3 {
  margin-bottom: 0.45rem;
  font-size: 0.75rem;
}

.oquefazemos-service-chapter__detail p {
  font-size: 0.92rem;
  line-height: 1.52;
}

.oquefazemos-service-chapter__cta {
  min-height: 2.65rem;
  font-size: 0.92rem;
}
```

- [ ] **Step 4: Garantir o limite estreito de 320 × 700**

Adicionar antes do fallback de 699 px:

```css
@media (max-width: 360px) and (min-height: 700px) and (max-height: 760px) {
  .oquefazemos-page {
    --oquefazemos-card-y: 2.75rem;
  }

  .oquefazemos-service-chapter__heading h2 {
    font-size: clamp(1.75rem, 8vw, 2rem);
  }

  .oquefazemos-service-chapter__content {
    gap: 0.7rem;
  }

  .oquefazemos-service-chapter__intro {
    font-size: 1rem;
  }

  .oquefazemos-service-chapter__capabilities {
    gap: 0.6rem;
  }

  .oquefazemos-service-chapter__detail p,
  .oquefazemos-service-chapter__cta {
    font-size: 0.88rem;
  }
}
```

- [ ] **Step 5: Implementar fallback linear para alturas até 699 px**

```css
@media (max-width: 767px) and (max-height: 699px) {
  .oquefazemos-service-chapter {
    min-height: auto !important;
    margin-top: 0 !important;
  }

  .oquefazemos-service-chapter + .oquefazemos-service-chapter {
    margin-top: 0 !important;
  }

  .oquefazemos-service-chapter__panel,
  .oquefazemos-service-chapter--last .oquefazemos-service-chapter__panel {
    position: relative !important;
    top: auto !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible;
  }

  .oquefazemos-service-chapter__stack {
    height: auto;
    min-height: auto;
    gap: clamp(2.5rem, 10vw, 4rem);
    padding-block: clamp(3.5rem, 12vw, 4.5rem);
  }

  .oquefazemos-service-chapter__content {
    margin-top: clamp(1.5rem, 7vw, 2.5rem);
  }

  .oquefazemos-service-chapter__depth-overlay {
    display: none;
  }
}
```

- [ ] **Step 6: Completar reduced motion**

No `@media (prefers-reduced-motion: reduce)` específico:

```css
.oquefazemos-hero__copy,
.oquefazemos-hero__title,
.oquefazemos-service-chapter__heading,
.oquefazemos-service-chapter__content,
.oquefazemos-service-chapter__visual,
.oquefazemos-service-chapter__cta,
.oquefazemos-service-chapter__cta svg,
.oquefazemos-page .split-char {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  transition: none !important;
}
```

- [ ] **Step 7: Rodar o teste e confirmar GREEN**

Run: `npm test -- src/pages/OQueFazemos.test.jsx`

Expected: PASS.

### Task 4: Verificação funcional e visual

**Files:**
- Verify only; no new files.

- [ ] **Step 1: Rodar a suíte relacionada**

```powershell
npm test -- src/pages/OQueFazemos.test.jsx src/pages/QuemSomos.test.jsx src/components/pageTitleMotion.test.js src/transitions/PageTransition.test.jsx
```

Expected: todos os arquivos e testes passam.

- [ ] **Step 2: Rodar a suíte completa**

```powershell
npm test
```

Expected: zero falhas.

- [ ] **Step 3: Rodar lint e build**

```powershell
npm run lint
npm run build
```

Expected: ambos terminam com exit code 0.

- [ ] **Step 4: Validar visualmente os breakpoints**

Iniciar, se necessário, com:

```powershell
npm run dev -- --host 127.0.0.1 --port 5197
```

Abrir `http://127.0.0.1:5197/o-que-fazemos` no navegador local e testar, nesta ordem:

- 1440 × 900: hero, primeiro capítulo, transição entre capítulos e footer;
- 1024 × 768: campo visual oculto sem linha vazia no heading;
- larguras 771, 770, 768 e 767 px: menu e página sem overflow horizontal;
- 390 × 844: pilha sticky, nenhum scroll interno e CTA visível;
- 320 × 700: pilha sticky, todos os 11 cartões sem conteúdo fora da superfície;
- 360 × 640 e 320 × 699: fallback linear, painéis crescentes e footer acessível;
- `prefers-reduced-motion`: conteúdo linear, título visível e nenhuma transformação.

Critérios mensuráveis em cada viewport:

```text
document.documentElement.scrollWidth <= window.innerWidth
panel.scrollHeight === panel.clientHeight nos painéis sticky
nenhum CTA com bottom > panel bottom nos painéis sticky
nenhum painel usa overflow-y: auto ou scroll
```

- [ ] **Step 5: Revisar o diff final**

```powershell
git diff --check
git diff -- src/pages/OQueFazemos.jsx src/pages/OQueFazemos.test.jsx src/index.css
```

Expected: sem whitespace errors; diff limitado ao escopo e preservando textos, 11 serviços,
números decorativos e links.
