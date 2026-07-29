# Vídeo do hero do memorial da Silvana

## Objetivo

Usar o arquivo `WhatsApp Video 2026-07-29 at 10.25.56.mp4` como vídeo principal
da homenagem, com câmera lenta e o comportamento expansível já aprovado.

## Direção aprovada

- Copiar o arquivo para `public/media/silvana-homenagem.mp4`.
- Usar `/media/silvana-homenagem.mp4` como fonte padrão do componente.
- Preservar a possibilidade de sobrescrever a mídia por
  `VITE_SILVANA_VIDEO_URL`.
- Reproduzir automaticamente em `0.65×`, silencioso, em loop e com
  `playsInline`.
- Manter o botão de som, pois o arquivo contém trilhas de vídeo e áudio.
- Manter `object-fit: cover`, o enquadramento central e a expansão progressiva
  ao rolar.
- Não recodificar o arquivo: a câmera lenta será aplicada no navegador para não
  aumentar o tamanho nem introduzir perda de qualidade.

## Comportamento técnico

O componente ajustará `video.playbackRate` e `video.defaultPlaybackRate` para
`0.65` quando o elemento estiver disponível e após a leitura dos metadados.
Isso protege o comportamento caso o navegador redefina a velocidade ao carregar
a fonte.

## Verificação

- Um teste do componente deve exigir a fonte padrão e a velocidade `0.65`.
- O build deve incluir o vídeo estático.
- No localhost, o vídeo deve carregar, iniciar silencioso, expandir ao scroll e
  oferecer o controle de som.
