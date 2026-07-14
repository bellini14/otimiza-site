# Ocultar depoimentos na página Cases

## Objetivo

Ocultar a seção de depoimentos somente na página `/cases`, preservando sua implementação, conteúdo e integração com o CMS.

## Design

Uma constante local em `src/pages/Cases.jsx` controlará a renderização da seção. Com a constante desativada, `CaseTestimonialsSection` permanece intacta no código, mas não é montada na página. As demais seções e qualquer uso de depoimentos fora de `/cases` não serão alterados.

## Verificação

O teste de integração de `Cases` confirmará que a seção não existe no DOM e que a seção de clientes continua disponível. Os testes específicos do componente continuarão protegendo seu comportamento preservado.
