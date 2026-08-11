# Inspire 155 — E-mail Editorial

## Objetivo

Refatorar o HTML do e-mail editorial Inspire e produzir a edição 155, com uma abertura para o artigo **“Extensão das Adjacências: A segunda avenida”**. O resultado deve preservar a identidade visual da Otimiza e ser legível, responsivo e seguro nos principais clientes de e-mail.

## Escopo

- Criar uma versão HTML completa e autocontida para disparo.
- Entregar separadamente o conteúdo a ser colado no campo **Custom Head HTML** da plataforma de disparo.
- Trocar a abertura atual pela seção de Rafael Andreolla:
  - selo/título de seção: `2ª Avenida — Extensão das Adjacências`;
  - título do artigo: `Extensão das Adjacências: A segunda avenida`;
  - texto integral listado em [Conteúdo do hero](#conteúdo-do-hero);
  - imagem da estrada sinuosa com motociclista fornecida pelo solicitante em `C:\Users\Joao\AppData\Local\Temp\codex-clipboard-6521ce67-4ecb-4bd9-b8ba-ea448995f049.png`;
  - CTA com a variável visível `{{LINK_ARTIGO_PRINCIPAL}}`, a ser substituída pela URL definitiva do post quando ele for publicado.
- Identificar a edição como **Inspire 155 — Editorial agosto de 2026**.
- Incluir os quatro posts mais recentes disponíveis no Inspire que não sejam dicas:
  1. `Eureka, Heurística e o Planejamento Estratégico` — 28/07/2026.
  2. `Difícil de copiar` — 21/07/2026.
  3. `Há uma diferença colossal entre a teoria e a prática.` — 13/07/2026.
4. `Maximização do core: a primeira avenida` — 03/07/2026.
- Não incluir postagens cujo título ou categoria seja uma dica de leitura ou de conteúdo para assistir.

## Arquitetura do e-mail

O HTML usará tabelas de apresentação (`role="presentation"`) como estrutura principal, com uma tabela externa de 100% e um container central de 600 px. Os estilos essenciais permanecerão inline. As classes no Custom Head serão complementares: usadas para o empilhamento e os ajustes de leitura em telas estreitas, nunca como única fonte de um estilo crítico.

Cada bloco será independente e poderá falhar graciosamente:

1. Pré-cabeçalho oculto, com resumo da edição para a caixa de entrada.
2. Cabeçalho com a marca Otimiza e identificação da edição.
3. Hero editorial com a imagem, título, introdução e CTA da nova avenida.
4. Área “Artigos selecionados” com quatro cards verticais, cada qual contendo imagem, categoria, título, resumo e link.
5. Rodapé institucional com dados de contato e os links exigidos pela plataforma de disparo, caso já presentes no HTML-base.

## Conteúdo do hero

O hero renderizará os parágrafos abaixo na mesma ordem, com os dois primeiros em destaque editorial quando o espaço permitir:

> Negócios bem-sucedidos são construídos a partir de um conjunto de capacidades: saber executar, desenvolver processos fluidos, conhecer o mercado construindo relações de confiança. Com o tempo, essa combinação se transforma em ativos para a abertura de novas perspectivas estratégicas.

> Ter a empresa na palma da mão, conhecendo suas capacidades, relacionamentos e recursos podem revelar oportunidades que antes não estavam visíveis.

> É nesse contexto que nossa narrativa continua. Neste segundo capítulo, apresentamos a segunda avenida do crescimento: a extensão das adjacências.

> Como uma nova pista a ser desenhada, ela abre caminhos para oportunidades próximas ao território já dominado. Há novos desafios e riscos, mas também oportunidades valiosas: a experiência acumulada nos trajetos anteriores.

> A segunda avenida parte daquilo que está construído e sabemos fazer bem.

> Até onde esse progresso poderá nos levar?

> Acompanhe o segundo capítulo desta série inspiradora para fortalecer estratégias para o seu negócio.

O CTA exibirá `Ler o segundo capítulo` e terá `href="{{LINK_ARTIGO_PRINCIPAL}}"`. A imagem terá `src="{{IMAGEM_ARTIGO_PRINCIPAL_URL}}"` e o texto alternativo `Estrada sinuosa em meio à vegetação, com motociclista em curva.`. A imagem anexa é a fonte do ativo; antes do envio, ela deverá estar publicada em URL HTTPS acessível publicamente (idealmente, na mídia do post novo).

## Custom Head HTML

O bloco para o campo Custom Head HTML terá somente elementos próprios para o interior de `<head>`: metadados de viewport e de reformatagem Apple, instruções condicionais para Outlook e CSS seguro.

- `meta viewport`, `x-apple-disable-message-reformatting` e `format-detection` reduzem zoom, mudanças de tamanho e autolinks indesejados em aplicativos móveis.
- `mso` condicional define pixels por polegada e mantém a renderização previsível no Outlook para Windows.
- Reset de `body`, `table`, `td`, `img` e links previne margens, espaçamentos e bordas inesperadas.
- As media queries usam apenas classes de apoio já existentes no markup: largura fluida, colunas empilhadas, padding móvel e tipografia mais compacta.
- O corpo usará uma pilha de fontes de sistema. Fontes Adobe podem continuar como melhoria visual, mas não serão requisito para leitura.

## Dados e links

O HTML-base para a refatoração é o anexo `C:\Users\Joao\.codex\attachments\8d2409e8-33c9-4023-ae6a-f295d07a57f0\pasted-text.txt`. A entrega será composta por dois arquivos: o HTML de corpo completo e um fragmento exclusivo para o campo **Custom Head HTML**.

Durante esta primeira entrega, o CTA do novo artigo permanecerá claramente marcado pela variável `{{LINK_ARTIGO_PRINCIPAL}}`. A criação do post e a inclusão dos links finais serão a próxima etapa, solicitada separadamente. Os cards selecionados usarão os dados abaixo, obtidos do acervo do Inspire:

| Artigo | Categoria exibida | Resumo | Imagem | Link público |
| --- | --- | --- | --- | --- |
| Eureka, Heurística e o Planejamento Estratégico | Artigos | Visão Sistêmica e o papel do planejamento para transformar situações existentes em situações desejáveis. | `https://cdn.sanity.io/images/igy822g7/production/64eff8303eb1d6106a9ba42cde882a8e2820ba07-819x1024.gif` | `https://www.otm.com.br/2026/07/28/eureka-heuristica-e-o-planejamento-estrategico/` |
| Difícil de copiar | Artigos | Uma reflexão sobre diferenciais construídos a partir da realidade de uma vinícola. | `https://cdn.sanity.io/images/igy822g7/production/3e2c021ea082b92fa6a3155a91d92a2ac3e5f74b-1139x640.png` | `https://www.otm.com.br/2026/07/21/dificil-de-copiar/` |
| Há uma diferença colossal entre a teoria e a prática. | Artigos | Como transformar referências, livros e ferramentas em soluções para desafios reais. | `https://cdn.sanity.io/images/igy822g7/production/3484c2d21a15d284685be7da1021d451a564d3d3-522x253.png` | `https://www.otm.com.br/2026/07/13/ha-uma-diferenca-colossal-entre-a-teoria-e-a-pratica/` |
| Maximização do core: a primeira avenida | Estratégia | O primeiro capítulo sobre fortalecer o que a organização já construiu antes de avançar. | `https://cdn.sanity.io/images/igy822g7/production/a7e56c2f168f92dc319cf6a578001586add12c90-860x643.png` | `https://www.otm.com.br/2026/07/03/gestao-do-core-a-primeira-avenida/` |

Os quatro cards terão um CTA `Ler artigo`, com o link público correspondente.

## Critérios de aceitação

- O HTML não contém dependências de layout em `div`, flexbox, JavaScript ou CSS externo.
- Em desktop, o conteúdo permanece em uma coluna editorial de 600 px.
- Em telas de até 600 px, imagens ocupam a largura disponível e blocos em colunas se empilham.
- O conteúdo legível não depende do carregamento da fonte Adobe.
- Todas as imagens incluem `alt` útil, largura explícita e CSS responsivo.
- Os quatro artigos selecionados correspondem à curadoria acima e não incluem Dicas.
- O CTA do hero pode receber a URL final sem alterar a estrutura do e-mail, substituindo somente `{{LINK_ARTIGO_PRINCIPAL}}` e `{{IMAGEM_ARTIGO_PRINCIPAL_URL}}`.

## Verificação

- Validar a presença dos metadados e CSS no Custom Head HTML.
- Fazer uma checagem estrutural do HTML para confirmar tabelas de apresentação, links, `alt` em imagens e ausência de JavaScript.
- Visualizar em viewport desktop e mobile antes da entrega.
