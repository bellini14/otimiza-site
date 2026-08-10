# Correção de quebra de palavras no menu mobile

## Objetivo

Impedir que os rótulos do menu mobile sejam quebrados no meio das palavras em navegadores e dispositivos com viewports estreitas, preservando a animação existente por caractere e sem introduzir estouro horizontal.

## Causa raiz

`AnimatedMobileMenuLabel` renderiza cada caractere em um `span` `inline-block`. Como cada letra se torna uma caixa independente, o navegador pode escolher qualquer fronteira entre caracteres como ponto de quebra de linha. Em larguras estreitas, palavras como “abordagem” e “fazemos” são fragmentadas e perdem legibilidade.

## Solução aprovada

Separar o texto em palavras e espaços. Cada palavra será envolvida por um contêiner `inline-block` que não permite quebra interna, enquanto suas letras continuarão em `span`s individuais para preservar a animação em cascata. Os espaços permanecem pontos de quebra válidos entre palavras.

O índice da animação continuará sendo calculado sobre a posição original de cada caractere, incluindo os espaços, para preservar o ritmo visual atual. O texto acessível completo continuará disponível em um único elemento `sr-only`.

## Responsividade e proteção contra regressões

- O link continuará limitado à largura disponível do painel.
- Frases com mais de uma palavra poderão quebrar apenas nos espaços.
- A largura mínima suportada será 280 px de viewport CSS. Nessa largura, a área útil do menu ainda comporta isoladamente a palavra mais longa com o tamanho mínimo atual de `1.9rem`, portanto não será necessário usar quebra arbitrária.
- Abaixo de 280 px, largura que fica fora do suporte explícito, o texto poderá reduzir fluidamente como proteção adicional, mas palavras não serão fragmentadas.
- O painel continuará usando unidades de viewport modernas e o comportamento visual atual de abertura e fechamento.
- O teste automatizado verificará a estrutura por palavra e confirmará que as letras continuam animadas individualmente com índices estáveis.

## Arquivos afetados

- `src/components/Header.jsx`: agrupar os caracteres por palavra dentro de `AnimatedMobileMenuLabel`.
- `src/index.css`: definir o contêiner de palavra como uma unidade indivisível e manter espaços como oportunidades de quebra.
- `src/components/Header.test.jsx`: adicionar cobertura de regressão para os rótulos compostos.

## Validação

- Executar primeiro o novo teste sem a correção e confirmar que ele falha pela ausência dos agrupamentos.
- Executar os testes focados do cabeçalho após a implementação.
- Executar toda a suíte, lint e build de produção.
- Inspecionar o menu aberto em larguras de 280, 320, 360, 375, 390 e 412 px.
- Confirmar ausência de overflow horizontal e de quebras internas em “Nossa”, “abordagem”, “fazemos” e demais palavras.
