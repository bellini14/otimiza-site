# Recuperação segura da versão publicada

## Objetivo

Consolidar apenas as alterações aprovadas sobre o `main`, sem reutilizar a pasta antiga como fonte de deploy e sem permitir que uma recuperação substitua recursos já publicados.

## Fonte de verdade

`main` é a única fonte de produção. Toda mudança parte do `main`, é isolada em uma branch e chega à Vercel somente após merge e validação.

## Escopo aprovado

- Preservar: origem de produção em previews, favicon, contagem de likes, título e descrição da home, metadados de compartilhamento, botão do WhatsApp, correção de logos duplicados e teste de mídias legadas.
- Não recuperar: layout antigo da home, cópias locais do Inspire e do carrossel relacionado, importadores do WordPress, versões bilíngue e Insights Blog, arquivos de saída, logos soltos e acervo histórico no repositório.
- A alteração antiga do carrossel de "Nossas Soluções" foi descartada pelo usuário. Isso não inclui o carrossel de logos de clientes: a correção contra logos duplicados permanece aprovada.

## Ordem de entrega

1. Estabilizar a suíte: alinhar os testes da home ao comportamento já publicado do carrossel de logos e do painel de soluções, sem alterar a interface. Essa correção foi aprovada separadamente e não recupera o carrossel antigo de "Nossas Soluções".
2. SEO e compartilhamento: favicon, título e descrição da home, além de metadados de compartilhamento.
3. WhatsApp: componente e testes isolados.
4. Logos e compatibilidade: correção de logos duplicados e teste de mídias legadas.
5. Origem em preview: ajuste isolado para páginas compartilháveis em ambiente de preview, validado apenas em preview e sem promoção direta à produção.

Cada etapa será um PR independente, com testes e preview. Não haverá deploy direto da pasta antiga.

## Barreiras operacionais

- Nenhum PR reutilizará uma branch antiga ou fará cherry-pick de diretórios completos.
- Cada PR terá uma lista explícita de arquivos permitidos; qualquer arquivo adicional, remoção ou asset será bloqueado para revisão antes do merge.
- O diff será comparado diretamente com o `main` atual antes da abertura e antes do merge.
- O preview é somente validação. Produção continua sendo criada exclusivamente pelo merge no `main`.

## Critérios de aceite

- A suíte de testes parte verde antes das recuperações.
- Cada PR altera apenas seu bloco aprovado.
- Produção permanece vinculada exclusivamente ao `main`.
- Nenhum arquivo de backup, saída ou executável entra no repositório.
