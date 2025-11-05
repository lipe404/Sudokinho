import { ModalManager } from "../ui/ModalManager.js";

export class Validator {
  constructor(gameState) {
    this.gameState = gameState;
    this.modalManager = new ModalManager();
  }

  checkIfPlayerCompletedBoard() {
    const board = this.getCurrentBoardState();
    if (this.isBoardComplete(board) && this.isBoardCorrect(board)) {
      const timer = document.getElementById("timer");
      const finalTime = timer.textContent;

      // Contar erros no tabuleiro
      let errorCount = 0;
      for (let row = 0; row < this.gameState.SIZE; row++) {
        for (let col = 0; col < this.gameState.SIZE; col++) {
          const value = board[row][col];
          if (value !== 0) {
            board[row][col] = 0;
            if (!this.isValidPlacement(value, row, col, board)) {
              errorCount++;
            }
            board[row][col] = value;
          }
        }
      }

      // Retornar dados do jogo completado para processamento de conquistas
      return {
        completed: true,
        time: finalTime,
        timeSeconds: this.gameState.timer.seconds,
        errors: errorCount,
        hintsUsed: this.gameState.hintsUsed || 0
      };
    }
    return { completed: false };
  }

  isBoardComplete(board) {
    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        if (board[row][col] === 0) return false;
      }
    }
    return true;
  }

  isBoardCorrect(board) {
    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        const value = board[row][col];
        board[row][col] = 0;
        const isValid = this.isValidPlacement(value, row, col, board);
        board[row][col] = value;
        if (!isValid) return false;
      }
    }
    return true;
  }

  isValidPlacement(num, row, col, board) {
    // Verifica linha e coluna
    for (let i = 0; i < this.gameState.SIZE; i++) {
      if (
        (board[row][i] === num && i !== col) ||
        (board[i][col] === num && i !== row)
      ) {
        return false;
      }
    }

    // Verifica quadrante 3x3
    const startRow =
      Math.floor(row / this.gameState.SUBGRID_SIZE) *
      this.gameState.SUBGRID_SIZE;
    const startCol =
      Math.floor(col / this.gameState.SUBGRID_SIZE) *
      this.gameState.SUBGRID_SIZE;

    for (let i = startRow; i < startRow + this.gameState.SUBGRID_SIZE; i++) {
      for (let j = startCol; j < startCol + this.gameState.SUBGRID_SIZE; j++) {
        if (board[i][j] === num && i !== row && j !== col) {
          return false;
        }
      }
    }
    return true;
  }

  getCurrentBoardState() {
    const board = this.gameState.createEmptyBoard();
    for (let i = 0; i < this.gameState.cells.length; i++) {
      const value = parseInt(this.gameState.cells[i].value);
      const row = Math.floor(i / this.gameState.SIZE);
      const col = i % this.gameState.SIZE;
      board[row][col] = isNaN(value) ? 0 : value;
    }
    return board;
  }
}
