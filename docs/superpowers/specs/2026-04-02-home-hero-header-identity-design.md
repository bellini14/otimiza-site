# Home Hero And Header Identity Design

**Date:** 2026-04-02
**Topic:** Recriacao da hero da home e insercao da identidade Otimiza no header

## Objective

Atualizar a home para aproximar a hero do print enviado, preservando o background interativo atual como base, e inserir a identidade visual da Otimiza no menu com logotipo, fonte Typekit e paleta centrada em `#434b54`.

## Approved Direction

- Hero com composicao centralizada
- Headline, subtitulo, campo de e-mail e CTA inspirados no print
- Background atual preservado via `GradientBlinds`, mas recolorido e filtrado com luzes diagonais, haze frio e texturas suaves
- Header full width em estado boxed, com margem lateral confortavel
- Navegacao atual preservada
- Marca textual substituida pelo SVG `logo otimiza.svg`
- Fonte Typekit `https://use.typekit.net/hrm4pwi.css` instalada no site
- Textos, bordas e botoes do header usando `#434b54`

## Hero Structure

A hero continua ocupando a primeira dobra em largura total, mas passa a priorizar leitura central e respiro vertical. O conteudo fica em uma coluna unica, alinhada ao centro, com titulo amplo, subtitulo mais curto e formulario de captura em uma linha no desktop e empilhado no mobile. Elementos laterais da versao atual, como cards flutuantes e hint tecnico, saem da composicao para reduzir ruido.

## Background Treatment

O `GradientBlinds` permanece como base dinamica do fundo. A mudanca e de direcao artistica: tons quentes e contrastes pesados saem de cena para dar lugar a cinzas azulados, branco frio e `#434b54`, com sobreposicoes em diagonal para simular o brilho macio do print de referencia. O efeito precisa continuar vivo, mas subordinado ao texto.

## Header Treatment

O menu preserva dropdowns, toggle de tema, links e CTAs ja existentes. A mudanca principal esta na identidade: o logotipo SVG entra no canto esquerdo, o header assume composicao boxed dentro de uma faixa full width e os controles passam a conversar com a paleta Otimiza. A estrutura deve continuar responsiva e sem regressao na navegacao mobile.

## Verification Notes

- Atualizar testes da hero para refletir headline central, input de e-mail e CTA
- Atualizar testes do header para validar o logotipo
- Validar build e comportamento responsivo sem quebrar o `GradientBlinds`
