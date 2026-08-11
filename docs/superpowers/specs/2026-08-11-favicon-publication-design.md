# Publicação consistente do favicon

## Objetivo

Garantir que navegadores e serviços externos encontrem o favicon oficial da Otimiza, inclusive quando procuram pelo caminho convencional `/favicon.ico`.

## Estado atual

- O documento declara apenas `/favicon.svg`.
- `public/favicon.png` já contém uma alternativa rasterizada da mesma marca, mas não é declarada.
- `favicon.ico` está na raiz do repositório; o Vite não o publica em produção.
- Em produção, `/favicon.ico` é reescrito para `index.html`, o que impede consumidores que usam esse caminho de obter um ícone válido.

## Desenho aprovado

1. Publicar o arquivo ICO existente em `public/favicon.ico`.
2. Declarar SVG como formato principal e PNG/ICO como alternativas no `<head>`.
3. Adicionar o sufixo de versão `v=20260811` aos caminhos declarados. A versão cria uma URL nova para invalidar caches persistentes de navegadores e indexadores.
4. Manter a arte oficial existente sem redesenho ou alteração visual.

## Comportamento verificável

- O build contém `favicon.svg`, `favicon.png` e `favicon.ico` na raiz de `dist`.
- O `index.html` declara os três formatos com a mesma versão.
- `/favicon.ico` deixa de ser atendido pelo fallback da SPA e passa a retornar um arquivo ICO.

## Riscos e limites

- Serviços de terceiros podem manter o ícone anterior até seu próximo rastreamento; a nova URL e o ICO válido permitem a atualização, mas não controlam o prazo do crawler.
- A alteração não modifica a marca nem outras imagens do projeto.
