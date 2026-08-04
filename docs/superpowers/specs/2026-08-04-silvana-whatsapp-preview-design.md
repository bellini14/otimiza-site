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
- URL canônica: `https://otimiza-site.vercel.app/silvana-bettiol`

## Solução

A arte será adicionada aos arquivos públicos com um nome estável e descritivo.
O gerador de SEO estático passará a produzir um HTML exclusivo para
`/silvana-bettiol`, contendo `title`, descrição, Open Graph e Twitter Card com
os valores aprovados. A regra da Vercel para essa rota apontará para esse HTML,
permitindo que o crawler do WhatsApp encontre os metadados sem executar React.

O componente React do memorial receberá os mesmos valores em `SeoHead`, para
manter o título da aba e os metadados coerentes após a hidratação. Nenhum texto
visível ou comportamento do memorial será alterado.

## Isolamento

A rota será incluída como uma entrada própria nos metadados estáticos. A imagem
social padrão e os metadados das demais rotas continuarão iguais. A mudança não
afeta o mural, o formulário de lembranças, o vídeo, a indexação bloqueada do
memorial ou as APIs.

## Tratamento de falhas

O build deve falhar se o arquivo da imagem social exclusiva não estiver
disponível, evitando publicar uma prévia incompleta. A URL da imagem será
absoluta no HTML final, conforme exigido pelos crawlers sociais.

## Verificação

Testes automatizados devem confirmar que:

1. `/silvana-bettiol.html` é gerado com título, descrição e imagem exclusivos;
2. os metadados Open Graph e Twitter Card usam uma URL absoluta;
3. a regra da Vercel encaminha `/silvana-bettiol` para o HTML exclusivo;
4. outra rota mantém seus metadados atuais;
5. o componente React do memorial usa os mesmos valores.

Após o build, o HTML gerado será inspecionado diretamente. A validação final no
WhatsApp depende de um deploy, e uma prévia antiga pode permanecer em cache por
algum tempo.
