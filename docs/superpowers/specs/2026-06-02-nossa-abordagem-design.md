# Nossa Abordagem Design

## Objetivo

Criar a página `Nossa abordagem` a partir do PDF `Apresentação Otimiza.pdf`, mantendo cada página do PDF como um bloco de conteúdo no site. A página deve reorganizar visualmente o material para leitura web, sem adicionar novos textos institucionais.

## Conteúdo

- Usar as 13 páginas do PDF como 13 blocos na página.
- A página 1 não possui texto extraível; ela deve funcionar como bloco visual de abertura com a identidade Otimiza e o conceito do material, sem copy nova.
- As páginas 2 a 13 devem usar somente os textos extraídos do PDF.
- Não incluir chamadas comerciais, explicações extras, legendas novas ou conteúdo que não exista no PDF.

## Direção Visual

Usar a direção escolhida no companion: painéis comparativos. A página terá composição editorial sóbria, com blocos amplos, tipografia institucional e painéis em colunas quando o slide contrastar ideias.

## Estrutura

- Nova rota: `/nossa-abordagem`.
- O item do header `Nossa abordagem` deve ser habilitado e apontar para a nova rota.
- Cada bloco deve ter numeração discreta correspondente à página do PDF.
- Blocos com uma ideia principal usam layout editorial de leitura.
- Blocos com contraste ou listas paralelas usam painéis lado a lado.
- A lista de clientes da página 11 deve aparecer como grade escaneável, preservando os nomes.

## Testes e Verificação

- Teste de renderização da nova página.
- Teste de navegação no header para `Nossa abordagem`.
- Build do Vite.
- Verificação visual no navegador em desktop e mobile.
