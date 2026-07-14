# Alinhamento da suíte de testes ao site atual

## Objetivo

Eliminar as falhas da suíte sem alterar o comportamento, o conteúdo ou o visual atuais do site.

## Escopo

- Configurar o Vitest para não coletar testes dentro de `.worktrees/**`.
- Restaurar o contrato ausente de proporção do ícone usado por `overlayGeometry.js` em um módulo isolado, sem conectar essa geometria ao runtime atual.
- Atualizar os testes de `Home`, `HomeClientLogos` e `FeaturesSection` para validar a implementação que já existe no workspace.
- Preservar integralmente `Home.jsx`, `FeaturesSection.jsx`, `ScrollVelocity.jsx`, `index.css` e os demais componentes visuais.
- Não tratar neste trabalho os avisos não bloqueantes de `act(...)`, `inspireCategory` ou API depreciada do Sanity.

## Estratégia

### Isolamento dos worktrees

Adicionar `.worktrees/**` ao `test.exclude` sem perder as exclusões padrão do Vitest. A suíte deve contabilizar somente os arquivos de teste do workspace principal, incluindo o novo teste dedicado de `ScrollVelocity`, e não pode listar caminhos sob `.worktrees`.

### Geometria da transição

Criar `src/transitions/navigationOrigin.js` exportando `OTIMIZA_ICON_ASPECT_RATIO`, derivado do `viewBox` atual do ícone Otimiza (`985.8 / 854.7`). O módulo satisfaz a dependência já declarada por `overlayGeometry.js`; nenhum componente de produção será reescrito.

Adicionar uma asserção direta de que `OTIMIZA_ICON_ASPECT_RATIO` é exatamente `985.8 / 854.7`, além dos testes geométricos existentes.

### Testes de interface

- `FeaturesSection.test.jsx`: substituir a expectativa do container removido `max-w-[1320px]` pelo contrato atual `home-menu-shell`.
- `Home.test.jsx`: validar a aplicação global atual da fonte, a altura em `home-hero__split` e a composição real do hero, sem exigir seletores eliminados.
- `HomeClientLogos.test.jsx`: validar a integração atual com `ScrollVelocity` por sua fronteira pública. Um mock controlado do componente registrará as props recebidas e renderizará os itens fornecidos; as asserções verificarão `texts` com duas linhas, `velocity={40}`, conteúdo balanceado e repetição suficiente. A alternância de direção pertence internamente a `ScrollVelocity` e não será duplicada no teste de `Home`. O espaçamento responsivo continuará validado pelas classes atuais passadas nos itens. Não serão usados seletores internos do Motion, classes antigas do marquee ou leitura textual da implementação de `ScrollVelocity`.
- Criar `ScrollVelocity.test.jsx` para cobrir o contrato próprio do componente. Hooks de `motion/react` serão controlados no teste, as callbacks de animação serão executadas com delta conhecido e os valores de movimento das duas linhas serão observados. Com `velocity={40}`, a primeira linha deve avançar no sentido positivo e a segunda no negativo; o teste também confirmará o número padrão de cópias. Isso preserva a cobertura da alternância sem mudar `ScrollVelocity.jsx`.

As asserções continuarão orientadas a comportamento e estrutura pública; não serão simplesmente removidas para obter uma suíte verde.

## Verificação

- Antes de qualquer edição, registrar hashes SHA-256 de `Home.jsx`, `FeaturesSection.jsx`, `ScrollVelocity.jsx` e `index.css`.
- Confirmar inicialmente as falhas focalizadas.
- Executar cada arquivo de teste após sua correção.
- Executar `npm test` e confirmar que `.worktrees` não foi coletado e que não há falhas.
- Executar `npm run build`.
- Recalcular os hashes SHA-256 dos quatro arquivos protegidos e exigir igualdade com o baseline, além de inspecionar o diff dos arquivos efetivamente modificados.
