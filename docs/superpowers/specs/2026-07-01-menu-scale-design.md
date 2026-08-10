# Escala de 5% do menu

## Objetivo

Ampliar visualmente o menu principal do site em 10,25% sobre o tamanho original, preservando suas proporções atuais. O valor corresponde a dois aumentos sucessivos de 5% (`1,05 × 1,05 = 1,1025`).

## Solução

Aplicar uma escala de layout uniforme de `1.1025` ao contêiner visual completo do menu. O mecanismo de layout do `zoom` preservará a largura disponível e os limites laterais existentes.

A escala será aplicada tanto ao estado superior quanto ao estado flutuante do cabeçalho, em desktop e mobile. Logo, textos, ícones, botões e espaços visuais crescerão juntos. A implementação não deverá usar composição GPU no contêiner completo, evitando a rasterização e a perda de nitidez dos SVGs.

## Restrições

- Não alterar valores existentes de `margin`, `padding`, `gap` ou posicionamento.
- Não redimensionar elementos internos individualmente.
- Preservar abertura do menu mobile, troca de tema, navegação e comportamento de ocultação durante a rolagem.
- Preservar a renderização vetorial nítida do logo e dos ícones SVG.

## Verificação

- Adicionar uma asserção automatizada para a escala e sua origem.
- Executar os testes do cabeçalho.
- Executar a compilação de produção.
- Conferir visualmente o cabeçalho em viewport desktop e mobile.
