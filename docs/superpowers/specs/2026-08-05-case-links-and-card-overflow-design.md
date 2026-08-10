# Case Links and Card Overflow Design

## Problema confirmado

Os 12 documentos `clientLogo` marcados com `showOnCases` no Sanity estão com `caseSlug: null` e sem `caseContent`. Depois da atualização dos nomes empresariais, sete registros deixaram de coincidir com as chaves do portfólio estático. O frontend passou a criar slugs a partir do nome completo, como `banco-moneo-s-a`, enquanto o detalhe estático existe em `banco-moneo`.

Na Home, a mesma divergência impede `normalizeHomeCases` de localizar o resumo editorial curto. O componente usa então a descrição extensa do CMS dentro de um card quadrado cujo rodapé é absoluto, fazendo texto e identificação do cliente se sobreporem.

## Catálogo canônico

Criar um módulo compartilhado de resolução de slugs com as seguintes chaves e aliases:

| Slug canônico | Aliases reconhecidos |
| --- | --- |
| `banco-moneo` | Banco Moneo; Banco Moneo S.A.; `banco-moneo-s-a`; `moneo` |
| `bontempo` | Bontempo; Bontempo – Novatempo Franchising Ltda. |
| `santa-clara` | Santa Clara; Cooperativa Santa Clara |
| `sulmaq` | Sulmaq; Sulmaq Máquinas |
| `unicasa` | Unicasa; Unicasa Indústria de Móveis S.A. |
| `unimed-vtrp` | Unimed VTRP; Unimed Vales do Taquari e Rio Pardo |
| `zen` | Zen; Zen S.A. |
| `cinex` | Cinex |
| `hospital-bruno-born` | Hospital Bruno Born |
| `master-power` | Master Power; Masterpower Turbo; `masterpower-turbo` |
| `neobus` | Neobus |
| `tabone` | Tabone |

O resolvedor recebe `caseSlug` e/ou `name`, normaliza caixa, acentos e pontuação e retorna o slug canônico quando o case é conhecido. A precedência é determinística:

1. slug e nome apontando para o mesmo case conhecido retornam o canônico;
2. slug conhecido sem nome reconhecido retorna o canônico do slug;
3. slug desconhecido com nome conhecido retorna o canônico do nome, corrigindo slugs legados ou incorretos;
4. slug e nome apontando para cases conhecidos diferentes são considerados inconsistentes e não produzem link;
5. slug desconhecido com nome desconhecido é preservado apenas como candidato CMS, nunca como evidência suficiente de conteúdo publicável.

Um case CMS desconhecido só recebe link se tiver `caseSlug` explícito, `caseTitle`, `caseDescription` e `caseContent` não vazio. A consulta da listagem expõe um booleano `hasCaseContent` sem transferir todo o Portable Text. Registros incompletos continuam visíveis como clientes/cases, mas sem “Ler mais”, evitando uma página de detalhe vazia.

## Integração

- `homeCases.js` usa o resolvedor para reconhecer os registros empresariais e sempre entrega exatamente os 10 cases editoriais já aprovados, na ordem atual: Banco Moneo, Bontempo, Cinex, Hospital Bruno Born, Masterpower Turbo, Neobus, Santa Clara, Sulmaq, Tabone e Unicasa. Para cada item, preserva empresa, resumo e slug do fallback e aproveita logo, alt e setor do CMS correspondente. Unimed VTRP, Zen e desconhecidos não entram nesse carrossel enquanto não receberem um resumo editorial aprovado.
- `Cases.jsx` usa o mesmo resolvedor. Os 12 cases conhecidos recebem links canônicos; registros CMS desconhecidos só recebem link quando passam pelo contrato de conteúdo publicável acima.
- `CaseDetail.jsx` canonicaliza o parâmetro da rota. Um alias legado conhecido redireciona com `replace` para `/cases/<slug-canônico>` antes de renderizar o detalhe definitivo. A consulta, o portfólio estático, a imagem hero e o SEO passam a operar somente com o slug canônico, eliminando URL duplicada e imagem default indevida.

## Layout do card

O card da Home passa a ser uma coluna flexível com overflow protegido. O bloco de identificação deixa de ser absoluto, usa `margin-top: auto` e não encolhe. O resumo recebe limite explícito de linhas também em telas maiores. Assim, descrições inesperadamente extensas nunca atravessam a borda divisória ou o nome do cliente.

## Verificação

- Testar todos os aliases, conflitos de slug/nome e a política de conteúdo publicável para cases desconhecidos.
- Reproduzir no normalizador os 12 registros com o formato real do Sanity e exigir exatamente os 10 fallbacks editoriais, na ordem aprovada, com slugs/resumos canônicos e ativos do CMS.
- Exigir links canônicos nos 12 cases conhecidos da página de Cases, ausência de link em CMS desconhecido incompleto e link em desconhecido completo.
- Exigir redirect de alias legado para URL canônica e, após o redirect, título, conteúdo e hero corretos no detalhe.
- Exigir no card a estrutura flexível, rodapé não absoluto e resumo limitado.
- Executar testes focados, build e verificação visual responsiva.
- Fazer deployment isolado, validar Home, `/cases` e um detalhe em produção e então promover para `otm.com.br`.
