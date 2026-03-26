import { Validator } from "../utils/Validator.js";
import { getBoardFromCells } from "../core/BoardUtils.js";

export class GridManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.validator = new Validator(gameState);
    this.grid = document.getElementById("sudoku-grid");
    this.imageMode = null;
    this.historyManager = null;
    this.onHistoryChange = null; // Callback quando histórico muda
    this.onGameCompleted = null; // Callback quando jogo é completado
  }

  setImageMode(imageMode) {
    this.imageMode = imageMode;
  }

  setHistoryManager(historyManager) {
    this.historyManager = historyManager;
  }

  setHistoryChangeCallback(callback) {
    this.onHistoryChange = callback;
  }

  setGameCompletedCallback(callback) {
    this.onGameCompleted = callback;
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
      cell.addEventListener("blur", (e) => this.handleCellBlur(e, cell));
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

    // Consolidação: gravação ocorre no input, não no keydown

    // Navegação por setas entre células habilitadas
    const moveFocus = (deltaRow, deltaCol) => {
      const index = parseInt(cell.dataset.index);
      const row = Math.floor(index / this.gameState.SIZE);
      const col = index % this.gameState.SIZE;
      let newRow = (row + deltaRow + this.gameState.SIZE) % this.gameState.SIZE;
      let newCol = (col + deltaCol + this.gameState.SIZE) % this.gameState.SIZE;
      for (let i = 0; i < this.gameState.SIZE * this.gameState.SIZE; i++) {
        const targetIndex = newRow * this.gameState.SIZE + newCol;
        const target = this.gameState.cells[targetIndex];
        if (target && !target.disabled) {
          target.focus();
          return;
        }
        newRow = (newRow + deltaRow + this.gameState.SIZE) % this.gameState.SIZE;
        newCol = (newCol + deltaCol + this.gameState.SIZE) % this.gameState.SIZE;
      }
    };

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(0, -1);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(0, 1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(-1, 0);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(1, 0);
      return;
    }

    if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      cell.value = e.key;
      cell.setAttribute("data-old-value", e.key);

      // Atualizar display se estiver no modo de imagem
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
    try {
      const cell = e.target;
      const newValue = cell.value;
      const oldValue = cell.getAttribute("data-old-value") || "";

      // Gravação consolidada será feita após definir o valor final

      if (newValue.length > 1) {
        cell.value = newValue.slice(-1);
      }

      if (cell.value && !/^[1-9]$/.test(cell.value)) {
        cell.value = "";
        cell.setAttribute("data-old-value", "");
        this.clearHighlights();

        // Limpar display de imagem se necessário
        if (this.imageMode) {
          this.imageMode.updateCellDisplay(cell);
        }
      } else {
        // Atualizar display após validação
        if (this.imageMode) {
          this.imageMode.updateCellDisplay(cell);
        }

        if (this.historyManager && !cell.disabled) {
          const index = parseInt(cell.dataset.index);
          const from = oldValue ? parseInt(oldValue) || 0 : 0;
          const to = cell.value ? parseInt(cell.value) || 0 : 0;
          if (from !== to) {
            this.historyManager.saveDiff(index, from, to, index);
            if (this.onHistoryChange) {
              this.onHistoryChange();
            }
          }
          cell.setAttribute("data-old-value", cell.value || "");
        }

        const completionData = this.validator.checkIfPlayerCompletedBoard();
        if (completionData && completionData.completed) {
          // Notificar GameController sobre conclusão
          if (this.onGameCompleted) {
            this.onGameCompleted(completionData);
          }
        }
        
        if (cell.value) {
          this.highlightSameNumbers(e);
        } else {
          this.clearHighlights();
        }
        if (this.gameState && typeof this.gameState.emit === 'function') {
          this.gameState.emit('boardChange', this.getCurrentBoardState());
        }
      }
    } catch (error) {
      console.error('Erro ao validar input da célula:', error);
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

  /**
   * Lida com o evento blur (quando o usuário sai da célula)
   * @param {Event} e - Evento de blur
   * @param {HTMLElement} cell - Célula
   */
  handleCellBlur(e, cell) {
    try {
      if (cell.disabled || cell.classList.contains("fixed")) {
        return;
      }

      // Removido: gravação redundante no blur
    } catch (error) {
      console.error('Erro ao processar blur da célula:', error);
    }
  }

  clearHighlights() {
    this.gameState.cells.forEach((c) => {
      c.classList.remove("highlight", "selected", "highlight-fixed");
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
        } else {
          cell.classList.add("highlight");
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
        } else {
          cell.classList.add("highlight");
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
      cell.disabled = cell.classList.contains("fixed");
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
        // Inicializar data-old-value para rastreamento de mudanças
        cell.setAttribute("data-old-value", value || "");

        // Atualizar display baseado no modo
        if (this.imageMode) {
          this.imageMode.updateCellDisplay(cell);
        }
      }
    }
  }

  getCurrentBoardState() {
    return getBoardFromCells(this.gameState.cells, this.gameState.SIZE);
  }

  updateCellsFromBoard(board) {
    try {
      this.gameState.cells.forEach((cell, i) => {
        const row = Math.floor(i / this.gameState.SIZE);
        const col = i % this.gameState.SIZE;
        if (!cell.classList.contains("fixed")) {
          // Converter 0 para string vazia para não mostrar "0" nas células
          const value = board[row][col];
          const displayValue = value === 0 || value === "0" ? "" : value.toString();
          cell.value = displayValue;
          // Atualizar data-old-value para rastreamento
          cell.setAttribute("data-old-value", displayValue);

          // Atualizar display após atualização
          if (this.imageMode) {
            this.imageMode.updateCellDisplay(cell);
          }
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar células do tabuleiro:', error);
    }
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
      cell.style.backgroundImage = "";
      cell.style.color = "";
      cell.style.fontSize = "";
      cell.removeAttribute("data-value");
      cell.disabled = false;
    });
  }
}
