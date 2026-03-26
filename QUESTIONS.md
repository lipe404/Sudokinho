# QUESTIONS – Sudokinho

Este arquivo reúne perguntas e pontos de atenção técnicos para orientar decisões de arquitetura, refatoração, performance, segurança e DX. Responda diretamente a cada pergunta abaixo para desbloquear as próximas melhorias.

**Referências de código** usam links clicáveis para facilitar a navegação.

## Visão Geral

- Qual é a visão de produto do Sudokinho (solo/PWA offline, ranking online, skins, achievements), e quais objetivos priorizar na próxima iteração?
  Resposta: É um jogo solo, pwa offiline, mas com skins e achievements.
- O projeto deve permanecer 100% client-side, ou teremos backend ativo (ranking, perfis, armazenamento remoto)?
  Resposta: Sem backend por enquanto, apenas 100% client-side
- Qual é o público-alvo e dispositivos prioritários (mobile-first, low-end, desktop)?
  Resposta: Mobile-first
- Há metas de acessibilidade (WCAG AA), tamanho de bundle e tempo de carregamento a cumprir?
  Resposta: As mais acessiveis e perfomaticas possíveis

## Performance

- Devemos mover animações do grid [AnimationManager](file:///c:/Users/toled/Documents/GitHub/Sudokinho/js/animations/AnimationManager.js#L7-L32) para `requestAnimationFrame` ou reduzir sombras/transições para dispositivos low‑end?
  Resposta : Sim, melhorar perfomance
- O tamanho/qualidade das imagens de “porquinhos” está adequado? Convertendo para `avif` com compressão mais agressiva melhora tempo de carregamento perceptível?
  Resposta: Esta adequadro, mas melhorar perfomance
- Precisamos de um limite/cancelamento para geração muito demorada de Sudoku com fallback em dificuldades altas?
  Resposta: Sim
- Há interesse em medições RUM (Web Vitals) e logs de performance (tempo para gerar, preencher, resolver)?
  Resposta: Sim

## Segurança (Front-end)

- Em [ModalManager.showCustomAlert](file:///c:/Users/toled/Documents/GitHub/Sudokinho/js/ui/ModalManager.js#L19-L33) inserimos HTML condicionalmente via `innerHTML`. Como as strings são internas, o risco é baixo, mas queremos endurecer com sanitização ou aceitar somente DOM safe-list?
  Resposta: Sim
- Há risco de XSS via dados persistidos (localStorage) refletidos em UI no futuro? Devemos normatizar uma camada de encode/sanitize de UI?
  Resposta: Sim
- Como tratar resets de armazenamento para privacidade (limpar saves/achievements/stats facilmente)? Incluímos botão de “Limpar dados”?
  Resposta: Limar saver e incluir botao limpar dados

## Segurança (Back-end API de Ranking)

- O backend opcional em [api/server.js](file:///c:/Users/toled/Documents/GitHub/Sudokinho/api/server.js#L1-L12) deve usar variáveis de ambiente (Mongo URI, porta) e gerenciar erros de conexão? Adotamos `dotenv` e validação?
  Resposta: Nao utilizar dotenv
- Precisamos de validação de entrada (nome/tempo), limites de taxa (rate-limit) e CORS restrito em [endpoints](file:///c:/Users/toled/Documents/GitHub/Sudokinho/api/server.js#L22-L36)?
  Resposta: Sim
- O ranking aceita apenas cliente confiável? Precisamos de assinatura do score (anti-cheat) ou vamos aceitar submissões honestas?
  Resposta: Inserir anti cheat
- Há plano de deploy do backend (prod/staging), logs e observabilidade? Será mantido neste repositório ou separado?
  Resposta: sem backend por enquanto

## Achievements

- O armazenamento de conquistas em [AchievementsSystem](file:///c:/Users/toled/Documents/GitHub/Sudokinho/js/utils/AchievementsSystem.js#L86-L107) deveria ser versionado/namespaced para migrações?
  Resposta: Sim, versionar
- Regras de desbloqueio por tempo (1–10 min) consideram apenas vitórias manuais; manter assim é desejado? Devemos bloquear conquistas se “resolver” foi acionado pelo sistema?
  Resposta: Sim, auditar e refinar
- Queremos exibir uma tela de progresso contínuo de achievements ou manter apenas o modal atual [GameController.showAchievementsList](file:///c:/Users/toled/Documents/GitHub/Sudokinho/js/game/GameController.js#L987-L1023)?
  Resposta: Criar progresso continuo

## Qualidade, Tooling e CI

- Devemos adicionar lint/format (ESLint + Prettier) e scripts de verificação? Qual padrão seguir (airbnb/base)?
  Resposta: Não necesário
- Queremos TypeScript para tipagem leve nas áreas “core” (gerador/validador) para reduzir erros e facilitar testes?
  Respotsa: Sim
- Vale adicionar testes unitários para o core de Sudoku (geração, solver, validador) e testes de integração de UI (Playwright)?
  Resposta: Sim
- Há interesse em GitHub Actions para rodar lint/teste e publicar PWA (ex.: para GitHub Pages)?
  Resposta: Não necessário

## Build/Deploy

- Precisamos de bundler (Vite/Rollup) ou manter módulos ES estáticos é suficiente? Queremos gerar bundles otimizados para produção (minify, tree‑shaking)?
  REsposta: Manter es estático
- Vamos suportar navegadores legados ou apenas “módulos ES” modernos?
  Resposta: Apenas modulos es modernos
- Queremos pipeline para gerar ícones em múltiplos tamanhos e manifest automatizado?
  resposta: Sim, manifest automatizao

## Internacionalização

- O jogo é 100% pt-BR. Há plano de i18n (pt/en/es)? Se sim, centralizamos mensagens em catálogos e removemos strings hardcoded de [index.html](file:///c:/Users/toled/Documents/GitHub/Sudokinho/index.html#L31-L101) e módulos?
  REsposta: 100% BR

## API de Ranking (Opcional)

- A API em [api/server.js](file:///c:/Users/toled/Documents/GitHub/Sudokinho/api/server.js#L1-L36) será parte do produto? Se sim, adicionamos validação (Joi/Zod), Helmet, rate limit, logs, autenticação (mínima) e testes?
  Rsposta: Sim
- Vamos integrar a UI ao ranking (exibir top‑10, enviar score quando o jogador vencer manualmente)? Quais critérios de envio (dificuldade, sem “resolver”, sem dicas)?
  Resposta: exibir top 10, enviar score quando vencer manualmente, e nao enviar se clicar em resolver
- Desejamos mover este backend para repositório separado com pipeline (Docker) ou mantemos junto ao front?
  Resposta: Não

## Roadmap de Melhorias (para priorizar após respostas)

- Unificar regras de Sudoku em módulo puro + testes.
- Corrigir variáveis CSS, fontes e paths PWA.
- Refatorar SaveManager (bug de escopo) e versionar saves.
- Implementar focus trap e navegação por teclado no grid.
- Considerar Web Worker para geração/validação.
- Otimizar imagens (avif) e remover áudio do pre‑cache.
- Adicionar lint/tests/CI e planejar deploy (ex.: GitHub Pages).
