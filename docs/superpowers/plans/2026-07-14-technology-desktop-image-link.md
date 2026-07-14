# Technology Desktop Image and Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar mais do lado direito da imagem no desktop e abrir o site da OTMSuite em uma nova aba a partir de “Saiba mais”.

**Architecture:** O componente continuará responsável pela imagem e pelo CTA. Uma classe Tailwind responsiva mudará apenas o `object-position` no desktop, e um link HTML externo substituirá a rota interna.

**Tech Stack:** React 19, Tailwind CSS 3, React Testing Library, Vitest.

---

### Task 1: Enquadramento desktop e link externo

**Files:**
- Modify: `src/components/TechnologySection.test.jsx`
- Modify: `src/components/TechnologySection.jsx`

- [ ] **Step 1: Escrever os testes de regressão**

Verificar que “Saiba mais” tem `href="https://otmsuite.com"`, `target="_blank"` e `rel="noopener noreferrer"`; verificar também que a imagem possui `lg:object-right` e não possui `object-right` sem prefixo, mantendo o foco central padrão no mobile.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npm test -- src/components/TechnologySection.test.jsx`
Expected: FAIL porque o CTA ainda aponta para `/tecnologia` e a imagem não possui foco à direita no desktop.

- [ ] **Step 3: Implementar a alteração mínima**

Remover o import não utilizado de `Link`, trocar o CTA por `<a href="https://otmsuite.com" target="_blank" rel="noopener noreferrer">` e adicionar `lg:object-right` à imagem.

- [ ] **Step 4: Executar o teste isolado**

Run: `npm test -- src/components/TechnologySection.test.jsx`
Expected: PASS.

- [ ] **Step 5: Verificar regressões e build**

Run: `npm test`
Expected: PASS.

Run: `npm run lint`
Expected: exit 0.

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 6: Verificar o resultado responsivo localmente**

Abrir a página inicial em uma viewport abaixo de `lg` e outra acima de `lg`. Confirmar que o mobile mantém o enquadramento central existente, que o desktop prioriza o lado direito da imagem e que a máscara/overlay permanece íntegra.
