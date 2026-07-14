# Quem Somos Mobile Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralizar e refinar o hero da página Quem Somos abaixo de 1024 px, preservando o layout desktop atual.

**Architecture:** Manter a estrutura e a semântica do componente. Adicionar identificadores CSS focados ao hero, implementar mobile-first em `src/index.css` e restaurar explicitamente os valores atuais dentro de `@media (min-width: 1024px)`. O teste de contrato lê o CSS para validar propriedades responsivas; a inspeção no navegador valida o comportamento renderizado.

**Tech Stack:** React, Tailwind CSS, CSS, Vitest, Testing Library, Vite.

---

### Task 1: Registrar baseline e escrever o teste vermelho

**Files:**
- Modify: `src/pages/QuemSomos.test.jsx`
- Inspect: `src/pages/QuemSomos.jsx`
- Inspect: `src/index.css`

- [ ] **Step 1: Registrar o estado preexistente**

Run: `git status --short; git diff -- src/pages/QuemSomos.jsx src/pages/QuemSomos.test.jsx src/index.css`

Salvar a saída no registro da sessão e tratar todos os hunks exibidos como alterações do usuário. Editar apenas o hero e o teste novo; não reformatar arquivos inteiros.

- [ ] **Step 2: Capturar referência visual desktop antes da mudança**

Run: `npm run dev -- --host 127.0.0.1`

Abrir `/quem-somos` em 1024 x 900 e 1440 x 900 e registrar screenshots antes da alteração para comparação posterior. Registrar também os valores atuais: shell com `gap: 2.5rem` e padding vertical de 9 rem; card com padding de 2.75 rem; indicador absoluto a 2.5 rem da base; foto centralizada.

- [ ] **Step 3: Escrever o teste que falha**

Adicionar em `src/pages/QuemSomos.test.jsx` o helper abaixo, que percorre chaves balanceadas e devolve somente o conteúdo do breakpoint:

```js
function readMediaBlock(css, query) {
  const start = css.indexOf(`@media ${query}`)
  if (start < 0) return ''
  const open = css.indexOf('{', start)
  let depth = 0
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}') depth -= 1
    if (depth === 0) return css.slice(open + 1, index)
  }
  return ''
}
```

Então adicionar:

```jsx
it('centers the about hero below 1024px while preserving its desktop composition', () => {
  render(<MemoryRouter><QuemSomos /></MemoryRouter>)

  const hero = screen.getByTestId('quem-somos-hero')
  expect(hero.querySelector('.quem-somos-hero__shell')).toBeInTheDocument()
  expect(hero.querySelector('.quem-somos-hero__copy')).toBeInTheDocument()
  expect(hero.querySelector('.quem-somos-hero__intro')).toBeInTheDocument()
  expect(hero.querySelector('.quem-somos-hero__card')).toBeInTheDocument()
  expect(hero.querySelector('.quem-somos-hero__scroll')).toBeInTheDocument()
  expect(screen.getByTestId('quem-somos-hero-background')).toHaveClass('quem-somos-hero__photo')

  expect(indexCss).toMatch(/\.quem-somos-hero__shell\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*min-height:\s*100svh;[\s\S]*gap:\s*clamp\(1\.5rem,\s*6vw,\s*2\.5rem\);/)
  expect(indexCss).toMatch(/\.quem-somos-hero__title\s*\{[\s\S]*font-size:\s*clamp\(2\.75rem,\s*13vw,\s*4\.5rem\);[\s\S]*text-align:\s*center;[\s\S]*white-space:\s*normal/)
  expect(indexCss).toMatch(/\.quem-somos-hero__intro\s*\{[\s\S]*max-width:\s*36rem;[\s\S]*line-height:\s*1\.35;[\s\S]*text-align:\s*center/)
  expect(indexCss).toMatch(/\.quem-somos-hero__card\s*\{[\s\S]*max-width:\s*33rem;[\s\S]*padding:\s*1\.5rem;[\s\S]*text-align:\s*center/)
  expect(indexCss).toMatch(/\.quem-somos-hero__photo\s*\{[\s\S]*object-position:\s*60%\s+center/)
  expect(indexCss).toMatch(/\.quem-somos-hero__scroll\s*\{[\s\S]*position:\s*static;[\s\S]*margin-top:\s*1\.5rem;[\s\S]*transform:\s*none/)
  expect(indexCss).toMatch(/:root\s*\{[\s\S]*--home-menu-inline:\s*1\.5rem/)
  expect(readMediaBlock(indexCss, '(min-width: 640px)')).toMatch(/--home-menu-inline:\s*2rem/)

  const desktopCss = readMediaBlock(indexCss, '(min-width: 1024px)')
  expect(desktopCss).toMatch(/\.quem-somos-hero__shell\s*\{[\s\S]*grid-template-columns:\s*1fr\s+0\.82fr/)
  expect(desktopCss).toMatch(/\.quem-somos-hero__copy\s*\{[\s\S]*text-align:\s*left/)
  expect(desktopCss).toMatch(/\.quem-somos-hero__photo\s*\{[\s\S]*object-position:\s*center/)
  expect(desktopCss).toMatch(/\.quem-somos-hero__scroll\s*\{[\s\S]*position:\s*absolute;[\s\S]*bottom:\s*2\.5rem/)
})
```

- [ ] **Step 4: Confirmar a falha**

Run: `npm test -- src/pages/QuemSomos.test.jsx`
Expected: FAIL na ausência das classes/regras novas.

### Task 2: Implementar o mínimo e obter teste verde

**Files:**
- Modify: `src/pages/QuemSomos.jsx`
- Modify: `src/index.css`
- Test: `src/pages/QuemSomos.test.jsx`

- [ ] **Step 1: Identificar os elementos sem mudar conteúdo**

Adicionar `quem-somos-hero__shell`, `quem-somos-hero__copy`, `quem-somos-hero__intro`, `quem-somos-hero__card-wrap`, `quem-somos-hero__card` e `quem-somos-hero__scroll`. Mover o indicador para dentro do shell, depois do card, mantendo `aria-hidden`.

- [ ] **Step 2: Implementar os valores mobile exatos**

Adicionar CSS equivalente a:

```css
.quem-somos-hero__shell {
  grid-template-columns: minmax(0, 1fr);
  min-height: 100svh;
  gap: clamp(1.5rem, 6vw, 2.5rem);
  padding-block: 9rem 2rem;
  text-align: center;
}
.quem-somos-hero__copy,
.quem-somos-hero__intro,
.quem-somos-hero__card { margin-inline: auto; }
.quem-somos-hero__title {
  font-size: clamp(2.75rem, 13vw, 4.5rem);
  line-height: .96;
  text-align: center;
  white-space: normal !important;
}
.quem-somos-hero__intro {
  max-width: 36rem;
  margin-top: clamp(1.25rem, 4vw, 1.75rem);
  line-height: 1.35;
  text-align: center;
}
.quem-somos-hero__card-wrap { display: flex; justify-content: center; }
.quem-somos-hero__card { width: 100%; max-width: 33rem; padding: 1.5rem; text-align: center; }
.quem-somos-hero__photo { object-position: 60% center; }
.quem-somos-hero__scroll { position: static; display: flex; justify-content: center; margin-top: 1.5rem; transform: none; }
```

Preservar `home-menu-shell`, pois ela fornece padding lateral de 1.5 rem e passa a 2 rem em 640 px. Usar a sobreposição clara existente. Para contraste sobre imagem/transparência, capturar screenshot sem cursor, amostrar com o seletor de cores os pixels mais escuros imediatamente atrás do título, introdução e card e calcular a razão entre cada RGB amostrado e o RGB computado do texto pela fórmula WCAG de luminância relativa. Registrar RGB e razão mínima; ajustar a opacidade somente se texto normal ficar abaixo de 4,5:1 ou texto grande abaixo de 3:1.

- [ ] **Step 3: Preservar os valores atuais no desktop**

Em `@media (min-width: 1024px)`, usar `grid-template-columns: 1fr .82fr`, `gap: 2.5rem`, padding vertical de 9 rem, título `clamp(3.25rem, 7.2vw, 6.4rem)` em uma linha e à esquerda, introdução à esquerda com `max-width: 45rem`, margem superior de 2.25 rem e `line-height: 1.2`, card à direita com padding de 2.75 rem, foto central e indicador absoluto a 2.5 rem da base.

- [ ] **Step 4: Executar o teste focal**

Run: `npm test -- src/pages/QuemSomos.test.jsx`
Expected: PASS.

- [ ] **Step 5: Refatorar sem ampliar escopo e testar novamente**

Remover utilitários Tailwind conflitantes somente dos elementos identificados e preservar `prefers-reduced-motion` existente para `.quem-somos-hero__photo`.

Run: `npm test -- src/pages/QuemSomos.test.jsx`
Expected: PASS.

### Task 3: Verificação responsiva e regressão

**Files:**
- Verify: `src/pages/QuemSomos.jsx`
- Verify: `src/index.css`
- Verify: `src/pages/QuemSomos.test.jsx`

- [ ] **Step 1: Executar verificações automáticas**

Run: `npm test -- src/pages/QuemSomos.test.jsx src/components/Header.test.jsx`
Expected: PASS.

Run: `npm run lint`
Expected: zero erros.

Run: `npm run build`
Expected: build concluído sem erros.

- [ ] **Step 2: Inspecionar no navegador**

Run: `npm run dev -- --host 127.0.0.1`

Abrir `/quem-somos` em 320 x 568, 390 x 844, 768 x 1024, 1023 x 900, 1024 x 900 e 1440 x 900. Conferir centralização, ausência de overflow horizontal, indicador no fluxo sem sobreposição/safe-area e crescimento vertical em telas baixas. No painel Accessibility/Contrast, registrar a menor razão do título, introdução e card e confirmar os limites de 3:1/4,5:1.

- [ ] **Step 3: Verificar acessibilidade responsiva**

No navegador, testar zoom de 200%, preferência de movimento reduzido e conteúdo 25% maior via DevTools. Confirmar leitura, quebra segura do título, ausência de corte e animação da foto desativada em movimento reduzido.

- [ ] **Step 4: Comparar desktop e revisar somente hunks novos**

Comparar screenshots 1024 x 900 e 1440 x 900 depois da mudança com as referências anteriores. Executar `git diff -- src/pages/QuemSomos.jsx src/pages/QuemSomos.test.jsx src/index.css` e revisar manualmente apenas os hunks tocados nesta sessão contra o baseline registrado no passo 1.

- [ ] **Step 5: Commit opcional somente se solicitado**

Não incluir mudanças preexistentes do usuário. Caso solicitado, adicionar apenas os trechos/arquivos confirmados desta tarefa.
