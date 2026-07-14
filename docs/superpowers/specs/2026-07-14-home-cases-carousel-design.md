# Carrossel de cases na Home

## Objetivo

Transformar o atual carrossel de depoimentos da Home em uma vitrine de 10 cases reais já publicados na página Cases.

## Conteúdo

- Atualizar a mensagem institucional para “Mais de mil clientes”.
- Usar os 10 primeiros cases completos e visíveis da página Cases, preservando a mesma ordenação do Sanity.
- Cada card exibe o logo da empresa, um resumo curto do trabalho realizado, o nome da empresa e sua área de atuação.
- Remover foto, nome e cargo de pessoas, aspas e linguagem de depoimento.
- Manter um fallback local equivalente para o carrossel continuar completo caso a consulta ao CMS falhe.

## Interface e comportamento

O carrossel infinito, o arraste, a centralização do card ativo, os fades laterais e o CTA “Confira todos os cases” permanecem. O card conserva a linguagem visual existente, mas o logo passa a ocupar uma área clara e contida no topo; o resumo ocupa o centro; empresa e setor formam o rodapé informativo. Os cards continuam responsivos e acessíveis, com texto alternativo no logo e identificação semântica do case.

## Dados

A Home consulta documentos `clientLogo` com `showOnCases == true` na mesma ordem da página Cases. A consulta traz nome, setor, descrição, slug e URL do logo. Uma função de normalização descarta registros sem empresa, setor ou logo e somente então seleciona os 10 primeiros, garantindo sempre 10 cards ao completar eventuais lacunas com os fallbacks correspondentes. Os resumos editoriais locais são intencionais: condensam os resultados detalhados de `caseStudies.js` no formato curto pedido para o carrossel, em vez de simplesmente repetir as descrições extensas do CMS. Os fallbacks mantêm esses mesmos 10 cases disponíveis durante falhas de rede, sem introduzir empresas diferentes das publicadas em Cases.

A alteração de “400 empresas” para “mais de mil clientes” se restringe ao parágrafo institucional desta seção; título, CTA e demais blocos da Home permanecem inalterados.

## Testes

- Validar a nova mensagem “Mais de mil clientes”.
- Validar que os 10 cases e seus três campos textuais aparecem no carrossel.
- Validar que logos substituem fotos e que não há aspas ou autoria de depoimento.
- Preservar os testes atuais de arraste, loop, responsividade e CTA.
- Executar testes focados, suíte completa, lint e build.
