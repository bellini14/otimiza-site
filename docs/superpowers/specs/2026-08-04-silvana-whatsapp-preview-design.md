# Prévia do WhatsApp — aniversário da Silvana

**Rota:** `/silvana-bettiol`

## Objetivo

Substituir apenas a prévia social da rota do memorial quando o endereço for
compartilhado no WhatsApp. As demais páginas e prévias do site permanecem
inalteradas.

## Conteúdo aprovado

- Título: `05/08 é aniversário da Silvana`
- Descrição: `O que Silvana nos ensinou continua vivo em nós. Compartilhe uma lembrança.`
- Imagem: arte fornecida pelo usuário com o texto “Hoje seria aniversário da Silvana.”
- Caminho público da imagem: `/media/silvana-aniversario-05-08.png`
- URL canônica: `https://otimiza-site.vercel.app/silvana-bettiol`

## Solução

A arte será adicionada aos arquivos públicos com um nome estável e descritivo.
O gerador de SEO estático passará a produzir um HTML exclusivo para
`/silvana-bettiol`, contendo `title`, descrição, canonical, Open Graph, Twitter
Card e `robots` com os valores aprovados. A configuração da rota ficará
separada da lista de páginas indexáveis usada pelo sitemap. A regra da Vercel
para essa rota apontará para esse HTML, permitindo que o crawler do WhatsApp
encontre os metadados sem executar React.

O componente React do memorial receberá os mesmos valores em `SeoHead`, para
manter o título da aba e os metadados coerentes após a hidratação. Nenhum texto
visível ou comportamento do memorial será alterado.

## Isolamento

A rota terá uma configuração estática própria, separada de
`staticPageMetadata`, para que não seja adicionada ao sitemap. O HTML bruto
também terá `<meta name="robots" content="noindex, nofollow">`, preservando o
bloqueio mesmo quando JavaScript não for executado. A imagem social padrão e os
metadados das demais rotas continuarão iguais. A mudança não afeta o mural, o
formulário de lembranças, o vídeo ou as APIs.

## Tratamento de falhas

O build deve falhar se o arquivo da imagem social exclusiva não estiver
disponível, evitando publicar uma prévia incompleta. A URL da imagem será
absoluta no HTML final, conforme exigido pelos crawlers sociais.

## Verificação

Testes automatizados devem confirmar que:

1. `/silvana-bettiol.html` é gerado com os valores literais aprovados em
   `<title>`, `<meta name="description">`, `og:title`, `og:description`,
   `twitter:title` e `twitter:description`;
2. `og:image` e `twitter:image` usam exatamente a URL HTTPS absoluta terminada
   em `/media/silvana-aniversario-05-08.png`, enquanto `og:url` e a canonical
   usam exatamente a URL aprovada da rota;
3. o HTML bruto inclui `noindex, nofollow`;
4. a regra da Vercel encaminha `/silvana-bettiol` para o HTML exclusivo;
5. `/silvana-bettiol` continua ausente do `sitemap.xml`;
6. um teste de regressão confirma que os metadados e a imagem social de todas
   as rotas estáticas preexistentes permanecem iguais;
7. o componente React do memorial usa os mesmos valores.

Após o build, o HTML gerado será inspecionado diretamente. Depois do deploy, a
URL HTTPS pública da imagem deverá responder `200`, sem autenticação e com
`Content-Type: image/*`. A validação final no WhatsApp depende desse deploy, e
uma prévia antiga pode permanecer em cache por algum tempo.
