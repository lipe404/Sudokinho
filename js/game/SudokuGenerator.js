import { Helpers } from "../utils/Helpers.js";

export class SudokuGenerator {
  constructor(gameState) {
    this.gameState = gameState;
    this.helpers = new Helpers();
  }

  fillBoard(board) {
    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        if (board[row][col] === 0) {
          const numbers = this.helpers.shuffleArray(
            [...Array(this.gameState.SIZE).keys()].map((n) => n + 1)
          );
          for (const num of numbers) {
            if (this.isValidPlacement(num, row, col, board)) {
              board[row][col] = num;
              if (this.fillBoard(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  removeNumbers(board, difficulty) {
    let cellsToRemove =
      difficulty.min +
      Math.floor(Math.random() * (difficulty.max - difficulty.min + 1));
    let attempts = 0;

    while (cellsToRemove > 0 && attempts < this.gameState.MAX_ATTEMPTS) {
      const row = Math.floor(Math.random() * this.gameState.SIZE);
      const col = Math.floor(Math.random() * this.gameState.SIZE);

      if (board[row][col] !== 0) {
        const temp = board[row][col];
        board[row][col] = 0;
        const boardCopy = board.map((row) => [...row]);

        if (this.countSolutions(boardCopy) === 1) {
          cellsToRemove--;
        } else {
          board[row][col] = temp;
        }
        attempts++;
      }
    }
  }

  solveSudoku(board) {
    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= this.gameState.SIZE; num++) {
            if (this.isValidPlacement(num, row, col, board)) {
              board[row][col] = num;
              if (this.solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
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

  isCurrentBoardValid() {
    const board = this.getCurrentBoardState();

    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        const num = board[row][col];
        if (num !== 0) {
          board[row][col] = 0;
          if (!this.isValidPlacement(num, row, col, board)) {
            this.highlightInvalidCell(row, col);
            board[row][col] = num;
            return false;
          }
          board[row][col] = num;
        }
      }
    }
    return true;
  }

  countSolutions(board, count = 0) {
    if (count >= 2) return count;

    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= this.gameState.SIZE; num++) {
            if (this.isValidPlacement(num, row, col, board)) {
              board[row][col] = num;
              count = this.countSolutions(board, count);
              board[row][col] = 0;
            }
          }
          return count;
        }
      }
    }
    return count + 1;
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

  highlightInvalidCell(row, col) {
    const index = row * this.gameState.SIZE + col;
    this.gameState.cells[index].classList.add("invalid");
    setTimeout(
      () => this.gameState.cells[index].classList.remove("invalid"),
      2000
    );
  }
}
