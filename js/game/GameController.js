import { GameState } from "./GameState.js";
import { SudokuGenerator } from "./SudokuGenerator.js";
import { GridManager } from "../ui/GridManager.js";
import { ModalManager } from "../ui/ModalManager.js";
import { AudioController } from "../ui/AudioController.js";
import { Timer } from "../utils/Timer.js";
import { AnimationManager } from "../animations/AnimationManager.js";

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.sudokuGenerator = new SudokuGenerator(this.gameState);
    this.gridManager = new GridManager(this.gameState);
    this.modalManager = new ModalManager();
    this.audioController = new AudioController();
    this.timer = new Timer();
    this.animationManager = new AnimationManager(this.gameState);

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

    solveButton.addEventListener("click", () => this.solveSudoku());
    newGameButton.addEventListener("click", () => this.startNewGame());
    hintButton.addEventListener("click", () => this.provideHint());
  }

  startNewGame() {
    const newGameButton = document.getElementById("new-game-button");
    newGameButton.disabled = true;

    const grid = document.getElementById("sudoku-grid");
    grid.classList.remove("grid-animation");

    this.gameState.animacaoAtiva = false;
    this.showDifficultyModal();
  }

  showDifficultyModal() {
    this.modalManager.showModal("difficultyModal");
    const buttons = document.querySelectorAll(".difficulty-btn");
    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        (event) => this.handleDifficultySelection(event),
        { once: true }
      );
    });
  }

  handleDifficultySelection(event) {
    const difficulty = event.target.getAttribute("data-difficulty");
    this.gameState.currentDifficulty =
      this.gameState.DIFFICULTY_LEVELS[difficulty];
    this.modalManager.hideModal("difficultyModal");
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
