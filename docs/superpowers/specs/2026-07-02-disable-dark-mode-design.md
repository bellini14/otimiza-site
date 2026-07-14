# Desativação temporária do modo escuro

## Objetivo

Manter o site exclusivamente no tema claro e remover do cabeçalho o controle que ativa o modo escuro.

## Design

O `Header` deixa de renderizar o botão de tema e de manter estado para a preferência visual. Ao montar, ele remove uma eventual classe `dark` do elemento raiz e apaga a preferência `theme` do `localStorage`, impedindo que uma seleção antiga mantenha o site escuro.

As regras CSS do tema escuro permanecem no projeto para facilitar uma possível reativação futura. O teste do cabeçalho deve comprovar que uma preferência antiga é descartada, a classe `dark` é removida e nenhum controle de tema é exibido.

## Escopo

- Modificar `src/components/Header.jsx`.
- Atualizar `src/components/Header.test.jsx`.
- Não remover estilos escuros nem alterar outros componentes.
