# Silvana WhatsApp Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar uma prévia social exclusiva e estática para `/silvana-bettiol`, com o título, a descrição e a imagem aprovados, sem alterar as demais rotas nem indexar o memorial.

**Architecture:** Centralizar os metadados do memorial em um módulo dedicado e reutilizá-los no React e no gerador estático. O build produzirá `silvana-bettiol.html` com Open Graph disponível sem JavaScript; a Vercel servirá esse arquivo apenas nessa rota. A configuração ficará fora de `staticPageMetadata`, preservando o sitemap.

**Tech Stack:** React 19, Vite 8, Vitest 4, HTML/Open Graph, Vercel rewrites.

---

## Estrutura de arquivos

- Criar `src/seo/memorialMetadata.js`: contrato único dos textos, caminho da imagem, canonical e diretiva robots.
- Criar `public/media/silvana-aniversario-05-08.png`: arte social fornecida pelo usuário.
- Modificar `scripts/generate-static-seo.mjs`: gerar o HTML exclusivo e a meta robots sem misturar a rota ao sitemap.
- Modificar `scripts/generate-static-seo.test.js`: proteger o HTML bruto, a saída do build e todas as rotas preexistentes.
- Modificar `src/pages/SilvanaMemorial.jsx` e seu teste: reutilizar o mesmo contrato no React.
- Modificar `vercel.json` e `vercel.test.js`: servir o HTML exclusivo.
- Modificar `scripts/generate-sitemap.test.js`: confirmar que o memorial continua ausente do sitemap.

### Task 1: Contrato de metadados e arte pública

**Files:**
- Create: `src/seo/memorialMetadata.js`
- Create: `public/media/silvana-aniversario-05-08.png`
- Modify: `src/pages/SilvanaMemorial.test.jsx`
- Modify: `src/pages/SilvanaMemorial.jsx`

- [ ] **Step 1: Escrever o teste React que exige os valores aprovados**

Importar `waitFor` e adicionar ao teste do memorial:

```jsx
await waitFor(() => {
  expect(document.title).toBe('05/08 é aniversário da Silvana')
})
expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
  'content',
  'O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.',
)
expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
  'href',
  'https://otimiza-site.vercel.app/silvana-bettiol',
)
expect(document.head.querySelector('meta[property="og:title"]')).toHaveAttribute(
  'content',
  '05/08 é aniversário da Silvana',
)
expect(document.head.querySelector('meta[property="og:description"]')).toHaveAttribute(
  'content',
  'O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.',
)
expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
  'content',
  'https://otimiza-site.vercel.app/silvana-bettiol',
)
expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
  'content',
  'https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png',
)
expect(document.head.querySelector('meta[name="twitter:title"]')).toHaveAttribute(
  'content',
  '05/08 é aniversário da Silvana',
)
expect(document.head.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
  'content',
  'O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.',
)
expect(document.head.querySelector('meta[name="twitter:image"]')).toHaveAttribute(
  'content',
  'https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png',
)
expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
  'content',
  'noindex, nofollow',
)
```

- [ ] **Step 2: Executar o teste e confirmar RED**

Run: `npx vitest run src/pages/SilvanaMemorial.test.jsx`

Expected: FAIL porque o título atual é “Em memória de Silvana Tiburi Bettiol” e não há imagem social.

- [ ] **Step 3: Criar o contrato mínimo e copiar a arte**

Exportar de `memorialMetadata.js` o contrato completo e independente do host em
que o React esteja rodando:

```js
export const memorialMetadata = {
  route: '/silvana-bettiol',
  title: '05/08 é aniversário da Silvana',
  description: 'O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.',
  h1: 'Silvana Tiburi Bettiol. Hoje é dia dela',
  imagePath: '/media/silvana-aniversario-05-08.png',
  imageUrl: 'https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png',
  canonicalUrl: 'https://otimiza-site.vercel.app/silvana-bettiol',
  robots: 'noindex, nofollow',
}
```

Copiar com `Copy-Item -LiteralPath 'C:\Users\Joao\AppData\Local\Temp\codex-clipboard-33866d11-eccb-4e75-826d-3d1b5a0853a6.png' -Destination 'C:\Users\Joao\Desktop\Site otimiza\public\media\silvana-aniversario-05-08.png'`. Confirmar com `Get-Item` que o destino existe e tem tamanho maior que zero. Em `SilvanaMemorial.jsx`, usar literalmente `canonicalUrl`, `imageUrl`, `title`, `description` e `robots` do contrato em `SeoHead`; não usar `window.location.origin`.

- [ ] **Step 4: Executar o teste e confirmar GREEN**

Run: `npx vitest run src/pages/SilvanaMemorial.test.jsx src/SilvanaRoute.test.jsx`

Expected: PASS.

- [ ] **Step 5: Preparar o commit restrito da tarefa**

Run: `git add -- src/seo/memorialMetadata.js src/pages/SilvanaMemorial.jsx src/pages/SilvanaMemorial.test.jsx public/media/silvana-aniversario-05-08.png`

- [ ] **Step 6: Commit da tarefa**

Run: `git commit -m "feat: add memorial social metadata"`

Expected: commit contém somente os quatro arquivos da tarefa.

### Task 2: HTML estático exclusivo para crawlers sociais

**Files:**
- Modify: `scripts/generate-static-seo.test.js`
- Modify: `scripts/generate-static-seo.mjs`
- Modify: `scripts/generate-sitemap.test.js`

- [ ] **Step 1: Escrever testes de geração e isolamento**

Adicionar estes imports e helpers ao teste:

```js
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildCanonicalUrl, staticPageMetadata } from '../src/seo/siteMetadata.js'
import {
  generateStaticSeoPages,
  getStaticRouteWordCount,
  renderStaticRouteHtml,
} from './generate-static-seo.mjs'

function createStaticFixture({ includeMemorialImage = true } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'silvana-seo-'))
  mkdirSync(join(directory, 'assets'), { recursive: true })
  mkdirSync(join(directory, 'media'), { recursive: true })
  writeFileSync(join(directory, 'index.html'), baseHtml)
  writeFileSync(join(directory, 'assets', 'hero-bw-test.jpg'), 'default-social-image')
  if (includeMemorialImage) {
    writeFileSync(
      join(directory, 'media', 'silvana-aniversario-05-08.png'),
      'memorial-social-image',
    )
  }
  return directory
}

function readRouteHtml(directory, route) {
  const filename = route === '/' ? 'index.html' : `${route.slice(1)}.html`
  return readFileSync(join(directory, filename), 'utf8')
}
```

Criar o teste completo do memorial:

```js
it('generates the exact non-indexed memorial social preview', () => {
  const directory = createStaticFixture()
  try {
    generateStaticSeoPages(directory, { VITE_SITE_URL: 'https://www.otimiza.test' })
    const html = readRouteHtml(directory, '/silvana-bettiol')
    expect(html).toContain('<title>05/08 é aniversário da Silvana</title>')
    expect(html).toContain('<meta name="description" content="O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança." />')
    expect(html).toContain('<link rel="canonical" href="https://otimiza-site.vercel.app/silvana-bettiol" />')
    expect(html).toContain('<meta property="og:title" content="05/08 é aniversário da Silvana" />')
    expect(html).toContain('<meta property="og:description" content="O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança." />')
    expect(html).toContain('<meta property="og:url" content="https://otimiza-site.vercel.app/silvana-bettiol" />')
    expect(html).toContain('<meta property="og:image" content="https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png" />')
    expect(html).toContain('<meta name="twitter:title" content="05/08 é aniversário da Silvana" />')
    expect(html).toContain('<meta name="twitter:description" content="O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança." />')
    expect(html).toContain('<meta name="twitter:image" content="https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png" />')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

it('fails generation when the memorial social image is missing', () => {
  const directory = createStaticFixture({ includeMemorialImage: false })
  try {
    expect(() => generateStaticSeoPages(directory, {
      VITE_SITE_URL: 'https://www.otimiza.test',
    })).toThrow('Missing memorial social image')
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
```

O primeiro teste exige literalmente:

```text
silvana-bettiol.html
<title>05/08 é aniversário da Silvana</title>
<meta name="description" content="O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança." />
og:title, og:description, twitter:title e twitter:description com os textos literais
og:url e canonical = https://otimiza-site.vercel.app/silvana-bettiol
og:image e twitter:image = https://otimiza-site.vercel.app/media/silvana-aniversario-05-08.png
<meta name="robots" content="noindex, nofollow" />
```

Adicionar também a regressão completa:

```js
it('preserves complete metadata for every preexisting static route', () => {
  const directory = createStaticFixture()
  const origin = 'https://www.otimiza.test'
  const defaultImage = `${origin}/assets/hero-bw-test.jpg`
  try {
    generateStaticSeoPages(directory, { VITE_SITE_URL: origin })
    Object.entries(staticPageMetadata).forEach(([route, metadata]) => {
      const html = readRouteHtml(directory, route)
      const canonical = buildCanonicalUrl(route, origin)
      expect(html).toContain(`<title>${metadata.title}</title>`)
      expect(html).toContain(`<meta name="description" content="${metadata.description}" />`)
      expect(html).toContain(`<link rel="canonical" href="${canonical}" />`)
      expect(html).toContain(`<meta property="og:title" content="${metadata.title}" />`)
      expect(html).toContain(`<meta property="og:description" content="${metadata.description}" />`)
      expect(html).toContain(`<meta property="og:url" content="${canonical}" />`)
      expect(html).toContain(`<meta property="og:image" content="${defaultImage}" />`)
      expect(html).toContain(`<meta name="twitter:title" content="${metadata.title}" />`)
      expect(html).toContain(`<meta name="twitter:description" content="${metadata.description}" />`)
      expect(html).toContain(`<meta name="twitter:image" content="${defaultImage}" />`)
      expect(html).not.toContain('<meta name="robots" content="noindex, nofollow" />')
    })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
```

Em `generate-sitemap.test.js`, substituir o import atual por
`import { getIndexableRoutes, renderRobotsTxt, renderSitemapXml } from './generate-sitemap.mjs'`
e adicionar:

```js
it('keeps the memorial out of the generated sitemap XML', () => {
  const routes = getIndexableRoutes()
  const xml = renderSitemapXml(routes, 'https://otimiza-site.vercel.app')
  expect(routes).not.toContain('/silvana-bettiol')
  expect(xml).not.toContain('silvana-bettiol')
})
```

- [ ] **Step 2: Executar os testes e confirmar RED**

Run: `npx vitest run scripts/generate-static-seo.test.js scripts/generate-sitemap.test.js`

Expected: FAIL porque `silvana-bettiol.html` ainda não é gerado e `renderStaticRouteHtml` não produz robots.

- [ ] **Step 3: Implementar a geração mínima**

Permitir que `renderStaticRouteHtml` insira `robots` quando fornecido. Fazer
`generateStaticSeoPages(distDirectory, environment = process.env)` resolver a
origem das páginas indexáveis a partir do argumento, validar a existência de
`dist/media/silvana-aniversario-05-08.png` e gerar o memorial separadamente de
`staticPageMetadata`. O objeto enviado para renderização será:

```js
const memorialPage = {
  ...memorialMetadata,
  sections: [],
  links: [],
}

renderStaticRouteHtml(baseHtml, {
  ...memorialPage,
  structuredData: buildStructuredData(memorialMetadata.route, memorialPage),
})
```

Gravar o resultado de forma explícita:

```js
const memorialImageFile = path.join(
  distDirectory,
  memorialMetadata.imagePath.replace(/^\//, ''),
)
if (!fs.existsSync(memorialImageFile)) {
  throw new Error(`Missing memorial social image: ${memorialImageFile}`)
}
const memorialHtml = renderStaticRouteHtml(baseHtml, {
  ...memorialPage,
  structuredData: buildStructuredData(memorialMetadata.route, memorialPage),
})
fs.writeFileSync(path.join(distDirectory, 'silvana-bettiol.html'), memorialHtml)
```

Manter o loop atual das rotas indexáveis sem mudanças de valores. A meta robots
deve ser condicional para aparecer somente quando `page.robots` existir.

- [ ] **Step 4: Executar os testes e confirmar GREEN**

Run: `npx vitest run scripts/generate-static-seo.test.js scripts/generate-sitemap.test.js`

Expected: PASS.

- [ ] **Step 5: Preparar o commit restrito da tarefa**

Run: `git add -- scripts/generate-static-seo.mjs scripts/generate-static-seo.test.js scripts/generate-sitemap.test.js`

- [ ] **Step 6: Commit da tarefa**

Run: `git commit -m "feat: generate memorial social preview"`

Expected: commit contém somente os três arquivos da tarefa.

### Task 3: Entrega da rota correta na Vercel

**Files:**
- Modify: `vercel.test.js`
- Modify: `vercel.json`

- [ ] **Step 1: Escrever o teste da rewrite exclusiva**

Exigir que a entrada de `/silvana-bettiol` seja exatamente:

```js
{ source: '/silvana-bettiol', destination: '/silvana-bettiol.html' }
```

e apareça antes do fallback SPA.

- [ ] **Step 2: Executar o teste e confirmar RED**

Run: `npx vitest run vercel.test.js`

Expected: FAIL porque a rota ainda aponta para `/index.html`.

- [ ] **Step 3: Alterar somente a destination da rota**

Atualizar `vercel.json` para servir `/silvana-bettiol.html`.

- [ ] **Step 4: Executar o teste e confirmar GREEN**

Run: `npx vitest run vercel.test.js`

Expected: PASS.

- [ ] **Step 5: Preparar o commit restrito da tarefa**

Run: `git add -- vercel.json vercel.test.js`

- [ ] **Step 6: Commit da tarefa**

Run: `git commit -m "fix: serve memorial preview HTML"`

Expected: commit contém somente `vercel.json` e `vercel.test.js`.

### Task 4: Verificação integrada

**Files:**
- Verify: `dist/silvana-bettiol.html`
- Verify: `dist/media/silvana-aniversario-05-08.png`
- Verify: `dist/sitemap.xml`

- [ ] **Step 1: Executar testes focados**

Run: `npx vitest run scripts/generate-static-seo.test.js scripts/generate-sitemap.test.js src/pages/SilvanaMemorial.test.jsx src/SilvanaRoute.test.jsx vercel.test.js`

Expected: todos passam.

- [ ] **Step 2: Executar lint dos arquivos alterados**

Run: `npx eslint scripts/generate-static-seo.mjs scripts/generate-static-seo.test.js scripts/generate-sitemap.test.js src/seo/memorialMetadata.js src/pages/SilvanaMemorial.jsx src/pages/SilvanaMemorial.test.jsx vercel.test.js`

Expected: exit 0.

- [ ] **Step 3: Executar a suíte completa**

Run: `npm test`

Expected: exit 0, sem testes falhando.

- [ ] **Step 4: Executar o lint completo**

Run: `npm run lint`

Expected: exit 0, sem erros.

- [ ] **Step 5: Executar o build de produção**

Run: `$env:VITE_SITE_URL='https://otimiza-site.vercel.app'; npm run build`

Expected: exit 0 e criação de `dist/silvana-bettiol.html`.

- [ ] **Step 6: Inspecionar os artefatos**

Confirmar no HTML bruto os valores literais e URLs absolutas, confirmar que a imagem existe em `dist/media`, e confirmar que `dist/sitemap.xml` não contém `silvana-bettiol`.

- [ ] **Step 7: Revisar o diff final**

Run: `git diff --check` e `git status --short`.

Expected: nenhum erro de whitespace e apenas os arquivos planejados, além das alterações preexistentes do usuário.
