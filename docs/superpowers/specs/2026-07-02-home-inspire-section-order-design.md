# Ordem das seções Inspire e Marcas na home

## Objetivo

Exibir o bloco Inspire imediatamente abaixo da hero e posicionar o bloco “Marcas que confiam na Otimiza” depois dele.

## Design

A alteração será feita na composição da página `Home`, movendo a renderização de `BlogHighlights` para antes da seção de marcas. Os componentes, estilos, conteúdo, comportamento dos carrosséis e a ordem das demais seções serão preservados.

A sequência final será:

1. Hero
2. Inspire
3. Marcas que confiam na Otimiza
4. Nossa tecnologia
5. Veja nossos cases de sucesso
6. Nossas Soluções

## Verificação

O teste da home deverá confirmar que o título do Inspire aparece no DOM antes do título da seção de marcas. A suíte relacionada à home será executada após a mudança.
