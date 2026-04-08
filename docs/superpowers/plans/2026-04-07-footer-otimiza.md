# Footer Otimiza Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recriar o footer do site com linguagem visual da Otimiza, links internos corretos e contatos ficticios temporarios.

**Architecture:** A mudanca fica concentrada no componente `src/components/Footer.jsx`, que passa a encapsular os dados de navegacao, CTAs, contatos e redes sociais do rodape. Um teste dedicado em `src/components/Footer.test.jsx` cobre o comportamento esperado, enquanto `src/components/Layout.jsx` continua apenas montando o footer ao final da pagina.

**Tech Stack:** React 19, React Router, Tailwind CSS, Vitest, Testing Library, Vite

---

### Task 1: Cobrir o novo footer com teste

**Files:**
- Create: `src/components/Footer.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
expect(screen.getByRole('link', { name: 'Fale com a Otimiza' })).toBeInTheDocument()
expect(screen.getByRole('link', { name: 'Conheca nossos servicos' })).toBeInTheDocument()
expect(screen.getByText(/dados ilustrativos/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Footer.test.jsx`
Expected: FAIL because the current footer only renders a copyright line.

- [ ] **Step 3: Write minimal implementation**

Implementar a nova estrutura do footer em `src/components/Footer.jsx`, com marca, CTAs, navegacao interna, contatos e redes sociais ficticias.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/Footer.test.jsx`
Expected: PASS

### Task 2: Implementar o footer institucional

**Files:**
- Modify: `src/components/Footer.jsx`

- [ ] **Step 1: Add footer content maps**

Criar arrays locais para CTAs, contatos, navegacao e redes sociais, separando claramente links internos e externos.

- [ ] **Step 2: Rebuild the footer layout**

Aplicar uma estrutura com faixa superior decorativa, bloco de marca, acoes, navegacao e informacoes de contato usando a paleta fria do site.

- [ ] **Step 3: Preserve responsive behavior**

Garantir leitura boa no mobile e contraste consistente em tema claro e escuro sem depender do vermelho.

### Task 3: Final verification

**Files:**
- Modify: `src/components/Footer.jsx`
- Create: `src/components/Footer.test.jsx`

- [ ] **Step 1: Run focused footer test**

Run: `npm test -- src/components/Footer.test.jsx`
Expected: PASS

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS
