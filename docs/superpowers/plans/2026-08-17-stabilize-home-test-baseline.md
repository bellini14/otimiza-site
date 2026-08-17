# Estabilizar testes da home — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atualizar os testes desatualizados da home para descrever o comportamento já publicado, deixando a suíte verde sem modificar a interface.

**Architecture:** A implementação de produção não será alterada. Os testes de logos passarão a validar `ScrollVelocity`, que substituiu o markup de duas linhas do marquee antigo; o teste de soluções validará os dois blocos existentes do painel de detalhe. A cobertura continuará verificando acessibilidade, cópias decorativas e animação no contêiner correto.

**Tech Stack:** React, Vitest, Testing Library, Motion.

---

### Task 1: Alinhar testes do carrossel de logos ao `ScrollVelocity`

**Files:**
- Modify: `src/pages/HomeClientLogos.test.jsx`
- Reference: `src/pages/Home.jsx:227-242`
- Reference: `src/components/ui/ScrollVelocity.jsx:141-178`

- [ ] **Step 1: Manter a falha documentada**

Run: `npm test -- --run src/pages/HomeClientLogos.test.jsx`

Expected: cinco falhas procurando `home-client-logo-row` e a duração CSS do marquee antigo.

- [ ] **Step 2: Substituir expectativas do markup e CSS antigos**

Remover as expectativas de `home-client-logo-row`, `home-client-logo-marquee__track`, `home-client-logo-marquee__scroller` e `--home-client-logo-duration`. Substituir os dois testes de CSS/duração por um contrato do componente atual: `home-client-logo-carousel` contém duas faixas `.relative.overflow-hidden`; cada faixa tem seis cópias diretas do conteúdo, só a primeira é acessível e as demais têm `aria-hidden="true"`; os cards mantêm as classes responsivas `h-10 sm:h-16` e o conteúdo de cada faixa usa `gap-3 sm:gap-6`.

- [ ] **Step 3: Preservar a proteção da animação**

Verificar que `home-client-logo-carousel` recebe a animação de entrada e que as faixas internas não recebem `animate-enter`. Para o movimento, simular `HTMLElement.prototype.scrollWidth` com valor não-zero, capturar os callbacks de `requestAnimationFrame`, executar um frame com tempo/delta positivo e validar que o `motion.div` recebe transform diferente de `0px`. Restaurar todos os mocks ao fim do teste.

- [ ] **Step 4: Verificar que agora passa**

Run: `npm test -- --run src/pages/HomeClientLogos.test.jsx`

Expected: 10 testes passando.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomeClientLogos.test.jsx
git commit -m "test: align home logo coverage with scroll velocity"
```

### Task 2: Alinhar o teste do painel de soluções

**Files:**
- Modify: `src/components/FeaturesSection.test.jsx:204-216`
- Reference: `src/components/FeaturesSection.jsx:270-302`

- [ ] **Step 1: Manter a falha documentada**

Run: `npm test -- --run src/components/FeaturesSection.test.jsx`

Expected: a expectativa antiga `toBeGreaterThan(2)` falha porque o painel inicial tem Processo e Resultados.

- [ ] **Step 2: Registrar o contrato publicado**

Trocar a expectativa por `toHaveLength(2)` e verificar que ambos os itens representam Processo e Resultados. Manter as verificações de que apenas o painel de detalhe usa as classes de transição.

- [ ] **Step 3: Verificar que agora passa**

Run: `npm test -- --run src/components/FeaturesSection.test.jsx`

Expected: 11 testes passando.

- [ ] **Step 4: Commit**

```bash
git add src/components/FeaturesSection.test.jsx
git commit -m "test: match published solutions detail panel"
```

### Task 3: Verificar a base estabilizada

**Files:**
- No production file changes.

- [ ] **Step 1: Rodar a suíte completa**

Run: `npm test -- --run`

Expected: todos os testes passam.

- [ ] **Step 2: Rodar o build de produção**

Run: `$env:VITE_SITE_URL='https://www.otm.com.br'; npm run build`

Expected: build concluído sem erros.

- [ ] **Step 3: Abrir PR de estabilização**

Executar `git fetch origin main`, seguido de `git diff --check origin/main...HEAD` e `git diff --name-only origin/main...HEAD`. Confirmar que o diff contém apenas os dois arquivos de teste e a documentação planejada; abrir um PR independente para `main`.

- [ ] **Step 4: Validar preview e diff pré-merge**

Após o preview da Vercel ficar disponível, abrir a home e confirmar que não houve alteração visual no carrossel de logos ou na seção de soluções. Antes do merge, executar `git fetch origin main` e repetir `git diff --check origin/main...HEAD` e `git diff --name-only origin/main...HEAD`; qualquer arquivo fora da lista aprovada interrompe o merge.
