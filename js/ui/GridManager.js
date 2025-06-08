import { Validator } from "../utils/Validator.js";

export class GridManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.validator = new Validator(gameState);
    this.grid = document.getElementById("sudoku-grid");
  }

  createGrid() {
    for (let i = 0; i < this.gameState.SIZE * this.gameState.SIZE; i++) {
      const cell = document.createElement("input");
      cell.type = "text";
      cell.className = "cell";
      cell.maxLength = 1;
      cell.dataset.index = i;
      cell.setAttribute("inputmode", "numeric");
      cell.setAttribute("pattern", "[1-9]*");

      cell.addEventListener("input", (e) => this.validateCellInput(e));
      cell.addEventListener("click", (e) => this.highlightSameNumbers(e));
      cell.addEventListener("focus", () => this.handleCellFocus(cell));
      cell.addEventListener("mousedown", (e) =>
        this.handleCellMouseDown(e, cell)
      );
      cell.addEventListener("touchstart", (e) =>
        this.handleCellTouchStart(e, cell)
      );
      cell.addEventListener("selectstart", (e) =>
        this.handleCellSelectStart(e, cell)
      );

      cell.disabled = true;
      this.gameState.cells.push(cell);
      this.grid.appendChild(cell);
    }
  }

  validateCellInput(e) {
    const value = e.target.value;
    if (value && !/^[1-9]$/.test(value)) {
      e.target.value = "";
    } else {
      this.validator.checkIfPlayerCompletedBoard();
    }
  }

  highlightSameNumbers(e) {
    this.gameState.cells.forEach((c) => {
      c.classList.remove("highlight", "selected", "highlight-fixed");
      c.style.backgroundColor = "";
      c.style.boxShadow = "";
    });

    const clickedCell = e.target;
    const clickedValue = clickedCell.value;

    if (!clickedValue) return;

    clickedCell.classList.add("selected");

    this.gameState.cells.forEach((cell) => {
      if (cell.value === clickedValue) {
        if (cell.classList.contains("fixed")) {
          cell.classList.add("highlight-fixed");
          cell.style.backgroundColor = "#d8a4ff";
          cell.style.boxShadow = "0 0 0 2px #8436c7";
        } else {
          cell.classList.add("highlight");
          cell.style.backgroundColor = "#d8a4ff";
          cell.style.boxShadow = "0 0 0 2px #8436c7";
        }
      }
    });
  }

  handleCellFocus(cell) {
    if (cell.disabled) {
      cell.blur();
    }
  }

  handleCellMouseDown(e, cell) {
    if (cell.disabled) e.preventDefault();
  }

  handleCellTouchStart(e, cell) {
    if (cell.disabled) e.preventDefault();
  }

  handleCellSelectStart(e, cell) {
    if (cell.disabled) e.preventDefault();
  }

  enableCells() {
    this.gameState.cells.forEach((cell) => {
      if (!cell.classList.contains("pre-filled")) {
        cell.disabled = false;
      }
    });
  }

  fillCells(board) {
    for (let row = 0; row < this.gameState.SIZE; row++) {
      for (let col = 0; col < this.gameState.SIZE; col++) {
        const index = row * this.gameState.SIZE + col;
        const cell = this.gameState.cells[index];
        const value = board[row][col];

        cell.value = value || "";
        cell.classList.toggle("fixed", value !== 0);
        cell.disabled = value !== 0;
        cell.classList.remove("hint");
      }
    }
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

  updateCellsFromBoard(board) {
    this.gameState.cells.forEach((cell, i) => {
      const row = Math.floor(i / this.gameState.SIZE);
      const col = i % this.gameState.SIZE;
      if (!cell.classList.contains("fixed")) {
        cell.value = board[row][col];
      }
    });
  }

  clearAllCells() {
    this.gameState.cells.forEach((cell) => {
      cell.value = "";
      cell.classList.remove("fixed", "invalid");
      cell.disabled = false;
    });
  }
}
