/**
 * Estado centralizado do jogo
 * @class GameState
 */
export class GameState {
  constructor() {
    // Constantes
    this.SIZE = 9;
    this.SUBGRID_SIZE = 3;
    this.MAX_ATTEMPTS = 300;
    this.HINT_COOL_DOWN = 60000;

    // Dificuldades
    this.DIFFICULTY_LEVELS = {
      easy: { min: 30, max: 40, name: "Fácil" },
      medium: { min: 40, max: 50, name: "Médio" },
      hard: { min: 50, max: 60, name: "Difícil" },
    };

    // Estado do jogo
    this.currentDifficulty = this.DIFFICULTY_LEVELS.medium;
    this.cells = [];
    this.currentBoard = this.createEmptyBoard();
    this.solutionBoard = this.createEmptyBoard();
    this.playerCompleted = false;
    this.lastHintTime = 0;
    this.hintsUsed = 0;
    this.errors = 0;

    // Estado do timer (centralizado)
    this.timer = {
      seconds: 0,
      isRunning: false,
      interval: null
    };

    // Estado da UI (centralizado)
    this.ui = {
      imageMode: false,
      theme: 'classic',
      selectedCellIndex: null
    };

    // Estado de animações
    this.animacaoAtiva = true;
    this.loopAnimacao = null;

    // Estado de estatísticas
    this.stats = {
      startTime: null,
      gameStartTime: null
    };
  }

  /**
   * Cria um tabuleiro vazio
   * @returns {number[][]}
   */
  createEmptyBoard() {
    return Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
  }

  /**
   * Reseta o estado do jogo
   */
  resetGameState() {
    this.currentBoard = this.createEmptyBoard();
    this.solutionBoard = this.createEmptyBoard();
    this.timer.seconds = 0;
    this.timer.isRunning = false;
    this.playerCompleted = false;
    this.animacaoAtiva = false;
    this.lastHintTime = 0;
    this.hintsUsed = 0;
    this.errors = 0;
    this.ui.selectedCellIndex = null;
    this.stats.gameStartTime = Date.now();
  }

  /**
   * Atualiza o valor de uma célula
   * @param {number} row - Linha
   * @param {number} col - Coluna
   * @param {number} value - Valor (0-9)
   */
  setCellValue(row, col, value) {
    try {
      if (row >= 0 && row < this.SIZE && col >= 0 && col < this.SIZE) {
        this.currentBoard[row][col] = value;
      }
    } catch (error) {
      console.error('Erro ao definir valor da célula:', error);
    }
  }

  /**
   * Obtém o valor de uma célula
   * @param {number} row - Linha
   * @param {number} col - Coluna
   * @returns {number}
   */
  getCellValue(row, col) {
    try {
      if (row >= 0 && row < this.SIZE && col >= 0 && col < this.SIZE) {
        return this.currentBoard[row][col];
      }
      return 0;
    } catch (error) {
      console.error('Erro ao obter valor da célula:', error);
      return 0;
    }
  }

  /**
   * Define o modo de imagem
   * @param {boolean} enabled - Se o modo de imagem está ativo
   */
  setImageMode(enabled) {
    this.ui.imageMode = enabled;
  }

  /**
   * Obtém o modo de imagem
   * @returns {boolean}
   */
  getImageMode() {
    return this.ui.imageMode;
  }

  /**
   * Incrementa o contador de dicas
   */
  incrementHints() {
    this.hintsUsed++;
    this.lastHintTime = Date.now();
  }

  /**
   * Incrementa o contador de erros
   */
  incrementErrors() {
    this.errors++;
  }

  /**
   * Reseta contadores de dicas e erros
   */
  resetCounters() {
    this.hintsUsed = 0;
    this.errors = 0;
  }
}
