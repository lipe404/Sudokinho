import { Validator } from "../utils/Validator.js";

export class GridManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.validator = new Validator(gameState);
    this.grid = document.getElementById("sudoku-grid");
    this.imageMode = null; // NOVO
  }

  // NOVA FUNÇÃO
  setImageMode(imageMode) {
    this.imageMode = imageMode;
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
      cell.addEventListener("keydown", (e) => this.handleKeyDown(e));
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

  handleKeyDown(e) {
    const cell = e.target;

    if (cell.disabled || cell.classList.contains("fixed")) {
      e.preventDefault();
      return;
    }

    if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      cell.value = e.key;

      // NOVO: Atualizar display se estiver no modo de imagem
      if (this.imageMode) {
        this.imageMode.updateCellDisplay(cell);
      }

      const inputEvent = new Event("input", { bubbles: true });
      cell.dispatchEvent(inputEvent);

      return;
    }

    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  validateCellInput(e) {
    const value = e.target.value;

    if (value.length > 1) {
      e.target.value = value.slice(-1);
    }

    if (e.target.value && !/^[1-9]$/.test(e.target.value)) {
      e.target.value = "";
      this.clearHighlights();

      // NOVO: Limpar display de imagem se necessário
      if (this.imageMode) {
        this.imageMode.updateCellDisplay(e.target);
      }
    } else {
      // NOVO: Atualizar display após validação
      if (this.imageMode) {
        this.imageMode.updateCellDisplay(e.target);
      }

      this.validator.checkIfPlayerCompletedBoard();
      if (e.target.value) {
        this.highlightSameNumbers(e);
      } else {
        this.clearHighlights();
      }
    }
  }

  handleCellFocus(cell) {
    if (cell.disabled) {
      cell.blur();
    } else {
      setTimeout(() => {
        if (cell.value) {
          cell.select();
          this.highlightNumbersByValue(cell.value, cell);
        }
      }, 0);
    }
  }

  clearHighlights() {
    this.gameState.cells.forEach((c) => {
      c.classList.remove("highlight", "selected", "highlight-fixed");
      c.style.backgroundColor = "";
      c.style.boxShadow = "";
    });
  }

  highlightSameNumbers(e) {
    this.clearHighlights();

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

  highlightNumbersByValue(value, activeCell = null) {
    this.clearHighlights();

    if (!value) return;

    if (activeCell) {
      activeCell.classList.add("selected");
    }

    this.gameState.cells.forEach((cell) => {
      if (cell.value === value) {
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

        // NOVO: Atualizar display baseado no modo
        if (this.imageMode) {
          this.imageMode.updateCellDisplay(cell);
        }
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

        // NOVO: Atualizar display após atualização
        if (this.imageMode) {
          this.imageMode.updateCellDisplay(cell);
        }
      }
    });
  }

  clearAllCells() {
    this.gameState.cells.forEach((cell) => {
      cell.value = "";
      cell.classList.remove(
        "fixed",
        "invalid",
        "highlight",
        "selected",
        "highlight-fixed"
      );
      cell.style.backgroundColor = "";
      cell.style.boxShadow = "";
      cell.style.backgroundImage = ""; // NOVO
      cell.style.color = ""; // NOVO
      cell.style.fontSize = ""; // NOVO
      cell.removeAttribute("data-value"); // NOVO
      cell.disabled = false;
    });
  }
}
