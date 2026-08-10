# Jobs Overlay Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir Jobs to Be Done diretamente sobre o overlay preto mobile, sem painel branco, com tipografia maior e conteúdo centralizado.

**Architecture:** Preservar o portal existente no `document.body` e a separação entre tooltip desktop e modal mobile. Alterar somente o contrato visual mobile em CSS e ampliar o teste existente para impedir a volta da superfície branca.

**Tech Stack:** React 19, CSS responsivo, Vitest, Testing Library e Browser in-app.

---

### Task 1: Remover a superfície branca

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Adicionar asserções de regressão**

No teste `sets the 1990 metric text inside a gray menu-width page shell`, ler `const modalPanelCss = cssBlock('.jobs-to-be-done-modal__panel')` e exigir:

```js
expect(modalPanelCss).toMatch(/background:\s*transparent;/)
expect(modalPanelCss).toMatch(/border:\s*0;/)
expect(modalPanelCss).toMatch(/border-radius:\s*0;/)
expect(modalPanelCss).toMatch(/box-shadow:\s*none;/)
expect(cssBlock('.jobs-to-be-done-modal')).toMatch(/place-items:\s*center;/)
```

- [ ] **Step 2: Confirmar RED**

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: FAIL em `background: transparent` porque o CSS atual usa `#ffffff`.

- [ ] **Step 3: Aplicar o CSS mínimo**

Em `.jobs-to-be-done-modal__panel`, definir:

```css
width: calc(100% - 3rem);
max-width: 34rem;
border: 0;
border-radius: 0;
background: transparent;
padding: 0;
box-shadow: none;
```

Em `.jobs-to-be-done-modal`, alterar `place-items` para `center`.

- [ ] **Step 4: Confirmar GREEN**

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: 13 tests passed.

- [ ] **Step 5: Commit da superfície editorial**

Run: `git add src/index.css src/pages/NossaAbordagem.test.jsx && git commit -m "style: remove white jobs modal panel"`

### Task 2: Refinar tipografia e controles

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Adicionar asserções de tipografia e posição**

Exigir no CSS do título `color: #ffffff`, `font-size: clamp(1.75rem, 7vw, 2rem)` e `line-height: 1.1`. Exigir no corpo `color: rgb(255 255 255 / 0.82)`, `font-size: clamp(1.1rem, 4.8vw, 1.25rem)` e `line-height: 1.55`. Exigir no botão X `position: fixed`, `top: max(1.25rem, env(safe-area-inset-top))` e `right: 1.25rem`.

- [ ] **Step 2: Confirmar RED**

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: FAIL nos valores de cor, fonte e posição atuais.

- [ ] **Step 3: Implementar valores exatos**

Aplicar os valores do Step 1. No X, usar fundo `rgb(255 255 255 / 0.1)`, borda `1px solid rgb(255 255 255 / 0.22)`, cor branca e sombra removida. No painel, usar `gap: 1.25rem`.

- [ ] **Step 4: Confirmar GREEN**

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: 13 tests passed.

- [ ] **Step 5: Commit da tipografia**

Run: `git add src/index.css src/pages/NossaAbordagem.test.jsx && git commit -m "style: refine jobs overlay typography"`

### Task 3: Adaptar telas baixas e fechar por todos os caminhos

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx`
- Modify: `src/index.css`
- Modify: `src/pages/NossaAbordagem.jsx`

- [ ] **Step 1: Adicionar teste da media query de altura**

Exigir em `siteCss()` uma regra `@media (max-width: 767px) and (max-height: 699px)` contendo `.jobs-to-be-done-modal { place-items: start center; padding-top: 5rem; padding-bottom: 2rem; overflow-y: auto; }`.

- [ ] **Step 2: Confirmar RED**

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: FAIL porque a media query ainda não existe.

- [ ] **Step 3: Implementar a media query**

Adicionar exatamente `@media (max-width: 767px) and (max-height: 699px)` com os valores do Step 1 e remover do painel qualquer `max-height` ou `overflow-y` que crie uma segunda área de rolagem.

- [ ] **Step 4: Confirmar GREEN da media query**

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: 13 tests passed.

- [ ] **Step 5: Adicionar RED para clique no fundo real**

Abrir o modal, disparar `pointerDown` no próprio elemento `[data-testid="jobs-to-be-done-modal"]` e exigir que o modal desapareça e que `document.documentElement` não tenha `jobs-to-be-done-modal-open`.

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: FAIL porque `modalRef` ainda contém o overlay inteiro e trata esse clique como interno.

- [ ] **Step 6: Limitar o ref à coluna de conteúdo**

Em `JobsToBeDoneTerm`, renomear `modalRef` para `modalPanelRef`, usar esse ref apenas em `.jobs-to-be-done-modal__panel` e verificar `modalPanelRef.current?.contains(event.target)` em `closeOnOutsideInteraction`. Remover o ref do elemento `.jobs-to-be-done-modal`.

- [ ] **Step 7: Confirmar GREEN e todos os caminhos**

No teste, abrir o modal e confirmar fechamento separadamente por X, `Escape` e `pointerDown(document.body)`, verificando em cada caso a ausência do modal e da classe `jobs-to-be-done-modal-open`.

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Expected: 13 tests passed.

- [ ] **Step 8: Commit das interações e telas baixas**

Run: `git add src/pages/NossaAbordagem.jsx src/index.css src/pages/NossaAbordagem.test.jsx && git commit -m "fix: complete mobile jobs overlay interactions"`

### Task 4: Validação visual e build

**Files:**
- Verify: `src/index.css`
- Verify: `src/pages/NossaAbordagem.jsx`

- [ ] **Step 1: Iniciar Vite e validar 390 x 844 no Browser in-app**

Run: `npm run dev -- --host 127.0.0.1`

Abrir `http://127.0.0.1:<porta>/nossa-abordagem` no Browser in-app, definir viewport `390 × 844`, clicar em `[data-testid="jobs-to-be-done-term"]` e capturar screenshot no resultado da ferramenta. Ler `getComputedStyle` e `getBoundingClientRect` para confirmar overlay `390 × 844`, fundo `rgba(0, 0, 0, 0.8)`, painel transparente, conteúdo centralizado e X com `position: fixed` no topo direito.

- [ ] **Step 2: Validar 390 x 667**

Definir viewport `390 × 667`, reabrir o modal, confirmar `overflow-y: auto`, `padding-top: 80px`, `padding-bottom: 32px`, texto integral acessível por rolagem e nenhuma superfície branca.

- [ ] **Step 3: Validar X, Escape e clique externo**

Executar cada caminho separadamente e confirmar que o modal desaparece e a classe do `html` é removida.

- [ ] **Step 4: Verificação final**

Run: `npx vitest run src/pages/NossaAbordagem.test.jsx --exclude .worktrees/**`

Run: `npm run build`

Run: `git diff --check -- src/pages/NossaAbordagem.jsx src/index.css src/pages/NossaAbordagem.test.jsx`

Expected: todos com exit code 0; build pode manter apenas o aviso conhecido de chunk grande.
