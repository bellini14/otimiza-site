# Publicação consistente do favicon

## Objetivo

Garantir que navegadores e serviços externos encontrem o favicon oficial da Otimiza, inclusive quando procuram pelo caminho convencional `/favicon.ico`.

## Estado atual

- O documento declara apenas `/favicon.svg`.
- `public/favicon.png` já contém uma alternativa rasterizada da mesma marca, mas não é declarada.
- `favicon.ico` está na raiz do repositório; o Vite não o publica em produção.
- Em produção, `/favicon.ico` é reescrito para `index.html`, o que impede consumidores que usam esse caminho de obter um ícone válido.

## Desenho aprovado

1. Copiar o ICO oficial existente da raiz para `public/favicon.ico`. O arquivo na raiz será mantido por ora para evitar uma alteração de escopo, e o teste garantirá que a cópia publicada é idêntica.
2. Declarar os ícones, nesta ordem, no `<head>`: SVG (`rel="icon"`, `type="image/svg+xml"`), PNG (`rel="icon"`, `type="image/png"`, `sizes="918x918"`) e ICO (`rel="icon"`, `type="image/x-icon"`). Como o projeto é publicado na raiz do domínio, os caminhos absolutos `/favicon.*` são o comportamento esperado.
3. Adicionar o sufixo de versão `v=20260811` aos links declarados. A versão cria URLs novas para invalidar caches persistentes dos consumidores que processam o HTML. Ela não muda o caminho convencional `/favicon.ico`, que continuará disponível e válido para consumidores que o consultam diretamente.
4. Manter a arte oficial existente sem redesenho ou alteração visual.

## Comportamento verificável

- O build contém `favicon.svg`, `favicon.png` e `favicon.ico` na raiz de `dist`.
- O `index.html` declara exatamente os três links especificados, todos com `v=20260811`, e cada `href` corresponde a um arquivo de `public`.
- O preview do build responde a `/favicon.ico` com `200`, um tipo de conteúdo de ícone/imagem e os quatro bytes iniciais `00 00 01 00`; a resposta não contém HTML nem o fallback da SPA.
- O ICO publicado é byte a byte idêntico à sua origem na raiz do repositório.

## Riscos e limites

- Serviços de terceiros podem manter o ícone anterior até seu próximo rastreamento; a nova URL e o ICO válido permitem a atualização, mas não controlam o prazo do crawler.
- A alteração não modifica a marca nem outras imagens do projeto.
