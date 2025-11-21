# Sudokinho

Jogo de Sudoku em HTML, CSS e JavaScript, com suporte PWA, conquistas, modo de imagem (porquinhos), histórico de ações (undo/redo), dicas com cooldown e salvamento automático no `localStorage`.

## Recursos
- Geração de tabuleiro com solução única e remoção controlada de números
- Dicas com cooldown e animação visual
- Undo/Redo com histórico limitado e atualização dos botões
- Modo imagem alternável (números ↔ porquinhos) com pré-carregamento de imagens
- Timer integrado ao estado do jogo e persistência
- Salvamento automático e retomada de jogo via `localStorage`
- Sistema de conquistas com progresso e modal dedicado
- Atalhos de teclado: `N` (novo), `H` (dica), `S` (resolver), `Ctrl/Cmd+Z` (undo), `Ctrl/Cmd+Shift+Z` (redo)
- PWA com `service-worker` e `manifest.json` para uso offline

## Como executar
- Método simples: abrir `index.html` no navegador. Observação: `service worker` não funciona em `file://`; para PWA use um servidor.
- Servidor estático (exemplos):
  - Node: `npx http-server .` ou `npx serve .`
  - Python: `python -m http.server 8000`
  - Após subir, acesse `http://localhost:<porta>/`.

## Estrutura do projeto
- `index.html`: estrutura do DOM, modais, controles, áudio e script principal
- `style.css`: estilos, temas e animações
- `js/main.js`: ponto de entrada que instancia `GameController`
- `js/game/`: lógica principal do jogo
  - `GameController.js`: orquestração do fluxo, eventos, PWA, salvamento
  - `GameState.js`: estado centralizado (tabuleiro, timer, UI)
  - `SudokuGenerator.js`: preenchimento, remoção e solução do Sudoku
- `js/ui/`: gerenciamento de UI
  - `GridManager.js`: criação e interação das células, destaques
  - `ModalManager.js`: modais customizados e modais de sistema
  - `AudioController.js`: controles de áudio
  - `ImageMode.js`: troca entre números e imagens
- `js/utils/`: utilitários
  - `Timer.js`, `HistoryManager.js`, `SaveManager.js`, `AchievementsSystem.js`, `Validator.js`, `Helpers.js`
- `js/animations/AnimationManager.js`: animações do grid e das dicas
- `manifest.json`: PWA (ícones, cores, orientações)
- `service-worker.js`: cache estático e de runtime para uso offline
- `api/server.js`: servidor Express/MongoDB opcional para ranking

## Fluxo de inicialização
- Entrada: `js/main.js:3-6` cria `GameController` e chama `init()`.
- Inicialização: `js/game/GameController.js:56-76` configura modal, grid, histórico, timer, áudio e registra o service worker.
- Event listeners: `js/game/GameController.js:85-133` conecta botões e atalhos.
- Geração do jogo: `js/game/SudokuGenerator.js:9-28` preenche o tabuleiro; `js/game/SudokuGenerator.js:30-53` remove números conforme dificuldade.
- Interação do grid: `js/ui/GridManager.js:30-59` cria 81 inputs e adiciona eventos; validação e conclusão em `js/ui/GridManager.js:118-168` com apoio de `js/utils/Validator.js:9-40`.
- Timer: `js/utils/Timer.js:29-40` inicia e atualiza; restauração em `js/utils/Timer.js:68-77`.
- Salvamento: auto-save periódico em `js/game/GameController.js:666-674` e manual em `js/game/GameController.js:682-691`; persistência em `js/utils/SaveManager.js:17-46`.
- Conquistas: verificação na conclusão em `js/game/GameController.js:864-913` e gestão em `js/utils/AchievementsSystem.js:147-197`.

## PWA
- Registro do service worker: `js/game/GameController.js:814-830`.
- Cache de assets: `service-worker.js:8-30` (estático) + `service-worker.js:78-127` (runtime).
- Manifest e ícones: `manifest.json`.

## API opcional de ranking
- Arquivo: `api/server.js` (Express + MongoDB via Mongoose).
- Endpoints:
  - `POST /salvar-tempo` salva `{ nome, tempo }`.
  - `GET /rank` retorna top-10 por menor tempo.
- Requisitos: Node 18+, MongoDB; instalar dependências (`express`, `mongoose`, `cors`) e executar `node api/server.js`.

## Controles e acessibilidade
- Inputs com `inputmode="numeric"` e `pattern` restrito; destaques de números iguais.
- Modais com `role="dialog"`, atributos `aria-*` e transições.
- `aria-live` para anúncios (`index.html`), foco preservado em undo/redo.

## Licença
- Ver `LICENSE` para detalhes.

## Créditos
- Autor: Felipe Toledo