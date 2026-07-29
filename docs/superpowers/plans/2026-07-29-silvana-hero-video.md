# Silvana Hero Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir o vídeo enviado no hero do memorial em câmera lenta a `0.5×`, permanentemente sem som.

**Architecture:** O MP4 será servido como asset estático em `public/media`. `MemorialVideo` ganhará defaults explícitos para a mídia bundled, áudio e velocidade, preservando overrides por variável de ambiente e o comportamento de expansão existente.

**Tech Stack:** React, HTML5 Video, Vite, Vitest, Testing Library.

---

### Task 1: Proteger o comportamento do vídeo

**Files:**
- Create: `src/components/memorial/MemorialVideo.test.jsx`
- Modify: `src/components/memorial/MemorialVideo.jsx`

- [ ] **Step 1: Escrever o teste que descreve o vídeo padrão**

Renderizar `MemorialVideo` sem props e exigir:

- `src="/media/silvana-homenagem.mp4"`;
- botão “Ativar som do vídeo” presente;
- no mount, `playbackRate` e `defaultPlaybackRate` iguais a `0.5`;
- após redefinir a velocidade e disparar `loadedMetadata`, ambos reaplicados
  como `0.5`;
- atributos `autoplay`, `loop`, `muted` e `playsinline`.

Testar também uma função pura de resolução dos defaults:

- nenhum botão ou controle de áudio é renderizado;
- fontes bundled e externas permanecem mudas.

- [ ] **Step 2: Confirmar que o teste falha**

Run: `npx vitest run src/components/memorial/MemorialVideo.test.jsx`

Expected: FAIL porque o componente ainda usa fonte vazia e não define velocidade.

- [ ] **Step 3: Implementar os defaults mínimos**

Definir a fonte bundled, exportar uma pequena função pura que resolva a fonte
conforme a spec e aplicar `setSlowPlayback` no mount e em
`onLoadedMetadata`.

- [ ] **Step 4: Confirmar que o teste passa**

Run: `npx vitest run src/components/memorial/MemorialVideo.test.jsx`

Expected: PASS.

### Task 2: Adicionar a mídia e validar

**Files:**
- Create: `public/media/silvana-homenagem.mp4`
- Verify: `src/pages/SilvanaMemorial.css`

- [ ] **Step 1: Copiar o arquivo aprovado**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "public\media"
Copy-Item -LiteralPath "C:\Users\Joao\Desktop\WhatsApp Video 2026-07-29 at 10.25.56.mp4" -Destination "public\media\silvana-homenagem.mp4"
```

- [ ] **Step 2: Executar testes e lint**

Run:

```powershell
npx vitest run src/components/memorial/MemorialVideo.test.jsx src/pages/SilvanaMemorial.test.jsx src/SilvanaRoute.test.jsx
npx eslint "src/components/memorial/MemorialVideo.jsx" "src/components/memorial/MemorialVideo.test.jsx"
```

Expected: todos concluem sem erros.

- [ ] **Step 3: Executar o build**

Run: `npm run build`

Depois, executar:

```powershell
Test-Path -LiteralPath "dist\media\silvana-homenagem.mp4"
(Get-FileHash -Algorithm SHA256 "public\media\silvana-homenagem.mp4").Hash -eq (Get-FileHash -Algorithm SHA256 "dist\media\silvana-homenagem.mp4").Hash
```

Expected: build concluído e os dois comandos retornam `True`, comprovando que o
asset foi copiado sem recodificação.

- [ ] **Step 4: Verificar no localhost**

Se a porta `5173` não estiver servindo o projeto, iniciar:

```powershell
$env:MEMORIAL_QA_MODE='1'
npm run dev -- --host localhost --port 5173 --strictPort
```

Em `http://localhost:5173/silvana-bettiol`, confirmar que o vídeo:

- inicia silencioso;
- está em `0.5×`;
- permanece sem som e sem controle de áudio;
- cresce durante o scroll;
- mantém enquadramento correto em desktop e mobile.

Encerrar somente o processo Vite iniciado nesta tarefa. Se o localhost já
estava ativo ou o usuário pediu que permanecesse publicado, deixá-lo rodando.

- [ ] **Step 5: Commit**

```powershell
git add -- "src/components/memorial/MemorialVideo.jsx" "src/components/memorial/MemorialVideo.test.jsx" "public/media/silvana-homenagem.mp4"
git commit -m "feat: add slow-motion Silvana hero video"
```
