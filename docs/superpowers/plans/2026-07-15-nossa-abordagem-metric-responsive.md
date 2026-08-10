# Nossa Abordagem Metric Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir a largura visual do bloco “Desde 1990”, ampliar seu respiro lateral e manter “jobs to be done” como uma unidade indivisível.

**Architecture:** O ajuste permanece no componente existente `NossaAbordagem`, usando apenas utilitários Tailwind nas duas estruturas responsáveis pelo layout: o contêiner métrico e o termo interativo. O teste de componente existente será atualizado antes da implementação para registrar exatamente as novas classes responsivas e prevenir regressões.

**Tech Stack:** React 19, Tailwind CSS 3, Vitest, Testing Library, Vite.

---

### Task 1: Registrar e implementar o layout responsivo

**Files:**
- Modify: `src/pages/NossaAbordagem.test.jsx:331-375`
- Modify: `src/pages/NossaAbordagem.jsx:457-480,1241-1252`

- [ ] **Step 1: Escrever o teste de regressão falhando**

Em `src/pages/NossaAbordagem.test.jsx`, substituir a asserção atual do contêiner métrico:

```jsx
expect(metricShell).toHaveClass('mx-auto', 'max-w-[1320px]', 'min-h-[36rem]', 'px-4', 'sm:px-5', 'lg:px-0')
```

por:

```jsx
expect(metricShell).toHaveClass(
  'mx-auto',
  'max-w-[1180px]',
  'min-h-[36rem]',
  'px-6',
  'sm:px-8',
  'lg:px-10',
)
```

Adicionar após a asserção de `jobsTerm`:

```jsx
expect(jobsTerm).toHaveClass('whitespace-nowrap')
expect(jobsTooltip).toHaveClass('whitespace-normal')
```

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run:

```powershell
npm test -- src/pages/NossaAbordagem.test.jsx
```

Expected: FAIL porque o componente ainda contém `max-w-[1320px] px-4 sm:px-5 lg:px-0`, o termo ainda não contém `whitespace-nowrap` e o tooltip ainda não contém a restauração `whitespace-normal`.

- [ ] **Step 3: Implementar a alteração mínima**

Em `JobsToBeDoneTerm`, alterar a classe do elemento raiz para:

```jsx
className="group/jobs-term relative inline whitespace-nowrap cursor-help"
```

Como `white-space` é herdado, adicionar `whitespace-normal` à lista de classes de `jobs-to-be-done-tooltip` para preservar a quebra normal do texto explicativo:

```jsx
'jobs-to-be-done-tooltip pointer-events-none absolute left-0 top-0 z-30 hidden w-[min(34rem,calc(100vw-2rem))] whitespace-normal ...'
```

No contêiner da variante `metric`, substituir as classes de largura e padding para:

```jsx
<div className="mx-auto flex min-h-[36rem] min-w-0 w-full max-w-[1180px] items-center px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
```

Não alterar tipografia, altura, cores, animação, tooltip, modal ou conteúdo.

- [ ] **Step 4: Executar o teste focado e confirmar sucesso**

Run:

```powershell
npm test -- src/pages/NossaAbordagem.test.jsx
```

Expected: PASS, sem erros ou warnings novos.

- [ ] **Step 5: Executar as verificações do projeto**

Run:

```powershell
npm test
npm run build
```

Expected: ambas as verificações terminam com exit code 0.

- [ ] **Step 6: Validar visualmente em desktop e mobile**

Executar `npm run dev -- --host 127.0.0.1`, abrir a URL informada pelo Vite com o caminho `/nossa-abordagem` e verificar em `1400 × 800` e `390 × 844`:

- desktop: o conteúdo tem margens laterais maiores que antes;
- ambos: “jobs to be done” nunca quebra internamente;
- mobile: o termo pode migrar inteiro para a linha seguinte e não existe overflow horizontal;
- tooltip/modal e animação continuam funcionais, e o texto do tooltip mantém quebra normal dentro de sua largura.

- [ ] **Step 7: Revisar o diff final**

Run:

```powershell
git diff --check
git diff -- src/pages/NossaAbordagem.jsx src/pages/NossaAbordagem.test.jsx
```

Expected: somente as asserções e classes descritas neste plano, sem erros de whitespace.
