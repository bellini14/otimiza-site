# Menu Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ampliar uniformemente o menu principal em dois incrementos sucessivos de 5% sem alterar seus valores de margem, preenchimento ou espaçamento.

**Architecture:** Aplicar `zoom: 1.1025` ao contêiner visual interno do cabeçalho, separando a escala das transformações do elemento `nav` usadas para ocultação durante a rolagem. A escala de layout mantém os SVGs vetoriais nítidos e preserva os limites laterais.

**Tech Stack:** React 19, Tailwind CSS 3, Vitest, Testing Library.

---

### Task 1: Aplicar escala uniforme ao menu

**Files:**
- Modify: `src/components/Header.test.jsx`
- Modify: `src/components/Header.jsx`

- [ ] **Step 1: Write the failing test**

Adicionar ao teste do cabeçalho:

```jsx
it('scales the complete menu by two successive five-percent increases without rasterizing SVGs', () => {
  renderHeader()

  const menuSurface = screen.getByTestId('main-menu-surface')

  expect(menuSurface).toHaveClass('[zoom:1.1025]', 'w-full')
  expect(menuSurface).not.toHaveClass('transform-gpu')
  expect(menuSurface).toHaveClass('px-5', 'py-3')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Header.test.jsx`

Expected: FAIL porque `main-menu-surface` ainda não existe.

- [ ] **Step 3: Write minimal implementation**

Adicionar `data-testid="main-menu-surface"` ao contêiner visual interno do menu e a classe `[zoom:1.1025]`, preservando todas as classes atuais de espaçamento e removendo a composição GPU do contêiner.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/Header.test.jsx`

Expected: todos os testes de `Header` passam.

- [ ] **Step 5: Verify production build**

Run: `npm run build`

Expected: compilação concluída com código de saída zero.

- [ ] **Step 6: Inspect the rendered header**

Conferir no navegador os estados superior e flutuante em desktop e mobile, garantindo que o menu permanece centralizado e não cria corte horizontal.
