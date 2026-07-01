# Escala de 5% do menu

## Objetivo

Ampliar visualmente o menu principal do site em 5%, preservando suas proporções atuais.

## Solução

Aplicar uma escala uniforme de `1.05` ao contêiner visual completo do menu. A origem da transformação ficará no centro superior para preservar o alinhamento horizontal e a posição junto ao topo.

A escala será aplicada tanto ao estado superior quanto ao estado flutuante do cabeçalho, em desktop e mobile. Logo, textos, ícones, botões e espaços visuais crescerão juntos.

## Restrições

- Não alterar valores existentes de `margin`, `padding`, `gap` ou posicionamento.
- Não redimensionar elementos internos individualmente.
- Preservar abertura do menu mobile, troca de tema, navegação e comportamento de ocultação durante a rolagem.
- Evitar que a transformação de escala interfira nas transformações usadas para esconder e exibir a navegação.

## Verificação

- Adicionar uma asserção automatizada para a escala e sua origem.
- Executar os testes do cabeçalho.
- Executar a compilação de produção.
- Conferir visualmente o cabeçalho em viewport desktop e mobile.
