# Favicon Otimiza em SVG

## Objetivo

Substituir o favicon atual do site pelo arquivo `imagens/favicon otimiza.svg` adicionado pelo usuário.

## Abordagem

- Copiar o conteúdo do novo arquivo para `public/favicon.svg`, mantendo uma URL pública simples e estável.
- Substituir intencionalmente todo o conteúdo local atual de `public/favicon.svg`; esse arquivo passa a ser uma cópia exata do SVG de origem.
- Atualizar apenas a declaração de favicon em `index.html` para `type="image/svg+xml"` e `href="/favicon.svg"`.
- Preservar todas as demais alterações locais existentes em `index.html` e não modificar outros arquivos de implementação.

## Verificação

- Executar o build do projeto.
- Comparar os hashes SHA-256 de `imagens/favicon otimiza.svg`, `public/favicon.svg` e `dist/favicon.svg`; os três devem ser idênticos.
- Confirmar em `dist/index.html` a declaração exata `rel="icon" type="image/svg+xml" href="/favicon.svg"`.
- Inspecionar `git diff -- index.html public/favicon.svg` para garantir que somente a declaração do favicon mudou em `index.html` e que `public/favicon.svg` corresponde integralmente ao arquivo de origem.
