# Padronização dos títulos internos

## Objetivo

Usar o título principal de “Quem Somos” como referência visual e de movimento
para os títulos de “Nossa Abordagem” e “O Que Fazemos”.

“Home” e “Cases” ficam explicitamente fora deste trabalho.

## Design

- Manter o texto, alinhamento, cor, peso tipográfico especial e composição de
  cada página.
- Padronizar o tamanho responsivo em
  `clamp(4.35rem, 8.35vw, 7.35rem)` e a altura de linha em `0.92`.
- Padronizar a animação por caractere com atraso de `100 ms`, duração de
  `0.6 s`, easing `power3.out`, opacidade de `0` para `1` e deslocamento
  vertical de `40 px` para `0`.
- Preservar `threshold: 0.1` e `rootMargin: -100px`.
- Centralizar o preset de animação em um módulo compartilhado para impedir
  divergências futuras entre os três títulos.

## Testes

- Um teste unitário validará o contrato do preset compartilhado.
- Os testes das páginas validarão que “Nossa Abordagem” e “O Que Fazemos”
  usam o mesmo tamanho e a mesma animação de “Quem Somos”.
- A suíte relacionada e o build serão executados após a alteração.
