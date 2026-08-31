# Social SEO Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recuperar os cartões compartilháveis específicos de posts, páginas e cases sem alterar o site visível nem a declaração de idioma publicada.

**Architecture:** Manter o Vite e a aplicação cliente intactos e ampliar somente a etapa Node pós-build que já gera HTML estático para crawlers. Separar a geração de cases em um módulo próprio, manter posts no gerador existente e coordenar ambos em `generate-static-seo.mjs`, com dependências de fetch injetáveis para testes determinísticos.

**Tech Stack:** Node.js ESM, Vite, Vitest/jsdom, Vercel, Open Graph e Twitter Cards.

---

## Restrições de arquivo

Arquivos de produção permitidos:

- `scripts/generate-post-social-pages.mjs`
- `scripts/generate-static-seo.mjs`
- `scripts/generate-case-social-pages.mjs` (novo)

Arquivos de teste permitidos:

- `scripts/generate-post-social-pages.test.mjs`
- `scripts/generate-static-seo.test.js`
- `scripts/generate-case-social-pages.test.mjs` (novo)

Documentação permitida:

- `docs/superpowers/specs/2026-08-31-social-seo-recovery-design.md`
- `docs/superpowers/plans/2026-08-31-social-seo-recovery.md`

Se qualquer outro arquivo precisar mudar, interromper a execução. Em especial, `index.html`, `src/**`, CSS, `package*.json` e `vercel.json` devem permanecer idênticos a `origin/main`.

### Task 1: Recuperar metadados sociais dos posts

**Files:**
- Modify: `scripts/generate-post-social-pages.test.mjs`
- Modify: `scripts/generate-post-social-pages.mjs`

- [ ] **Step 1: Escrever testes que expressem o comportamento recuperado**

Atualizar o fixture principal com `description: 'Descrição específica do artigo.'` e acrescentar assertions equivalentes a:

```js
expect(html).toContain('<meta property="og:description" content="Descrição específica do artigo." />')
expect(html).toContain(
  'https://cdn.sanity.io/images/example/featured-image.png?w=1200&amp;h=630&amp;fit=crop&amp;fm=jpg&amp;q=82',
)
expect(html).toContain('<meta property="og:image:type" content="image/jpeg" />')
expect(html).toContain('<meta property="og:image:width" content="1200" />')
expect(html).toContain('<meta property="og:image:height" content="630" />')
expect(html).toContain('<meta name="twitter:image"')
```

No teste de post sem imagem, substituir a expectativa do hero fallback por:

```js
expect(html).not.toContain('<meta property="og:image"')
expect(html).not.toContain('<meta property="og:image:type"')
expect(html).not.toContain('<meta name="twitter:image"')
expect(html).toContain('<meta name="twitter:card" content="summary" />')
```

Também verificar que uma URL de imagem malformada lança erro.

- [ ] **Step 2: Executar o teste e confirmar RED**

Run:

```bash
npx vitest run scripts/generate-post-social-pages.test.mjs --reporter=verbose --maxWorkers=1
```

Expected: FAIL porque a `main` usa descrição genérica, URL original, fallback hero e não gera tipo/dimensões.

- [ ] **Step 3: Implementar a transformação mínima**

Adicionar `description` à `INSPIRE_POSTS_QUERY`. Alterar `replaceDocumentMetadata` para usar `metadata.description`, tornar as tags de imagem condicionais e escolher `summary` quando não houver imagem:

```js
const imageTags = metadata.imageUrl ? [
  `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`,
  '<meta property="og:image:type" content="image/jpeg" />',
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
] : []

const twitterImageTags = metadata.imageUrl
  ? [`<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}" />`]
  : []
```

Criar a transformação da URL:

```js
function getShareImageUrl(imageUrl) {
  if (!imageUrl) return null
  const resolved = new URL(resolveLegacyImageUrl(imageUrl))
  if (resolved.hostname === 'cdn.sanity.io') {
    resolved.searchParams.set('w', '1200')
    resolved.searchParams.set('h', '630')
    resolved.searchParams.set('fit', 'crop')
    resolved.searchParams.set('fm', 'jpg')
    resolved.searchParams.set('q', '82')
  }
  return resolved.toString()
}
```

Construir metadata com:

```js
const metadata = {
  title,
  description: post.description || DESCRIPTION,
  url: new URL(postPath, `${siteOrigin}/`).toString(),
  imageUrl: getShareImageUrl(post.mainImageUrl || post.contentImageUrl),
}
```

Manter a assinatura pública atual para reduzir o diff, mas não usar o hero como fallback de posts.

- [ ] **Step 4: Executar os testes e confirmar GREEN**

Run:

```bash
npx vitest run scripts/generate-post-social-pages.test.mjs --reporter=verbose --maxWorkers=1
```

Expected: todos os testes do arquivo passam.

- [ ] **Step 5: Commitar somente o gerador e o teste de posts**

```bash
git add scripts/generate-post-social-pages.mjs scripts/generate-post-social-pages.test.mjs
git commit -m "fix: recover Inspire social image metadata"
```

### Task 2: Recuperar páginas sociais dos cases

**Files:**
- Create: `scripts/generate-case-social-pages.test.mjs`
- Create: `scripts/generate-case-social-pages.mjs`

- [ ] **Step 1: Escrever os testes do módulo de cases**

Criar testes que importem `renderCaseSocialPage`, `fetchCaseStudies` e `generateCaseSocialPages`. Cobrir:

```js
const baseHtml = '<!doctype html><html lang="pt-BR"><head><title>Padrão</title></head><body></body></html>'

const html = renderCaseSocialPage({
  siteOrigin: 'https://www.otimiza.test',
  baseHtml,
  caseStudy: {
    slug: 'banco-moneo',
    title: 'Transformação que dá certo',
    description: 'Automação segura de contratos.',
    imageUrl: 'https://images.example/moneo.jpg',
  },
})

expect(html).toContain('<title>Transformação que dá certo | Otimiza</title>')
expect(html).toContain('<link rel="canonical" href="https://www.otimiza.test/cases/banco-moneo" />')
expect(html).toContain('<meta property="og:type" content="article" />')
expect(html).toContain('<meta property="og:image" content="https://images.example/moneo.jpg" />')
expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
```

Testar `generateCaseSocialPages` com um item sem slug/título/descrição, injetando `resolveLocalSlug`, `localCases` e `localHeroImages`, e verificar a precedência especificada. Testar ainda: registro sem slug resolvível é `skipped`; ausência de imagem omite as tags e usa `summary`; URL malformada falha; HTTP não OK e resposta não-array falham.

- [ ] **Step 2: Executar o novo teste e confirmar RED**

Run:

```bash
npx vitest run scripts/generate-case-social-pages.test.mjs --reporter=verbose --maxWorkers=1
```

Expected: FAIL com módulo inexistente.

- [ ] **Step 3: Implementar o módulo isolado de cases**

Usar esta consulta, sem `coalesce`, para preservar a precedência local:

```js
export const CASES_QUERY = `*[_type == "clientLogo" && isVisible != false && showOnCases == true] {
  "name": name,
  "title": caseTitle,
  "description": caseDescription,
  "slug": caseSlug.current,
  "imageUrl": logo.asset->url
}`
```

O gerador deve resolver cada item assim:

```js
const slug = caseStudy?.slug || resolveLocalSlug(caseStudy?.name)
if (!CASE_SLUG.test(slug || '')) {
  skipped += 1
  continue
}
const localCase = localCases[slug]
const resolvedCase = {
  ...caseStudy,
  slug,
  title: caseStudy.title || localCase?.title || caseStudy.name,
  description: caseStudy.description || localCase?.subtitle,
  imageUrl: localHeroImages[slug] || caseStudy.imageUrl || null,
}
await writeFile(
  `cases/${slug}/index.html`,
  renderCaseSocialPage({ caseStudy: resolvedCase, siteOrigin, baseHtml }),
)
```

`renderCaseSocialPage` deve validar o slug, normalizar qualquer imagem presente com `new URL(imageUrl).toString()`, escapar valores, usar a descrição final `Case de consultoria da Otimiza para <nome>.` e omitir tags de imagem/usar Twitter `summary` quando não houver imagem.

`fetchCaseStudies` deve exigir `response.ok` e `Array.isArray(body.result)`.

- [ ] **Step 4: Executar o teste e confirmar GREEN**

Run:

```bash
npx vitest run scripts/generate-case-social-pages.test.mjs --reporter=verbose --maxWorkers=1
```

Expected: todos os testes de cases passam.

- [ ] **Step 5: Commitar somente o módulo e o teste de cases**

```bash
git add scripts/generate-case-social-pages.mjs scripts/generate-case-social-pages.test.mjs
git commit -m "feat: recover case social preview pages"
```

### Task 3: Integrar imagens por rota e cases no build estático

**Files:**
- Modify: `scripts/generate-static-seo.test.js`
- Modify: `scripts/generate-static-seo.mjs`

- [ ] **Step 1: Ampliar o fixture e escrever testes de integração RED**

No `createStaticFixture`, criar também:

```js
writeFileSync(join(directory, 'assets', 'hero quem somos-test.jpg'), 'about-social-image')
writeFileSync(join(directory, 'assets', 'shutterstock_2714404709-test.jpg'), 'approach-social-image')
writeFileSync(join(directory, 'inspire-newsletter-card.png'), 'newsletter-social-image')
```

Injetar `fetchCases: async () => []` em testes existentes para impedir rede. Acrescentar assertions:

```js
expect(aboutHtml).toContain('https://www.otimiza.test/assets/hero%20quem%20somos-test.jpg')
expect(approachHtml).toContain('https://www.otimiza.test/assets/shutterstock_2714404709-test.jpg')
expect(inspireHtml).toContain('https://www.otimiza.test/inspire-newsletter-card.png')
expect(html).toContain('<meta property="og:image:type" content="image/jpeg" />')
expect(html).toContain('<meta property="og:image:width" content="1200" />')
expect(html).toContain('<meta property="og:image:height" content="630" />')
```

Adicionar um teste de integração com `fetchCases` retornando Banco Moneo e verificar que `cases/banco-moneo/index.html` contém canonical, título/subtítulo locais e a URL fixa do setor bancário.

- [ ] **Step 2: Executar os testes estáticos e confirmar RED**

Run:

```bash
npx vitest run scripts/generate-static-seo.test.js --reporter=verbose --maxWorkers=1
```

Expected: FAIL porque ainda não existem imagens por rota, metadados de dimensões ou geração de cases.

- [ ] **Step 3: Integrar os geradores no build**

Importar:

```js
import { generateCaseSocialPages } from './generate-case-social-pages.mjs'
import { caseStudies, resolveCaseStudySlug } from '../src/data/caseStudies.js'
```

Em `renderStaticRouteHtml`, tornar a imagem condicional e, quando presente, acrescentar:

```js
const imageMetadata = getSocialImageMetadata(socialPreview.imageUrl)
['og:image', socialPreview.imageUrl]
['og:image:type', imageMetadata.type]
['og:image:width', imageMetadata.width]
['og:image:height', imageMetadata.height]
```

Usar `summary_large_image` somente quando houver imagem. Definir:

```js
const socialImageByRoute = {
  '/': imageUrl,
  '/quem-somos': getAssetUrl('hero quem somos', siteOrigin, distDirectory),
  '/nossa-abordagem': getAssetUrl('shutterstock_2714404709', siteOrigin, distDirectory),
}
```

Aplicar `inspire-newsletter-card.png` a `/inspire` mantendo `metadata.title` e `metadata.description`; manter o preview exclusivo já existente de `/inspire/newsletter`.

Alterar a assinatura para aceitar `{ fetchPosts, fetchCases }` e, depois dos posts, chamar:

```js
await generateCaseSocialPages({
  siteOrigin,
  baseHtml,
  fetchCases,
  localCases: caseStudies,
  resolveLocalSlug: resolveCaseStudySlug,
  localHeroImages: buildLocalCaseHeroImages(),
  writeFile: async (outputPath, html) => {
    const absoluteOutputPath = path.join(distDirectory, outputPath)
    fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true })
    fs.writeFileSync(absoluteOutputPath, html)
  },
})
```

Restaurar `getAssetUrl`, `getSocialImageMetadata` e `buildLocalCaseHeroImages` exatamente com o mapa fixado na especificação. Não importar nem alterar componentes React.

- [ ] **Step 4: Executar todos os testes focados e confirmar GREEN**

Run:

```bash
npx vitest run scripts/generate-post-social-pages.test.mjs scripts/generate-case-social-pages.test.mjs scripts/generate-static-seo.test.js src/indexLanguage.test.js --reporter=verbose --maxWorkers=1
```

Expected: todos os testes focados passam, incluindo os dois testes de idioma.

- [ ] **Step 5: Commitar somente a integração estática e seu teste**

```bash
git add scripts/generate-static-seo.mjs scripts/generate-static-seo.test.js
git commit -m "fix: recover route-specific social previews"
```

### Task 4: Verificar preservação e prontidão

**Files:**
- Verify only; no production file changes expected.

- [ ] **Step 1: Executar lint nos seis arquivos de implementação/teste**

```bash
npx eslint scripts/generate-post-social-pages.mjs scripts/generate-post-social-pages.test.mjs scripts/generate-case-social-pages.mjs scripts/generate-case-social-pages.test.mjs scripts/generate-static-seo.mjs scripts/generate-static-seo.test.js
```

Expected: exit 0.

- [ ] **Step 2: Executar build completo com o domínio canônico**

PowerShell:

```powershell
$env:VITE_SITE_URL='https://www.otm.com.br'; npm run build
```

Expected: exit 0 e geração dos HTMLs sociais.

- [ ] **Step 3: Auditar o diff permitido e a preservação do idioma**

```bash
git diff --check origin/main...HEAD
git diff --name-status origin/main...HEAD
git diff --exit-code origin/main -- index.html src package.json package-lock.json vercel.json
npx vitest run src/indexLanguage.test.js --reporter=verbose --maxWorkers=1
```

Expected: somente documentação e os seis arquivos permitidos; nenhum diff em arquivos proibidos; idioma 2/2.

- [ ] **Step 4: Registrar a suíte completa sem corrigir baseline alheia**

```bash
npm test -- --run
```

Expected baseline conhecida: 7 arquivos falhando, 4 testes falhando, 515 passando e 3 ignorados. Interromper se os testes focados falharem ou se a contagem piorar por causa do diff.

- [ ] **Step 5: Solicitar revisão de código independente**

Usar `requesting-code-review` com base `6f2a4d7` e HEAD da branch. Corrigir qualquer achado Critical/Important apenas dentro dos seis arquivos permitidos; se exigir outro arquivo, interromper.

### Task 5: Preview, integração protegida e verificação em produção

**Files:**
- No source changes expected.

- [ ] **Step 1: Confirmar vínculo Vercel e criar preview isolado**

```bash
npx vercel link --yes --project otimiza-site
npx vercel deploy --yes --build-env VITE_SITE_URL=https://www.otm.com.br --logs
```

Expected: deployment Preview `READY`, sem alteração dos aliases de produção.

- [ ] **Step 2: Comparar preview e produção**

Verificar com `vercel curl` e navegador:

- `/` mantém título, descrição, conteúdo e `lang="pt-BR"`;
- `/inspire` usa o card da newsletter apenas nos metadados sociais;
- `/inspire/newsletter` mantém seu card atual;
- um post datado usa descrição própria e imagem Sanity 1200×630;
- `/quem-somos` usa a imagem específica;
- `/cases/banco-moneo` usa título, descrição, canonical e imagem do case;
- console sem erros e layout sem diferença visual.

Fornecer a URL de preview ao usuário para teste opcional no WhatsApp, mas não alterar configurações persistentes de proteção ou ambiente.

- [ ] **Step 3: Publicar via PR protegido**

```bash
git fetch origin main
git merge-base --is-ancestor origin/main HEAD
git push -u origin codex/social-seo-recovery-production
gh pr create --base main --head codex/social-seo-recovery-production --title "fix: recover social SEO previews" --body "## Resumo`n- recupera metadados sociais específicos de posts, páginas e cases`n- preserva a interface e o idioma pt-BR já publicados`n- limita o código de produção aos três geradores estáticos autorizados`n`n## Verificação`n- testes focados de SEO e idioma`n- lint dos arquivos alterados`n- build com VITE_SITE_URL=https://www.otm.com.br`n- auditoria de diff contra origin/main"
$prNumber = gh pr view --json number --jq .number
gh pr checks $prNumber --watch --interval 10
```

Expected: `Verify production safety` passa. Integrar por rebase somente se `origin/main` continuar compatível e o diff continuar restrito.

- [ ] **Step 4: Aguardar deployment de produção e verificar o domínio**

Obter a URL do deployment de produção mais recente criado após a integração:

```powershell
npx vercel ls otimiza-site
$productionUrl = Read-Host 'Cole a URL exata do novo deployment Production listado acima'
npx vercel inspect $productionUrl --wait --timeout 3m
```

Confirmar `READY` e que `www.otm.com.br` consta entre os aliases desse deployment. Se a URL, o ambiente ou o alias não corresponderem inequivocamente à integração recém-feita, interromper sem promover outro deployment.

Repetir as verificações de metadata do preview no domínio público e confirmar novamente:

```html
<html lang="pt-BR">
```

- [ ] **Step 5: Examinar logs pós-deploy**

```bash
npx vercel logs $productionUrl --level error --since 15m --limit 20 --expand --no-branch
```

Classificar avisos preexistentes separadamente de falhas reais. Não corrigir avisos fora do SEO nesta branch.
