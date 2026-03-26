import { isValidPlacement } from "../core/SudokuCore.js";
import { getBoardFromCells } from "../core/BoardUtils.js";

export class Validator {
  constructor(gameState) {
    this.gameState = gameState;
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
        const isValid = isValidPlacement(value, row, col, board, this.gameState.SIZE, this.gameState.SUBGRID_SIZE);
        board[row][col] = value;
        if (!isValid) return false;
      }
    }
    return true;
  }

  getCurrentBoardState() {
    return getBoardFromCells(this.gameState.cells, this.gameState.SIZE);
  }
}
