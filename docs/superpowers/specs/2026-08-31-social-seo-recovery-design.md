# Recuperação de SEO para links compartilháveis

## Objetivo

Recuperar somente os metadados sociais que estiveram publicados em 13 de agosto de 2026 e foram substituídos no deployment seguinte, mantendo integralmente o estado visual e funcional atual do site e preservando a declaração `<html lang="pt-BR">`.

## Linha de base imutável

- Base Git: `origin/main` no commit `6f2a4d7` (`fix: declare Brazilian Portuguese document language`).
- Produção de referência: `https://www.otm.com.br`, deployment `dpl_CuqYwKES6Ak9YbNCudPMKE654r5B`.
- O arquivo `index.html`, os componentes React, os estilos, o conteúdo visível, as APIs e os schemas do Sanity não serão modificados.
- O commit local histórico `e4f9ff1484df5d4cb2ad1f99990c4643819d4ae3` será a única referência de comportamento. A branch local e a branch remota de mesmo nome apontam para estados diferentes; nenhuma delas será mesclada, promovida nem publicada.

## Escopo

### Posts do Inspire

- Consultar também a descrição do post no Sanity.
- Usar a imagem principal e, se ela não existir, a primeira imagem do conteúdo.
- Se o post não tiver nenhuma dessas imagens, omitir `og:image`, seus metadados auxiliares e `twitter:image`; não usar o hero genérico como fallback. Essa regra prevalece sobre a assinatura histórica que ainda recebia `fallbackImageUrl`.
- Para imagens servidas por `cdn.sanity.io`, gerar uma URL social com `w=1200`, `h=630`, `fit=crop`, `fm=jpg` e `q=82`.
- Gerar `og:title`, `og:description`, `og:type=article`, `og:url`, `og:image`, `og:image:type`, `og:image:width`, `og:image:height` e as tags Twitter equivalentes.
- Manter as URLs canônicas datadas já usadas pelos botões de compartilhamento.

### Páginas estáticas

- Manter os títulos, descrições e canonicals atuais do catálogo `staticPageMetadata`.
- Usar imagens específicas já empacotadas no build:
  - home: imagem hero padrão atual;
  - `/quem-somos`: imagem `hero quem somos`;
  - `/nossa-abordagem`: imagem `shutterstock_2714404709`;
  - `/inspire`: `inspire-newsletter-card.png`, preservando o título e a descrição atuais da página;
  - `/inspire/newsletter`: título, descrição e imagem próprios da newsletter já existentes;
  - demais rotas: fallback hero atual.
- Acrescentar tipo, largura e altura da imagem Open Graph sem alterar a renderização da página.

### Cases

- Gerar HTML social estático em `cases/<slug>/index.html` somente para documentos retornados pela consulta `*[_type == "clientLogo" && isVisible != false && showOnCases == true]` do Sanity.
- Usar `src/data/caseStudies.js` como única fonte local e `resolveCaseStudySlug` para relacionar nomes conhecidos aos slugs atuais.
- Aplicar a seguinte precedência por campo:
  - slug: `caseSlug.current` do Sanity; se ausente, slug resolvido pelo nome local conhecido;
  - título: `caseTitle` do Sanity; se ausente, título do case local; se ainda ausente, nome do cliente;
  - descrição: `caseDescription` do Sanity; se ausente, subtítulo do case local; se ainda ausente, texto curto `Case de consultoria da Otimiza para <nome>.`;
  - imagem: hero local específico do case; se ausente, imagem do logo retornada pelo Sanity; se ambas estiverem ausentes, não gerar tags de imagem.
- Restaurar exatamente o mapa `buildLocalCaseHeroImages` do commit de referência, sem selecionar imagens novas:
  - `banco-moneo` e `moneo`: `https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=82`;
  - `bontempo` e `unicasa`: `https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1800&q=82`;
  - `sulmaq`, `neobus`, `zen`, `tabone`, `cinex` e `master-power`: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=82`;
  - `unimed-vtrp` e `hospital-bruno-born`: `https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1800&q=82`;
  - `santa-clara`: `https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=1800&q=82`.
- Gerar título, descrição, canonical, `og:type=article`, imagem específica e tags Twitter para cada case.
- Não modificar as rotas React ou o conteúdo visual dos cases.

## Arquivos permitidos

- Criar `scripts/generate-case-social-pages.mjs`.
- Criar `scripts/generate-case-social-pages.test.mjs`.
- Modificar `scripts/generate-post-social-pages.mjs`.
- Modificar `scripts/generate-post-social-pages.test.mjs`.
- Modificar `scripts/generate-static-seo.mjs`.
- Modificar `scripts/generate-static-seo.test.js`.
- Adicionar somente documentos de especificação e plano em `docs/superpowers/`.

Qualquer necessidade de alterar outro arquivo interrompe a implementação para nova avaliação.

## Fluxo de build

1. O Vite gera o site atual sem mudanças de UI.
2. `generate-static-seo.mjs` lê o `dist/index.html` produzido.
3. O gerador cria as páginas estáticas atuais com metadados sociais específicos por rota.
4. O gerador de posts cria as URLs datadas com imagens otimizadas.
5. O gerador de cases cria os documentos sociais por slug.
6. A aplicação cliente continua hidratando e navegando com os mesmos componentes atuais.

## Tratamento de falhas

- Falhar o build se o asset hero obrigatório não existir.
- Falhar o build se a consulta de posts ou cases retornar erro ou formato inválido.
- Ignorar somente registros sem data/slug válidos, contabilizando-os como `skipped`.
- Escapar todo conteúdo inserido nas tags HTML.
- Não inserir tags de imagem quando a URL estiver ausente. Uma URL fornecida, mas malformada, deve falhar no teste/geração em vez de produzir metadata inválida.

## Estratégia de testes

- Seguir TDD: cada comportamento recuperado deve ter um teste que falhe na `main` atual antes da implementação.
- Cobrir imagem principal, imagem do conteúdo, ausência intencional de fallback, transformação Sanity 1200×630, descrição e metadados Open Graph/Twitter dos posts.
- Cobrir geração, fallback local, slug inválido e erro de consulta dos cases.
- Cobrir imagens específicas por rota e metadados de dimensão das páginas estáticas.
- Executar os testes focados de SEO e `src/indexLanguage.test.js`.
- Executar o build completo com `VITE_SITE_URL=https://www.otm.com.br`.
- Registrar, sem corrigir, as falhas preexistentes da suíte completa: 7 arquivos falhando, 4 testes falhando, 515 passando e 3 ignorados.

## Garantias de preservação

- O diff de produção deve se limitar aos seis arquivos de scripts/testes listados.
- `git diff origin/main -- index.html src package.json package-lock.json vercel.json` deve permanecer vazio.
- `src/indexLanguage.test.js` deve continuar passando e confirmar `lang="pt-BR"` sem bloqueio de tradução.
- O preview deve manter a aparência, textos e rotas atuais; somente o HTML recebido por crawlers terá os metadados recuperados.
- Antes da integração, comparar produção e preview para título visível, conteúdo, CSS e rotas principais.

## Publicação

- Criar preview isolado na Vercel usando `VITE_SITE_URL=https://www.otm.com.br` apenas no build.
- Validar `/`, `/inspire`, `/inspire/newsletter`, um post datado, `/quem-somos` e um case.
- Abrir PR contra `main` e aguardar o check obrigatório `Verify production safety`.
- Integrar somente se o diff continuar restrito e o check estiver verde.
- Confirmar que `www.otm.com.br` aponta para o novo deployment `READY`, que `lang="pt-BR"` permanece e que os metadados sociais esperados estão presentes.
