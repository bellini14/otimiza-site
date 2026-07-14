# Technology Image Infinite Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Manter o mosaico da seção de tecnologia em movimento vertical contínuo, sem fim vazio ou parada entre ciclos.

**Architecture:** Cada coluna terá um trilho com dois ciclos idênticos e de altura exata. CSS específico deslocará o trilho em 50% de sua altura e repetirá a animação infinitamente.

**Tech Stack:** React 19, Tailwind CSS 3, CSS, Vitest, Testing Library.

---

### Task 1: Regressão e correção do trilho

**Files:**
- Modify: `src/components/TechnologySection.test.jsx`
- Modify: `src/components/TechnologySection.jsx`
- Modify: `src/index.css`

- [ ] Adicionar teste que exige dois ciclos idênticos em cada coluna e animação CSS infinita.
- [ ] Executar o teste e confirmar a falha pelo comportamento ausente.
- [ ] Implementar os ciclos duplicados e os keyframes específicos.
- [ ] Executar o teste isolado e a suíte completa.
- [ ] Executar o build de produção.
