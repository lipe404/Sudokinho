export class GameState {
  constructor() {
    this.SIZE = 9;
    this.SUBGRID_SIZE = 3;
    this.MAX_ATTEMPTS = 300;
    this.HINT_COOL_DOWN = 60000;

    this.DIFFICULTY_LEVELS = {
      easy: { min: 30, max: 40, name: "Fácil" },
      medium: { min: 40, max: 50, name: "Médio" },
      hard: { min: 50, max: 60, name: "Difícil" },
    };

    this.currentDifficulty = this.DIFFICULTY_LEVELS.medium;
    this.cells = [];
    this.currentBoard = this.createEmptyBoard();
    this.solutionBoard = this.createEmptyBoard();
    this.seconds = 0;
    this.lastHintTime = 0;
    this.playerCompleted = false;
    this.animacaoAtiva = true;
    this.loopAnimacao = null;
    this.timerInterval = null;
  }

  createEmptyBoard() {
    return Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
  }

  resetGameState() {
    this.currentBoard = this.createEmptyBoard();
    this.solutionBoard = this.createEmptyBoard();
    this.seconds = 0;
    this.playerCompleted = false;
    this.animacaoAtiva = false;
  }
}
