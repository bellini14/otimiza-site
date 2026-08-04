# Checkup completo da experiência — Memorial Silvana Bettiol

**Data:** 2026-08-04  
**Rota:** `/silvana-bettiol`  
**Status:** pronto para implementação

## Contexto

A landing page é um ambiente exclusivo, acessível apenas pelo link, criado como homenagem a Silvana Tiburi Bettiol. Ela reúne uma apresentação visual com vídeo e um mural compartilhado de lembranças. O acesso à publicação é restrito a e-mails previamente autorizados, cada e-mail pode manter apenas uma lembrança ativa e a autoria pode ser ocultada.

A página já está em produção, mas a evolução incremental do vídeo, do formulário e do fundo animado deixou transições frágeis, espaços excessivos durante o scroll e estados de interface pouco claros. O objetivo deste trabalho é consolidar a experiência inteira, preservando a identidade aprovada e a API existente.

## Abordagem escolhida

Será feita uma refatoração equilibrada: manter conteúdo, identidade visual, rota, contratos de API e regras de negócio, mas reorganizar estados, animações e ciclo de vida dos componentes onde isso elimina bugs e reduz complexidade.

Alternativas consideradas:

1. **Correções pontuais:** menor risco imediato, mas manteria a lógica acumulada de scroll e estados ambíguos do formulário.
2. **Refatoração equilibrada — escolhida:** corrige a arquitetura das interações sem alterar o produto nem exigir migração de dados.
3. **Redesign completo:** permitiria maior liberdade visual, porém aumentaria prazo e risco sem necessidade para os problemas atuais.

## Objetivos

- Tornar o percurso título → vídeo → formulário → mural contínuo, sem grandes vazios ou saltos.
- Garantir animações fluidas e previsíveis em desktop, tablet, celular e celular em paisagem.
- Tornar os estados do formulário claros e acessíveis: confirmar acesso, publicar, editar e excluir.
- Representar carregamento, sucesso, erro, vazio e tentativa novamente de forma honesta.
- Reduzir trabalho contínuo desnecessário de scroll, vídeo e WebGL.
- Preservar uma lembrança por e-mail, publicação anônima opcional e recuperação por e-mail em outro navegador.
- Manter a página fora da navegação e indexação pública do site.

## Fora de escopo

- Alterar a lista de convidados ou o modelo de autorização.
- Mudar o banco de dados, os endpoints ou o formato persistido das lembranças.
- Adicionar autenticação por senha, envio de e-mail ou painel administrativo.
- Redesenhar a identidade da Otimiza ou o conceito visual já aprovado.
- Incorporar a página à navegação principal.

## Problemas identificados

### Fluxo e estados

- Falha ao carregar o mural é apresentada como mural vazio, podendo sugerir incorretamente que não existem lembranças.
- O modo de exclusão reutiliza a interface de escrita e pode exibir título e ação principal incompatíveis com a confirmação de exclusão.
- A ação de editar no post-it não conduz claramente o usuário ao formulário nem posiciona o foco no campo correto.
- Estados ocupados, mensagens de sucesso e erros não têm semântica consistente para tecnologias assistivas.
- Uma atualização do mural substitui o conteúdo em vez de manter a última versão visível durante a sincronização.

### Scroll e vídeo

- A sequência pequeno → grande → pequeno depende de uma seção muito alta e compensações negativas, o que cria distância excessiva entre os conteúdos.
- Leituras de geometria e atualização de estilos dependem apenas de eventos globais de scroll e resize, sem observar mudanças reais do contêiner.
- A animação não diferencia suficientemente mudanças de viewport, orientação e barras móveis do navegador.
- Vídeo e fundo continuam consumindo recursos mesmo fora de foco ou quando a aba está oculta.

### Fundo animado

- Valores padrão de vetores são recriados em renderizações do React e podem reinicializar o canvas WebGL sem necessidade.
- O loop de renderização continua ativo quando a página está oculta e em cenários de movimento reduzido.
- Redimensionamento e densidade de pixels precisam de limites mais robustos para celulares de alta resolução.

### Confiabilidade e responsividade

- Respostas inválidas ou vazias da API podem produzir erros técnicos pouco compreensíveis.
- Breakpoints atuais não cobrem bem celulares em paisagem, tablets pequenos e mudanças de orientação.
- Espaçamento, altura visível e áreas tocáveis precisam respeitar `svh`/`dvh`, safe areas e telas baixas.

## Experiência proposta

### 1. Hero

- Manter título, texto, poeira e hierarquia visual.
- Acrescentar uma indicação discreta de continuidade/scroll integrada ao vídeo, sem competir com a homenagem.
- Usar espaçamentos com `clamp()` e limites de altura para conservar respiro sem empurrar o vídeo para fora da primeira sequência visual.
- Capitalização permanece: “Silvana Tiburi Bettiol. Hoje é dia dela”.

### 2. Vídeo

- Preservar a narrativa pequeno → grande → pequeno.
- Usar uma única seção de scroll com contêiner sticky fixado no topo durante a contração final.
- Dividir o progresso em três fases contínuas:
  - expansão suave;
  - breve permanência em largura máxima;
  - contração lenta enquanto o bloco segue para o topo e sai naturalmente da viewport.
- O formulário começa logo após o fim físico da seção, sem margem negativa nem espaço artificial adicional.
- Desktop e tablet usam máscara horizontal; celular em retrato usa máscara 9:16, com o conteúdo do vídeo alinhado internamente à esquerda; celular em paisagem usa composição horizontal.
- A geometria será derivada do tamanho real do contêiner e da viewport, atualizada por `ResizeObserver`, mudança de orientação e um único pipeline via `requestAnimationFrame`.
- O vídeo permanece mudo, em loop, com reprodução inline e velocidade reduzida. Quando invisível ou com a aba oculta, deve pausar; ao voltar, retoma sem salto.
- Com movimento reduzido, a seção deixa de ser longa/sticky e mostra uma composição estática proporcional.

### 3. Formulário

O formulário terá quatro estados visuais distintos, mantendo o padrão minimalista do site:

1. **Acesso:** e-mail, botão de confirmação e atalho para quem já publicou.
2. **Nova lembrança:** mensagem, contador até 280 caracteres, opção de exibir nome e ação de publicar.
3. **Edição:** conteúdo atual, opção de autoria, salvar e excluir.
4. **Confirmação de exclusão:** painel curto e específico, nova confirmação do e-mail, aviso de consequência, cancelar e excluir. Nenhum campo ou botão de publicação aparece nesse estado.

Regras de interação:

- Ao concluir uma etapa, o foco avança para o primeiro controle relevante da próxima.
- Ao clicar em editar no próprio post-it ou em “Gostaria de editar ou excluir minha mensagem”, a página rola suavemente até o formulário e posiciona o foco, respeitando movimento reduzido.
- Rascunho é preservado quando a sessão expira e restaurado após nova confirmação.
- Botões usam texto de progresso durante requisições; o formulário usa `aria-busy`.
- Erros usam `role="alert"`; confirmações usam `role="status"` e não roubam foco indevidamente.
- Controles têm alvo mínimo de 44 px, estados de foco visíveis e ordem de teclado lógica.

### 4. Mural

- O contador continuará indicando a quantidade de lembranças guardadas.
- O carregamento inicial mostra estrutura leve de notas; uma atualização mantém notas existentes e sinaliza apenas sincronização.
- Erro de carregamento mostra mensagem clara e botão “Tentar novamente”; nunca é tratado como estado vazio.
- Estado vazio convida a pessoa a ser a primeira lembrança.
- Post-its mantêm tamanhos proporcionais ao texto, rotação orgânica e pino, com limites para evitar quebra em telas estreitas.
- A ação de editar/excluir continua visível apenas no navegador que possui a identificação local da lembrança.
- O post-it recém-criado ou atualizado recebe destaque transitório discreto, sem flash agressivo.

### 5. Rodapé

- Manter a opção “Gostaria de editar ou excluir minha mensagem” para recuperação em outro navegador.
- A ação passa a conduzir ao estado de gerenciamento do formulário com feedback visual e foco apropriado.

## Arquitetura de componentes

### `SilvanaMemorial`

Será o coordenador dos dados e do fluxo entre formulário e mural. Manterá separadamente:

- `notes`: última lista válida;
- `notesStatus`: `loading`, `ready`, `refreshing` ou `error`;
- `notesError`: mensagem recuperável;
- `editingNote` e `manageRequest`: comandos explícitos ao formulário;
- `highlightedNoteId`: nota recém-alterada.

O carregamento inicial e a atualização usarão a mesma função, mas a atualização não apagará a lista válida. A função será passada ao mural para tentativa novamente.

### `MemorialAccessForm`

Continuará encapsulando a sessão de acesso, porém a renderização será separada por modo em vez de compartilhar uma árvore ambígua. Transições internas serão explícitas e idempotentes. Referências de foco serão expostas apenas por comandos de props, sem consulta global por seletor.

### `MemorialBoard`

Receberá status, erro, callback de retry e identificação da nota destacada. Não fará chamadas de rede.

### `MemorialVideo`

Concentrará observação de geometria, visibilidade e reprodução. A matemática de fases permanecerá em função pura testável; o componente só aplica as variáveis CSS resultantes.

### `MemorialDust`

Usará constantes estáveis para valores padrão, limite de DPR, observação de tamanho e suspensão do loop quando a página estiver oculta ou a animação for desabilitada. A aparência aprovada será preservada.

### `memorialApi`

Continuará expondo as mesmas funções. A camada comum de requisição tratará resposta vazia, JSON inválido, erro HTTP, falha de rede e timeout com mensagens consistentes. Não haverá repetição automática de operações de escrita; apenas a listagem poderá ser refeita explicitamente pelo usuário.

## Movimento e desempenho

- Somente um callback de scroll agenda um frame por vez.
- Cálculos de layout serão agrupados antes das escritas de estilo.
- `ResizeObserver` evita depender de resize global para alterações do componente.
- `IntersectionObserver` controla reprodução do vídeo e permite suspender trabalho fora da viewport.
- O canvas será pausado em `visibilitychange` e quando animação estiver desabilitada.
- DPR será limitado para equilibrar nitidez e custo de GPU.
- Todos os observers, listeners, frames e timers serão removidos no unmount.
- `prefers-reduced-motion` remove scroll prolongado, interpolação e destaque animado.

## Responsividade

Matriz mínima:

- desktop: 1440×900 e 1280×720;
- tablet: 1024×768 e 768×1024;
- celular retrato: 390×844 e 360×640;
- celular paisagem: 844×390;
- alteração de orientação durante a sessão;
- zoom de navegador e fontes maiores em 200% quando aplicável.

Critérios:

- nenhum scroll horizontal;
- vídeo não distorce nem perde o enquadramento definido;
- formulário e post-its não ultrapassam a viewport;
- áreas de toque permanecem utilizáveis;
- teclado virtual não encobre a ação principal de forma irreversível;
- conteúdos adjacentes não ficam separados por vazios maiores que uma viewport.

## Acessibilidade

- Estrutura semântica com um único `h1` e sequência coerente de títulos.
- Labels visíveis e associação explícita aos campos.
- Foco visível, navegação por teclado e foco programático apenas após ações do usuário.
- Contador e mensagens anunciados com parcimônia.
- Contraste mantido no padrão visual da Otimiza.
- Alternativa funcional completa com movimento reduzido e sem WebGL.
- Vídeo decorativo permanece sem som e não exige controle para compreender ou usar a página.

## Tratamento de erros

- Erro ao listar: preservar dados já carregados, mostrar aviso e permitir nova tentativa.
- E-mail não autorizado: mensagem junto ao campo e foco mantido.
- Sessão expirada: preservar rascunho, retornar ao acesso e explicar a necessidade de confirmar novamente.
- Conflito de uma lembrança por e-mail: carregar a lembrança existente e oferecer edição.
- Falha ao salvar/excluir: manter campos e estado, reabilitar ações e mostrar mensagem clara.
- Falha de reprodução ou WebGL: a página continua funcional com quadro estático/fundo simples.

## Estratégia de testes

### Testes automatizados

- Função de fases do vídeo: limites, monotonicidade, plateau e transições.
- Formulário: acesso, publicação anônima/nomeada, edição, confirmação de exclusão, cancelamento, sessão expirada e rascunho.
- Página: carregamento, atualização sem flicker, erro com retry, gerenciamento e destaque.
- Mural: skeleton, vazio, erro, notas e ação exclusiva do proprietário local.
- API: sucesso, resposta vazia, JSON inválido, erro HTTP, rede e timeout.
- Dust/vídeo: limpeza de listeners/observers, aba oculta, visibilidade e movimento reduzido.

### Validação manual no navegador

- Percorrer a matriz de viewports definida acima.
- Executar o fluxo completo de acesso, criação, edição e exclusão.
- Confirmar comportamento em outro navegador/localStorage vazio.
- Testar teclado, foco, movimento reduzido, aba em segundo plano e retorno.
- Confirmar ausência de erros no console, layout shift expressivo e requisições duplicadas.

## Publicação e segurança

- Executar build e conjunto completo de testes antes da publicação.
- Publicar a partir de uma árvore limpa contendo somente as alterações aprovadas.
- Preservar variáveis de ambiente e dados de produção.
- Validar a rota de produção e a API após o deploy.
- Confirmar `noindex` e ausência de link na navegação/sitemap.

## Critérios de aceitação

- A sequência do vídeo é pequeno → largura máxima → pequeno no topo, sem saltos, distorção ou espaços excessivos.
- O enquadramento móvel é vertical, centralizado pela região esquerda do vídeo, e muda adequadamente em paisagem.
- Formulário apresenta um único propósito por estado e permite concluir todos os fluxos por teclado e toque.
- Exclusão exige novo e-mail e, após excluir, o mesmo e-mail pode publicar novamente.
- Erro do mural não aparece como vazio e oferece tentativa novamente.
- A última lista válida não desaparece durante atualização.
- Movimento reduzido, ausência de WebGL e falha de vídeo não impedem o uso.
- Não há erros de console, vazamentos observáveis de listeners/frames ou scroll horizontal na matriz de dispositivos.
- Testes automatizados e build passam.
- A versão validada fica disponível em `https://otimiza-site.vercel.app/silvana-bettiol`.
