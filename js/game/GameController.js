/**
 * Controlador principal do jogo
 * @class GameController
 */
import { GameState } from "./GameState.js";
import { SudokuGenerator } from "./SudokuGenerator.js";
import { GridManager } from "../ui/GridManager.js";
import { ModalManager } from "../ui/ModalManager.js";
import { AudioController } from "../ui/AudioController.js";
import { ImageMode } from "../ui/ImageMode.js";
import { Timer } from "../utils/Timer.js";
import { AnimationManager } from "../animations/AnimationManager.js";
import { HistoryManager } from "../utils/HistoryManager.js";
import { SaveManager } from "../utils/SaveManager.js";

export class GameController {
  constructor() {
    try {
      // Estado centralizado
      this.gameState = new GameState();
      
      // Gerenciadores
      this.sudokuGenerator = new SudokuGenerator(this.gameState);
      this.gridManager = new GridManager(this.gameState);
      this.modalManager = new ModalManager();
      this.audioController = new AudioController();
      this.imageMode = new ImageMode(this.gameState);
      this.timer = new Timer(this.gameState);
      this.animationManager = new AnimationManager(this.gameState);
      this.historyManager = new HistoryManager();
      this.saveManager = new SaveManager();
      
      // Estado temporário para cancelamento
      this.previousGameState = null;
      
      // Configurar auto-save
      this.autoSaveInterval = null;
      this.setupAutoSave();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Verificar se há jogo salvo
      this.checkForSavedGame();
    } catch (error) {
      console.error('Erro ao inicializar GameController:', error);
      this.showErrorModal('Erro ao inicializar o jogo. Por favor, recarregue a página.');
    }
  }

  /**
   * Inicializa o jogo
   */
  init() {
    try {
      // Verificar se elementos DOM existem
      const grid = document.getElementById("sudoku-grid");
      if (!grid) {
        throw new Error("Elemento sudoku-grid não encontrado");
      }

      this.modalManager.setup();
      this.gridManager.createGrid();
      this.gridManager.setImageMode(this.imageMode);
      this.gridManager.setHistoryManager(this.historyManager);
      this.audioController.setup();
      this.hideGameButtons();
      this.animationManager.startGridAnimation();
      
      // Registrar service worker para PWA
      this.registerServiceWorker();
    } catch (error) {
      console.error('Erro ao inicializar jogo:', error);
      this.showErrorModal('Erro ao inicializar o jogo. Por favor, recarregue a página.');
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    try {
      const solveButton = document.getElementById("solve-button");
      const newGameButton = document.getElementById("new-game-button");
      const hintButton = document.getElementById("hint-button");
      const imageModeButton = document.getElementById("image-mode-button");
      const undoButton = document.getElementById("undo-button");
      const redoButton = document.getElementById("redo-button");

      if (!solveButton || !newGameButton || !hintButton || !imageModeButton) {
        throw new Error("Botões não encontrados no DOM");
      }

      solveButton.addEventListener("click", () => this.solveSudoku());
      newGameButton.addEventListener("click", () => this.startNewGame());
      hintButton.addEventListener("click", () => this.provideHint());
      imageModeButton.addEventListener("click", () => this.toggleImageMode());
      
      // Botões de undo/redo (se existirem)
      if (undoButton) {
        undoButton.addEventListener("click", () => this.undo());
      }
      if (redoButton) {
        redoButton.addEventListener("click", () => this.redo());
      }

      // Atalhos de teclado
      document.addEventListener("keydown", (e) => this.handleKeyboardShortcuts(e));
      
      // Salvar antes de sair
      window.addEventListener("beforeunload", () => this.autoSave());
    } catch (error) {
      console.error('Erro ao configurar event listeners:', error);
    }
  }

  /**
   * Lida com atalhos de teclado
   * @param {KeyboardEvent} e - Evento de teclado
   */
  handleKeyboardShortcuts(e) {
    try {
      // Não processar se estiver digitando em um input
      if (e.target.tagName === 'INPUT' && e.target.type === 'text' && !e.ctrlKey && !e.metaKey) {
        return;
      }

      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
        return;
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        this.redo();
        return;
      }

      // N = Novo Jogo
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.startNewGame();
        return;
      }

      // H = Dica
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.provideHint();
        return;
      }

      // S = Resolver
      if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.solveSudoku();
        return;
      }
    } catch (error) {
      console.error('Erro ao processar atalho de teclado:', error);
    }
  }

  /**
   * Alterna o modo de imagem
   */
  toggleImageMode() {
    try {
      this.imageMode.toggleMode();
      this.gridManager.setImageMode(this.imageMode);
      this.autoSave();
    } catch (error) {
      console.error('Erro ao alternar modo de imagem:', error);
    }
  }

  /**
   * Inicia um novo jogo
   */
  startNewGame() {
    try {
      const newGameButton = document.getElementById("new-game-button");
      if (newGameButton) {
        newGameButton.disabled = true;
      }

      const grid = document.getElementById("sudoku-grid");
      if (grid) {
        grid.classList.remove("grid-animation");
      }

      this.saveCurrentGameState();
      this.gameState.animacaoAtiva = false;
      this.showDifficultyModal();
    } catch (error) {
      console.error('Erro ao iniciar novo jogo:', error);
      this.showErrorModal('Erro ao iniciar novo jogo.');
    }
  }

  /**
   * Salva o estado atual do jogo (para cancelamento)
   */
  saveCurrentGameState() {
    try {
      const currentBoard = this.gridManager.getCurrentBoardState();
      this.previousGameState = {
        currentBoard: currentBoard.map((row) => [...row]),
        solutionBoard: this.gameState.solutionBoard.map((row) => [...row]),
        currentDifficulty: { ...this.gameState.currentDifficulty },
        timerSeconds: this.gameState.timer.seconds,
        timerRunning: this.gameState.timer.isRunning,
        playerCompleted: this.gameState.playerCompleted,
        lastHintTime: this.gameState.lastHintTime,
        isImageMode: this.gameState.getImageMode(),
        cellsValues: this.gameState.cells.map((cell) => ({
          value: cell.value,
          disabled: cell.disabled,
          classList: Array.from(cell.classList),
          dataValue: cell.getAttribute("data-value"),
          backgroundImage: cell.style.backgroundImage,
        })),
        gameButtonsVisible: {
          solve: document.getElementById("solve-button")?.style.display !== "none",
          hint: document.getElementById("hint-button")?.style.display !== "none",
        },
      };
    } catch (error) {
      console.error('Erro ao salvar estado atual:', error);
    }
  }

  /**
   * Restaura o estado anterior (ao cancelar)
   */
  restorePreviousGameState() {
    try {
      if (!this.previousGameState) return;

      // Restaurar dados do gameState
      this.gameState.currentBoard = this.previousGameState.currentBoard.map(
        (row) => [...row]
      );
      this.gameState.solutionBoard = this.previousGameState.solutionBoard.map(
        (row) => [...row]
      );
      this.gameState.currentDifficulty = {
        ...this.previousGameState.currentDifficulty,
      };
      this.gameState.playerCompleted = this.previousGameState.playerCompleted;
      this.gameState.lastHintTime = this.previousGameState.lastHintTime;

      // Restaurar modo de imagem
      this.imageMode.setMode(this.previousGameState.isImageMode);

      // Restaurar células
      this.gameState.cells.forEach((cell, index) => {
        const savedCell = this.previousGameState.cellsValues[index];
        if (savedCell) {
          cell.value = savedCell.value;
          cell.disabled = savedCell.disabled;
          cell.className = savedCell.classList.join(" ");

          if (savedCell.dataValue) {
            cell.setAttribute("data-value", savedCell.dataValue);
          }
          if (savedCell.backgroundImage) {
            cell.style.backgroundImage = savedCell.backgroundImage;
          }
        }
      });

      // Restaurar timer
      if (this.previousGameState.timerRunning) {
        this.timer.restoreAndStart(this.previousGameState.timerSeconds);
      } else {
        this.gameState.timer.seconds = this.previousGameState.timerSeconds;
        this.timer.updateDisplay();
      }

      // Restaurar visibilidade dos botões
      const solveButton = document.getElementById("solve-button");
      const hintButton = document.getElementById("hint-button");
      if (solveButton) {
        solveButton.style.display = this.previousGameState.gameButtonsVisible.solve
          ? "inline-block"
          : "none";
      }
      if (hintButton) {
        hintButton.style.display = this.previousGameState.gameButtonsVisible.hint
          ? "inline-block"
          : "none";
      }

      // Reabilitar botão de novo jogo
      const newGameButton = document.getElementById("new-game-button");
      if (newGameButton) {
        newGameButton.disabled = false;
      }

      // Limpar estado salvo
      this.previousGameState = null;
    } catch (error) {
      console.error('Erro ao restaurar estado anterior:', error);
    }
  }

  /**
   * Mostra modal de dificuldade
   */
  showDifficultyModal() {
    try {
      this.modalManager.showModal("difficultyModal");
      const buttons = document.querySelectorAll(".difficulty-btn");
      buttons.forEach((button) => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
      });

      const newButtons = document.querySelectorAll(".difficulty-btn");
      newButtons.forEach((button) => {
        button.addEventListener("click", (event) =>
          this.handleDifficultySelection(event)
        );
      });

      this.setupDifficultyModalCloseHandler();
    } catch (error) {
      console.error('Erro ao mostrar modal de dificuldade:', error);
    }
  }

  /**
   * Configura handler de fechamento do modal de dificuldade
   */
  setupDifficultyModalCloseHandler() {
    try {
      const modal = document.getElementById("difficultyModal");
      if (!modal) return;

      const closeModalHandler = (event) => {
        if (event.target === modal) {
          this.cancelDifficultySelection();
        }
      };

      const escKeyHandler = (event) => {
        if (event.key === "Escape") {
          this.cancelDifficultySelection();
        }
      };

      modal.addEventListener("click", closeModalHandler);
      document.addEventListener("keydown", escKeyHandler);

      modal._closeHandler = closeModalHandler;
      modal._escHandler = escKeyHandler;
    } catch (error) {
      console.error('Erro ao configurar handler do modal:', error);
    }
  }

  /**
   * Cancela seleção de dificuldade
   */
  cancelDifficultySelection() {
    try {
      const modal = document.getElementById("difficultyModal");
      if (modal) {
        if (modal._closeHandler) {
          modal.removeEventListener("click", modal._closeHandler);
          delete modal._closeHandler;
        }
        if (modal._escHandler) {
          document.removeEventListener("keydown", modal._escHandler);
          delete modal._escHandler;
        }
      }

      this.modalManager.hideModal("difficultyModal");
      this.restorePreviousGameState();
    } catch (error) {
      console.error('Erro ao cancelar seleção de dificuldade:', error);
    }
  }

  /**
   * Lida com seleção de dificuldade
   * @param {Event} event - Evento de clique
   */
  handleDifficultySelection(event) {
    try {
      const modal = document.getElementById("difficultyModal");
      if (modal) {
        if (modal._closeHandler) {
          modal.removeEventListener("click", modal._closeHandler);
          delete modal._closeHandler;
        }
        if (modal._escHandler) {
          document.removeEventListener("keydown", modal._escHandler);
          delete modal._escHandler;
        }
      }

      const difficulty = event.target.getAttribute("data-difficulty");
      if (!difficulty || !this.gameState.DIFFICULTY_LEVELS[difficulty]) {
        throw new Error("Dificuldade inválida");
      }

      this.gameState.currentDifficulty =
        this.gameState.DIFFICULTY_LEVELS[difficulty];
      this.modalManager.hideModal("difficultyModal");

      this.previousGameState = null;
      this.historyManager.clear(); // Limpar histórico ao iniciar novo jogo

      this.resetGame();
      this.timer.start();
      this.gridManager.enableCells();
      
      const newGameButton = document.getElementById("new-game-button");
      if (newGameButton) {
        newGameButton.disabled = false;
      }
    } catch (error) {
      console.error('Erro ao selecionar dificuldade:', error);
      this.showErrorModal('Erro ao iniciar jogo. Tente novamente.');
    }
  }

  /**
   * Reseta o jogo
   */
  resetGame() {
    try {
      this.timer.clear();
      this.gridManager.clearAllCells();
      this.generateSudoku();
      this.gameState.playerCompleted = false;
      this.gameState.resetCounters();
      this.gameState.stats.gameStartTime = Date.now();
    } catch (error) {
      console.error('Erro ao resetar jogo:', error);
    }
  }

  /**
   * Gera um novo Sudoku
   */
  generateSudoku() {
    try {
      this.gameState.resetGameState();
      this.gridManager.clearAllCells();

      this.sudokuGenerator.fillBoard(this.gameState.currentBoard);
      this.gameState.solutionBoard = this.gameState.currentBoard.map((row) => [
        ...row,
      ]);
      this.sudokuGenerator.removeNumbers(
        this.gameState.currentBoard,
        this.gameState.currentDifficulty
      );

      this.gridManager.fillCells(this.gameState.currentBoard);
      this.showGameButtons();
      this.gameState.animacaoAtiva = false;

      // Salvar estado inicial no histórico
      const initialBoard = this.gridManager.getCurrentBoardState();
      this.historyManager.saveState(initialBoard);

      // Atualizar display baseado no modo atual
      this.imageMode.updateAllCells();
      
      // Salvar jogo
      this.autoSave();
    } catch (error) {
      console.error('Erro ao gerar Sudoku:', error);
      this.showErrorModal('Erro ao gerar novo Sudoku. Tente novamente.');
    }
  }

  /**
   * Resolve o Sudoku
   */
  solveSudoku() {
    try {
      if (!this.sudokuGenerator.isCurrentBoardValid()) {
        this.modalManager.showCustomAlert(
          "Atenção",
          "O tabuleiro contém valores inválidos. Corrija antes de resolver.",
          "error"
        );
        return;
      }

      const boardToSolve = this.gridManager.getCurrentBoardState();
      this.gameState.playerCompleted = false;

      if (this.sudokuGenerator.solveSudoku(boardToSolve)) {
        this.gridManager.updateCellsFromBoard(boardToSolve);
        this.imageMode.updateAllCells();

        this.timer.clear();
        this.modalManager.showCustomAlert(
          "Jogo Resolvido",
          "O jogo foi resolvido pela máquina.",
          "info"
        );
        this.hideGameButtons();
        this.saveManager.clearSave(); // Limpar save após resolver
      } else {
        this.modalManager.showCustomAlert("Poxa", "Tenta de novo aí", "error");
      }
    } catch (error) {
      console.error('Erro ao resolver Sudoku:', error);
      this.showErrorModal('Erro ao resolver Sudoku.');
    }
  }

  /**
   * Fornece uma dica
   */
  provideHint() {
    try {
      const now = Date.now();
      if (now - this.gameState.lastHintTime < this.gameState.HINT_COOL_DOWN) {
        const remainingTime = Math.ceil(
          (this.gameState.HINT_COOL_DOWN - (now - this.gameState.lastHintTime)) /
            1000
        );
        this.modalManager.showCustomAlert(
          "Aguarde",
          `Você pode pedir outra dica em ${remainingTime} segundos.`,
          "info"
        );
        return;
      }

      const emptyCells = [];
      for (let i = 0; i < this.gameState.cells.length; i++) {
        if (!this.gameState.cells[i].value && !this.gameState.cells[i].disabled) {
          emptyCells.push(i);
        }
      }

      if (emptyCells.length === 0) {
        this.modalManager.showCustomAlert("O tabuleiro já está completo!");
        this.hideGameButtons();
        return;
      }

      const randomIndex =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const cell = this.gameState.cells[randomIndex];
      const row = Math.floor(randomIndex / this.gameState.SIZE);
      const col = randomIndex % this.gameState.SIZE;

      // Salvar estado antes da dica
      const currentBoard = this.gridManager.getCurrentBoardState();
      this.historyManager.saveState(currentBoard, randomIndex);

      cell.value = this.gameState.solutionBoard[row][col];
      this.imageMode.updateCellDisplay(cell);

      this.animationManager.animateHint(cell);
      this.gameState.incrementHints();
      
      // Auto-save após dica
      this.autoSave();
    } catch (error) {
      console.error('Erro ao fornecer dica:', error);
    }
  }

  /**
   * Desfaz a última ação
   */
  undo() {
    try {
      const previousState = this.historyManager.undo();
      if (previousState) {
        this.gridManager.updateCellsFromBoard(previousState.board);
        if (previousState.selectedCellIndex !== null) {
          const cell = this.gameState.cells[previousState.selectedCellIndex];
          if (cell) {
            cell.focus();
          }
        }
        this.imageMode.updateAllCells();
        this.updateUndoRedoButtons();
        this.autoSave();
      }
    } catch (error) {
      console.error('Erro ao desfazer:', error);
    }
  }

  /**
   * Refaz a última ação desfeita
   */
  redo() {
    try {
      const nextState = this.historyManager.redo();
      if (nextState) {
        this.gridManager.updateCellsFromBoard(nextState.board);
        if (nextState.selectedCellIndex !== null) {
          const cell = this.gameState.cells[nextState.selectedCellIndex];
          if (cell) {
            cell.focus();
          }
        }
        this.imageMode.updateAllCells();
        this.updateUndoRedoButtons();
        this.autoSave();
      }
    } catch (error) {
      console.error('Erro ao refazer:', error);
    }
  }

  /**
   * Atualiza botões de undo/redo
   */
  updateUndoRedoButtons() {
    try {
      const undoBtn = document.getElementById('undo-button');
      const redoBtn = document.getElementById('redo-button');
      
      if (undoBtn) {
        undoBtn.disabled = !this.historyManager.canUndo();
      }
      if (redoBtn) {
        redoBtn.disabled = !this.historyManager.canRedo();
      }
    } catch (error) {
      console.error('Erro ao atualizar botões undo/redo:', error);
    }
  }

  /**
   * Configura auto-save
   */
  setupAutoSave() {
    try {
      // Salvar automaticamente a cada 30 segundos
      this.autoSaveInterval = setInterval(() => {
        if (this.gameState.currentBoard.some(row => row.some(cell => cell !== 0))) {
          this.autoSave();
        }
      }, 30000);
    } catch (error) {
      console.error('Erro ao configurar auto-save:', error);
    }
  }

  /**
   * Salva o jogo automaticamente
   */
  autoSave() {
    try {
      const gameData = {
        board: this.gameState.currentBoard,
        solution: this.gameState.solutionBoard,
        difficulty: this.gameState.currentDifficulty,
        time: this.gameState.timer.seconds,
        imageMode: this.gameState.getImageMode()
      };
      this.saveManager.saveGame(gameData);
    } catch (error) {
      console.error('Erro ao salvar jogo automaticamente:', error);
    }
  }

  /**
   * Verifica se há jogo salvo
   */
  checkForSavedGame() {
    try {
      if (this.saveManager.hasSaveGame()) {
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
          const saved = this.saveManager.loadGame();
          if (saved) {
            this.modalManager.showCustomAlert(
              'Jogo Salvo Encontrado',
              'Você tem um jogo em progresso. Deseja continuar?',
              'info'
            );
            // Adicionar botões para continuar ou novo jogo
            // Por enquanto, apenas carrega automaticamente
            // this.loadSavedGame();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao verificar jogo salvo:', error);
    }
  }

  /**
   * Carrega jogo salvo
   */
  loadSavedGame() {
    try {
      const saved = this.saveManager.loadGame();
      if (saved) {
        this.gameState.currentBoard = saved.board;
        this.gameState.solutionBoard = saved.solution;
        this.gameState.currentDifficulty = saved.difficulty;
        this.timer.restoreAndStart(saved.time);
        this.imageMode.setMode(saved.imageMode);
        this.gridManager.fillCells(saved.board);
        this.showGameButtons();
        this.imageMode.updateAllCells();
      }
    } catch (error) {
      console.error('Erro ao carregar jogo salvo:', error);
      this.showErrorModal('Erro ao carregar jogo salvo.');
    }
  }

  /**
   * Registra Service Worker para PWA
   */
  registerServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
              console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch((error) => {
              console.warn('Erro ao registrar Service Worker:', error);
            });
        });
      }
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }

  /**
   * Mostra botões do jogo
   */
  showGameButtons() {
    try {
      const solveButton = document.getElementById("solve-button");
      const hintButton = document.getElementById("hint-button");
      if (solveButton) solveButton.style.display = "inline-block";
      if (hintButton) hintButton.style.display = "inline-block";
    } catch (error) {
      console.error('Erro ao mostrar botões:', error);
    }
  }

  /**
   * Esconde botões do jogo
   */
  hideGameButtons() {
    try {
      const solveButton = document.getElementById("solve-button");
      const hintButton = document.getElementById("hint-button");
      if (solveButton) solveButton.style.display = "none";
      if (hintButton) hintButton.style.display = "none";
    } catch (error) {
      console.error('Erro ao esconder botões:', error);
    }
  }

  /**
   * Mostra modal de erro
   * @param {string} message - Mensagem de erro
   */
  showErrorModal(message) {
    try {
      this.modalManager.showCustomAlert("Erro", message, "error");
    } catch (error) {
      console.error('Erro ao mostrar modal de erro:', error);
      alert(message); // Fallback
    }
  }

  /**
   * Limpa recursos ao destruir
   */
  destroy() {
    try {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }
      this.timer.clear();
      this.animationManager.stopGridAnimation();
      this.historyManager.clear();
      this.autoSave(); // Salvar antes de destruir
    } catch (error) {
      console.error('Erro ao destruir GameController:', error);
    }
  }
}
