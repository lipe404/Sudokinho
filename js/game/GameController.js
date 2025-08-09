import { GameState } from "./GameState.js";
import { SudokuGenerator } from "./SudokuGenerator.js";
import { GridManager } from "../ui/GridManager.js";
import { ModalManager } from "../ui/ModalManager.js";
import { AudioController } from "../ui/AudioController.js";
import { ImageMode } from "../ui/ImageMode.js"; // NOVO IMPORT
import { Timer } from "../utils/Timer.js";
import { AnimationManager } from "../animations/AnimationManager.js";

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.sudokuGenerator = new SudokuGenerator(this.gameState);
    this.gridManager = new GridManager(this.gameState);
    this.modalManager = new ModalManager();
    this.audioController = new AudioController();
    this.imageMode = new ImageMode(this.gameState); // NOVA INSTÂNCIA
    this.timer = new Timer();
    this.animationManager = new AnimationManager(this.gameState);

    this.previousGameState = null;

    this.setupEventListeners();
  }

  init() {
    this.modalManager.setup();
    this.gridManager.createGrid();
    this.audioController.setup();
    this.hideGameButtons();
    this.animationManager.startGridAnimation();
  }

  setupEventListeners() {
    const solveButton = document.getElementById("solve-button");
    const newGameButton = document.getElementById("new-game-button");
    const hintButton = document.getElementById("hint-button");
    const imageModeButton = document.getElementById("image-mode-button"); // NOVO

    solveButton.addEventListener("click", () => this.solveSudoku());
    newGameButton.addEventListener("click", () => this.startNewGame());
    hintButton.addEventListener("click", () => this.provideHint());

    // NOVO EVENT LISTENER
    imageModeButton.addEventListener("click", () => this.toggleImageMode());
  }

  // NOVA FUNÇÃO
  toggleImageMode() {
    this.imageMode.toggleMode();

    // Atualizar GridManager para saber sobre o modo atual
    this.gridManager.setImageMode(this.imageMode);
  }

  startNewGame() {
    const newGameButton = document.getElementById("new-game-button");
    newGameButton.disabled = true;

    const grid = document.getElementById("sudoku-grid");
    grid.classList.remove("grid-animation");

    this.saveCurrentGameState();

    this.gameState.animacaoAtiva = false;
    this.showDifficultyModal();
  }

  // Salvar estado atual do jogo (ATUALIZADO)
  saveCurrentGameState() {
    this.previousGameState = {
      currentBoard: this.gameState.currentBoard.map((row) => [...row]),
      solutionBoard: this.gameState.solutionBoard.map((row) => [...row]),
      currentDifficulty: { ...this.gameState.currentDifficulty },
      seconds: this.timer.seconds,
      playerCompleted: this.gameState.playerCompleted,
      lastHintTime: this.gameState.lastHintTime,
      isImageMode: this.imageMode.getCurrentMode(), // NOVO
      cellsValues: this.gameState.cells.map((cell) => ({
        value: cell.value,
        disabled: cell.disabled,
        classList: Array.from(cell.classList),
        dataValue: cell.getAttribute("data-value"), // NOVO
        backgroundImage: cell.style.backgroundImage, // NOVO
      })),
      timerRunning: this.timer.timerInterval !== null,
      gameButtonsVisible: {
        solve: document.getElementById("solve-button").style.display !== "none",
        hint: document.getElementById("hint-button").style.display !== "none",
      },
    };
  }

  // Restaurar estado anterior (ATUALIZADO)
  restorePreviousGameState() {
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

    // NOVO: Restaurar modo de imagem
    this.imageMode.setMode(this.previousGameState.isImageMode);

    // Restaurar células (ATUALIZADO)
    this.gameState.cells.forEach((cell, index) => {
      const savedCell = this.previousGameState.cellsValues[index];
      cell.value = savedCell.value;
      cell.disabled = savedCell.disabled;
      cell.className = savedCell.classList.join(" ");

      // NOVO: Restaurar atributos de imagem
      if (savedCell.dataValue) {
        cell.setAttribute("data-value", savedCell.dataValue);
      }
      if (savedCell.backgroundImage) {
        cell.style.backgroundImage = savedCell.backgroundImage;
      }
    });

    // Usar método específico para restaurar timer
    if (this.previousGameState.timerRunning) {
      this.timer.restoreAndStart(this.previousGameState.seconds);
    } else {
      this.timer.seconds = this.previousGameState.seconds;
      this.timer.updateDisplay();
    }

    // Restaurar visibilidade dos botões
    document.getElementById("solve-button").style.display = this
      .previousGameState.gameButtonsVisible.solve
      ? "inline-block"
      : "none";
    document.getElementById("hint-button").style.display = this
      .previousGameState.gameButtonsVisible.hint
      ? "inline-block"
      : "none";

    // Reabilitar botão de novo jogo
    document.getElementById("new-game-button").disabled = false;

    // Limpar estado salvo
    this.previousGameState = null;
  }

  // Resto do código permanece igual...
  showDifficultyModal() {
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
  }

  setupDifficultyModalCloseHandler() {
    const modal = document.getElementById("difficultyModal");

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
  }

  cancelDifficultySelection() {
    const modal = document.getElementById("difficultyModal");
    if (modal._closeHandler) {
      modal.removeEventListener("click", modal._closeHandler);
      delete modal._closeHandler;
    }
    if (modal._escHandler) {
      document.removeEventListener("keydown", modal._escHandler);
      delete modal._escHandler;
    }

    this.modalManager.hideModal("difficultyModal");
    this.restorePreviousGameState();
  }

  handleDifficultySelection(event) {
    const modal = document.getElementById("difficultyModal");
    if (modal._closeHandler) {
      modal.removeEventListener("click", modal._closeHandler);
      delete modal._closeHandler;
    }
    if (modal._escHandler) {
      document.removeEventListener("keydown", modal._escHandler);
      delete modal._escHandler;
    }

    const difficulty = event.target.getAttribute("data-difficulty");
    this.gameState.currentDifficulty =
      this.gameState.DIFFICULTY_LEVELS[difficulty];
    this.modalManager.hideModal("difficultyModal");

    this.previousGameState = null;

    this.resetGame();
    this.timer.start();
    this.gridManager.enableCells();
    document.getElementById("new-game-button").disabled = false;
  }

  resetGame() {
    this.timer.clear();
    this.gridManager.clearAllCells();
    this.generateSudoku();
    this.gameState.playerCompleted = false;
  }

  generateSudoku() {
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

    // NOVO: Atualizar display baseado no modo atual
    this.imageMode.updateAllCells();
  }

  solveSudoku() {
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

      // NOVO: Atualizar display após resolver
      this.imageMode.updateAllCells();

      this.timer.clear();
      this.modalManager.showCustomAlert(
        "Jogo Resolvido",
        "O jogo foi resolvido pela máquina.",
        "info"
      );
      this.hideGameButtons();
    } else {
      this.modalManager.showCustomAlert("Poxa", "Tenta de novo aí", "error");
    }
  }

  provideHint() {
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

    cell.value = this.gameState.solutionBoard[row][col];

    // NOVO: Atualizar display da célula com dica
    this.imageMode.updateCellDisplay(cell);

    this.animationManager.animateHint(cell);
    this.gameState.lastHintTime = now;
  }

  showGameButtons() {
    document.getElementById("solve-button").style.display = "inline-block";
    document.getElementById("hint-button").style.display = "inline-block";
  }

  hideGameButtons() {
    document.getElementById("solve-button").style.display = "none";
    document.getElementById("hint-button").style.display = "none";
  }
}
