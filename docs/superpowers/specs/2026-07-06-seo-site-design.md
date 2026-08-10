# SEO do site Otimiza — Design

## Objetivo

Melhorar o SEO técnico e editorial das páginas públicas do site Otimiza sem alterar
o design, sem inventar dados comerciais e sem introduzir dependências quando os
recursos nativos do React, Vite e Vercel forem suficientes.

## Contexto atual

- Aplicação React 19 construída com Vite e publicada como SPA.
- Rotas declaradas com React Router em `src/App.jsx`.
- Páginas públicas estáticas e rotas dinâmicas para cases e posts do Inspire.
- Metadados globais limitados a viewport, favicon e um title genérico em
  `index.html`.
- `PostDetail.jsx` altera apenas o title e `og:image`, diretamente no DOM.
- Conteúdo dinâmico obtido do Sanity, com conteúdo local de fallback.
- Hospedagem configurada para Vercel por meio de `vercel.json`.
- O repositório não contém uma URL pública canônica confirmada.

## Dados comerciais confirmados no projeto

- Nome: Otimiza.
- Atuação: consultoria, tecnologia e desenvolvimento de pessoas por meio da
  Academia Otimiza.
- Endereço: Rua Frei Pacífico, 260 — São José, Caxias do Sul — RS, 95032-380.
- E-mail: otm@otm.com.br.
- Redes sociais: Facebook, YouTube, Instagram e LinkedIn, conforme os links
  existentes no rodapé e na página de contato.
- Telefone: não encontrado; não será incluído.

## Arquitetura proposta

### Catálogo de SEO

Criar um catálogo central de metadados para todas as rotas estáticas. Cada entrada
terá title, description, caminho canônico e dados sociais coerentes. Rotas
dinâmicas combinarão esse padrão com os dados reais carregados do case ou post.

### Gerenciador de head

Criar um componente React pequeno e sem dependências externas para sincronizar
title, meta description, canonical, robots, Open Graph, Twitter Cards e JSON-LD
com a rota exibida. O componente removerá ou atualizará nós gerenciados por ele
para evitar duplicações durante a navegação da SPA.

### URL pública

Usar `VITE_SITE_URL` como fonte da origem pública HTTPS. Enquanto o domínio não
estiver confirmado, o projeto terá um marcador explícito e documentado, sem
deduzir o domínio a partir do e-mail. Build e testes validarão que URLs absolutas
usam HTTPS quando a variável estiver configurada.

### Conteúdo e semântica

Auditar cada página na ordem exigida: title, description, H1, hierarquia de
headings, imagens e conteúdo. Alterações editoriais usarão somente fatos já
presentes nas páginas, dados locais, cases e conteúdo do Sanity. Texto adicional
só será criado quando acrescentar informação útil; a meta de 300 palavras não
será aplicada artificialmente a páginas utilitárias.

### Arquivos para crawlers

Gerar `robots.txt` e `sitemap.xml` por mecanismo de build, usando a mesma origem
pública e uma lista explícita de rotas indexáveis. Rotas dinâmicas serão incluídas
somente quando seus slugs puderem ser obtidos com segurança durante o build;
caso contrário, a limitação será documentada.

### Hospedagem e compressão

Manter a configuração SPA da Vercel e acrescentar somente cabeçalhos ou
redirecionamentos que sejam suportados e verificáveis no repositório. Brotli/Gzip
gerenciados exclusivamente pela plataforma serão documentados com uma forma de
verificação, sem adicionar compressão duplicada ao bundle.

## Testes e verificação

Cada uma das 18 etapas será executada isoladamente:

1. criar ou ampliar uma verificação que demonstre o requisito;
2. confirmar a falha quando houver comportamento ausente;
3. implementar a menor alteração necessária;
4. executar o teste direcionado e as verificações relacionadas;
5. inspecionar o HTML ou DOM gerado quando aplicável;
6. registrar a evidência antes de avançar.

Ao final serão executados testes completos, lint e build, seguidos de inspeção dos
metadados, JSON-LD, favicon, robots.txt e sitemap.xml.

## Restrições

- Preservar alterações locais existentes e evitar refatorações não relacionadas.
- Não modificar o design ou fluxos funcionais.
- Não inventar telefone, domínio, avaliações, preços ou outros fatos.
- Não criar commit, push ou deploy.
- Manter apenas uma etapa SEO em andamento.
