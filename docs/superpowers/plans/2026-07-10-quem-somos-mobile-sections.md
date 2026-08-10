# Quem Somos Mobile Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralizar as cinco seções abaixo do hero no mobile, mantendo seus conteúdos textuais alinhados à esquerda e preservando o layout desktop.

**Architecture:** Manter o JSX e os componentes atuais, adicionando classes de escopo por seção e um sistema CSS mobile-first compartilhado com coluna de leitura de 36 rem. Regras em `@media (min-width: 640px)` controlam ações e espaçamento intermediário; regras em `@media (min-width: 1024px)` restauram explicitamente a composição desktop atual.

**Tech Stack:** React, CSS/Tailwind, Vitest, Testing Library, Vite.

---

### Task 1: Baseline e contrato vermelho

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/pages/QuemSomos.test.jsx`
- Inspect: `src/pages/QuemSomos.jsx`
- Inspect: `src/index.css`

- [ ] **Step 1: Registrar mudanças preexistentes**

Run: `git diff -- src/pages/QuemSomos.jsx src/pages/QuemSomos.test.jsx src/index.css`

Preservar a saída integral no registro desta sessão e calcular um identificador não destrutivo com `git diff -- src/pages/QuemSomos.jsx src/pages/QuemSomos.test.jsx src/index.css | git hash-object --stdin`. No fim, revisar somente os trechos identificados pelas novas classes `quem-somos-story`, `quem-somos-pillars`, `quem-somos-strategy`, `quem-somos-mission` e `quem-somos-consultants`; não usar stash/reset/checkout nem reformatar arquivos inteiros.

- [ ] **Step 2: Instalar a dependência de interação realista**

Run: `npm install --save-dev @testing-library/user-event`
Expected: dependência adicionada a `devDependencies` e lockfile atualizado sem alterar outras versões intencionalmente.

- [ ] **Step 3: Registrar desktop antes da alteração**

Run no PowerShell e registrar a saída numérica como `$devServerPid` da sessão: `$devServer = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','--host','127.0.0.1','--port','4174' -WorkingDirectory 'C:\Users\Joao\Desktop\Site otimiza' -WindowStyle Hidden -PassThru; $devServer.Id`

Abrir `http://127.0.0.1:4174/quem-somos` e capturar screenshots nomeadas `before-1024x900` e `before-1440x900` no registro visual da sessão; repetir como `after-*` no final.

- [ ] **Step 4: Adicionar teste CSS/DOM que falha**

Exigir no DOM `quem-somos-story__content`, `quem-somos-pillars__content`, `quem-somos-strategy__content`, `quem-somos-mission__content` e `quem-somos-consultants__content`. Ler `index.css` e verificar:

```js
expect(indexCss).toMatch(/\.quem-somos-mobile-copy\s*\{[\s\S]*width:\s*100%;[\s\S]*max-width:\s*36rem;[\s\S]*margin-inline:\s*auto;[\s\S]*text-align:\s*left/)
expect(indexCss).toMatch(/\.quem-somos-mobile-section\s*\{[\s\S]*padding-block:\s*5rem/)
expect(readMediaBlock(indexCss, '(min-width: 640px)')).toMatch(/\.quem-somos-mobile-section\s*\{[\s\S]*padding-block:\s*6rem/)
expect(readMediaBlock(indexCss, '(min-width: 1024px)')).toMatch(/\.quem-somos-story\s*\{[\s\S]*padding-block:\s*7rem/)
expect(readMediaBlock(indexCss, '(min-width: 1024px)')).toMatch(/\.quem-somos-pillars,[\s\S]*\.quem-somos-strategy,[\s\S]*\.quem-somos-consultants\s*\{[\s\S]*padding-block:\s*9rem/)
expect(readMediaBlock(indexCss, '(min-width: 1024px)')).toMatch(/\.quem-somos-mission\s*\{[\s\S]*padding-block:\s*10rem/)
```

Também exigir `--home-menu-inline: 1.5rem` no root, 2 rem em 640 px e `line-height` mínimo de 1.5 nas classes de textos corridos. Exigir botões de vértices nativos, `aria-pressed`, seleção com Enter/Espaço e painel atualizado.

- [ ] **Step 5: Confirmar vermelho**

Run: `npm test -- src/pages/QuemSomos.test.jsx`
Expected: FAIL pela ausência das classes/regras.

### Task 2: Story, vértices e estratégia

**Files:**
- Modify: `src/pages/QuemSomos.jsx`
- Modify: `src/index.css`
- Test: `src/pages/QuemSomos.test.jsx`

- [ ] **Step 1: Escrever testes vermelhos de story**

Exigir `max-width: 36rem`, `text-align: left`, `font-size: clamp(1.5rem, 7vw, 2.35rem)` e `line-height: 1.3`; no bloco desktop exigir 1320 px, `clamp(1.8rem, 2.8vw, 3.2rem)`, 1.26 e `text-align: justify`.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "centers the story copy"`
Expected: FAIL.

- [ ] **Step 2: Implementar story e confirmar verde**

Adicionar classes de seção/content/copy sem mudar conteúdo ou animação e implementar os valores testados.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "centers the story copy"`
Expected: PASS.

- [ ] **Step 3: Escrever testes vermelhos de vértices**

Exigir no CSS heading mobile com `clamp(2.25rem, 10vw, 3.35rem)`; rail com `gap: .75rem`, `overflow-x: auto`, `scroll-snap-type: x mandatory`; cards com `min-width: 14rem`, `scroll-snap-align: start` e `:focus-visible`; painel com 36 rem, margem 3 rem e padding 2.5 rem. No desktop exigir heading central, rail em três colunas e painel em duas colunas.

No DOM:

```jsx
const buttons = screen.getAllByRole('button', { pressed: false })
expect(buttons).toHaveLength(2)
const user = userEvent.setup()
const tecnologia = screen.getByRole('button', { name: 'Tecnologia' })
expect(tecnologia).toHaveAttribute('type', 'button')
expect(tecnologia).toHaveAttribute('aria-pressed', 'false')
tecnologia.focus()
await user.keyboard('{Enter}')
expect(tecnologia).toHaveAttribute('aria-pressed', 'true')
expect(screen.getByTestId('quem-somos-pillars-panel')).toHaveTextContent('Amplia produtividade, controle e inteligência')

const academia = screen.getByRole('button', { name: 'Academia' })
academia.focus()
await user.keyboard(' ')
expect(academia).toHaveAttribute('aria-pressed', 'true')
expect(screen.getByTestId('quem-somos-pillars-panel')).toHaveTextContent('Transforma consultores em instrutores')
```

Importar `userEvent` de `@testing-library/user-event`. Manter somente o `onClick` nativo existente no componente; não adicionar handlers de teclado. O navegador será usado adicionalmente para confirmar foco e rolagem horizontal.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "keeps the pillars rail accessible"`
Expected: FAIL.

- [ ] **Step 4: Implementar vértices e confirmar verde**

Adicionar classes ao heading, rail, card e painel, incluindo `data-testid="quem-somos-pillars-panel"`, sem mudar callbacks.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "keeps the pillars rail accessible"`
Expected: PASS.

- [ ] **Step 5: Escrever teste vermelho de estratégia**

Exigir copy de 36 rem à esquerda, itens com gap 1.5 rem, gap interno 1.25 rem, marcador 0.65 rem, título `clamp(2.25rem, 10vw, 3.35rem)` e botão 100% no mobile/auto em 640 px; no desktop exigir grid `0.45fr 0.55fr` e conteúdo à direita.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "centers the strategy column"`
Expected: FAIL.

- [ ] **Step 6: Implementar estratégia e confirmar verde**

Adicionar classes sem mudar conteúdo, ordem ou animações e implementar os valores testados.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "centers the strategy column"`
Expected: PASS.

- [ ] **Step 7: Executar regressão parcial**

Run: `npm test -- src/pages/QuemSomos.test.jsx`
Expected: PASS nos contratos adicionados e testes anteriores.

### Task 3: Missão e consultores

**Files:**
- Modify: `src/pages/QuemSomos.jsx`
- Modify: `src/index.css`
- Test: `src/pages/QuemSomos.test.jsx`

- [ ] **Step 1: Escrever teste vermelho de missão**

Exigir conteúdo de 36 rem centralizado, citação `clamp(1.75rem, 7vw, 2.35rem)`/1.32, seção com overflow oculto e desktop com padding 10 rem. A missão não usa o clamp compartilhado de títulos porque seu conteúdo principal é a citação, coberta pelo clamp próprio.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "refines the mobile mission"`
Expected: FAIL.

- [ ] **Step 2: Implementar missão e confirmar verde**

Centralizar os dois elementos textuais, limitar a 36 rem e aplicar `clamp(1.75rem, 7vw, 2.35rem)`/1.32. Preservar ícone decorativo, overflow oculto e desktop com 10 rem.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "refines the mobile mission"`
Expected: PASS.

- [ ] **Step 3: Escrever teste vermelho de consultores e ações**

Exigir copy de 36 rem à esquerda, parágrafos com gap 1.25 rem/entrelinha 1.65, título com clamp compartilhado, LinkedIn 100% abaixo de 640 px e auto a partir de 640 px; no desktop exigir grid de duas colunas e conteúdo à esquerda. Exigir a mesma regra de largura para ações de estratégia e vértices.

Run: `npm test -- src/pages/QuemSomos.test.jsx -t "centers consultants and mobile actions"`
Expected: FAIL.

- [ ] **Step 4: Implementar consultores e ações**

Centralizar copy de 36 rem à esquerda; parágrafos com gap 1.25 rem e entrelinha 1.65. Preservar coluna esquerda do grid desktop.

Estratégia, painel de vértices e LinkedIn usam 100% abaixo de 640 px e largura intrínseca a partir de 640 px. Preservar estados hover/focus existentes.

- [ ] **Step 5: Confirmar verde completo**

Run: `npm test -- src/pages/QuemSomos.test.jsx src/components/Header.test.jsx`
Expected: PASS.

### Task 4: Verificação

**Files:**
- Verify: `src/pages/QuemSomos.jsx`
- Verify: `src/pages/QuemSomos.test.jsx`
- Verify: `src/index.css`

- [ ] **Step 1: Verificações automáticas**

Run: `npx eslint src/pages/QuemSomos.jsx src/pages/QuemSomos.test.jsx`
Expected: zero erros.

Run: `npm run build`
Expected: build concluído.

- [ ] **Step 2: Inspeção responsiva**

Abrir 320 x 568, 390 x 844, 768 x 1024, 1023 x 900, 1024 x 900 e 1440 x 900. Verificar largura/centralização computada, alinhamento à esquerda, rail como único overflow horizontal e desktop equivalente às referências.

- [ ] **Step 3: Acessibilidade**

Em 390 x 844, testar zoom 200%, reduced motion, textos 25% maiores, Tab pelos três cards e Enter/Espaço. Confirmar foco visível, `aria-pressed` e painel correspondente.

- [ ] **Step 4: Revisar diff**

Run: `git diff --check -- src/pages/QuemSomos.jsx src/pages/QuemSomos.test.jsx src/index.css`

Comparar hunks finais com o baseline e não incluir refatorações fora das cinco seções.

Encerrar o processo do servidor iniciado no Step 3 da Task 1 com `Stop-Process -Id $devServerPid`. Confirmar com `Get-NetTCPConnection -LocalPort 4174 -ErrorAction SilentlyContinue`; o comando não deve retornar processo em estado `Listen`.

- [ ] **Step 5: Estratégia de Git**

Não criar commits de implementação sem solicitação explícita do usuário, porque os três arquivos possuem hunks preexistentes misturados. Se o usuário solicitar commit, usar staging interativo apenas para os hunks das novas classes e nunca incluir alterações preexistentes.
