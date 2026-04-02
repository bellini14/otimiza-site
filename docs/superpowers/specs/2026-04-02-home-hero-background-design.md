# Home Hero Background Design

**Date:** 2026-04-02
**Topic:** Atualizacao do background da hero da home

## Objective

Substituir apenas o background atual da hero por uma atmosfera inspirada no bloco de bloqueio enviado como referencia, mantendo o conteudo, os CTAs e a estrutura principal da secao.

## Approved Direction

- Direcao visual: `1 / SVG filtrado com distorcao animada`
- Escopo: somente background da hero
- Conteudo preservado: headline, copy e botoes atuais

## Visual Structure

O palco da hero continua ocupando a primeira dobra em full width, mas o fundo passa a usar um SVG absoluto com faixas verticais creme e pretas, blur pesado e distorcao para simular um veu liquido como na referencia. O comportamento visual deve lembrar metal fluido ou tecido luminoso, com leitura vertical forte e contraste alto.

## Motion and Interaction

Nao ha interacao com mouse. O movimento deve ser autonomo, lento e continuo, feito com animacoes nas faixas do SVG para manter fidelidade maxima ao efeito de veu.

## Implementation Notes

- Manter `data-testid="hero-stage"`.
- Trocar apenas as camadas decorativas dentro da hero por um layer SVG e um scrim discreto.
- Garantir contraste suficiente para o texto atual em desktop e mobile.
- Preservar comportamento seguro para `prefers-reduced-motion`.
