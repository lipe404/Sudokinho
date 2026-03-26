import { Helpers } from "../utils/Helpers.js";
import { isValidPlacement, findNextCell, countSolutions } from "../core/SudokuCore.js";
import { getBoardFromCells } from "../core/BoardUtils.js";

export class SudokuGenerator {
  constructor(gameState) {
    this.gameState = gameState;
    this.helpers = new Helpers();
    this.lastRemovalAttempts = 0;
  }

  fillBoard(board) {
    const next = findNextCell(board, this.gameState.SIZE, this.gameState.SUBGRID_SIZE);
    if (!next) return true;
    const { row, col, candidates } = next;
    const nums = this.helpers.shuffleArray(candidates.slice());
    for (const num of nums) {
      board[row][col] = num;
      if (this.fillBoard(board)) return true;
      board[row][col] = 0;
    }
    return false;
  }

  removeNumbers(board, difficulty) {
    let cellsToRemove = difficulty.min + Math.floor(Math.random() * (difficulty.max - difficulty.min + 1));
    const positions = [];
    for (let r = 0; r < this.gameState.SIZE; r++) {
      for (let c = 0; c < this.gameState.SIZE; c++) {
        positions.push({ r, c });
      }
    }
    const order = this.helpers.shuffleArray(positions);
    let attempts = 0;
    for (let i = 0; i < order.length && cellsToRemove > 0 && attempts < this.gameState.MAX_ATTEMPTS; i++) {
      const row = order[i].r;
      const col = order[i].c;
      if (board[row][col] === 0) continue;
      const temp = board[row][col];
      board[row][col] = 0;
      const boardCopy = board.map((r) => [...r]);
      if (countSolutions(boardCopy, this.gameState.SIZE, this.gameState.SUBGRID_SIZE) === 1) {
        cellsToRemove--;
      } else {
        board[row][col] = temp;
      }
      attempts++;
    }
    this.lastRemovalAttempts = attempts;
  }

  solveSudoku(board) {
    const next = findNextCell(board, this.gameState.SIZE, this.gameState.SUBGRID_SIZE);
    if (!next) return true;
    const { row, col, candidates } = next;
    for (const num of candidates) {
      if (isValidPlacement(num, row, col, board, this.gameState.SIZE, this.gameState.SUBGRID_SIZE)) {
        board[row][col] = num;
        if (this.solveSudoku(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  isCurrentBoardValid() {
    const board = this.getCurrentBoardState();

    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        const num = board[row][col];
        if (num !== 0) {
          board[row][col] = 0;
          if (!isValidPlacement(num, row, col, board, this.gameState.SIZE, this.gameState.SUBGRID_SIZE)) {
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

  getCurrentBoardState() {
    return getBoardFromCells(this.gameState.cells, this.gameState.SIZE);
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
