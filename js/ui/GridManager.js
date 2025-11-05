import { Validator } from "../utils/Validator.js";

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

    // Salvar estado antes de apagar com Backspace ou Delete
    if ((e.key === "Backspace" || e.key === "Delete") && cell.value && this.historyManager) {
      const currentBoard = this.getCurrentBoardState();
      const index = parseInt(cell.dataset.index);
      this.historyManager.saveState(currentBoard, index);
    }

    if (/^[1-9]$/.test(e.key)) {
      // Salvar estado antes de inserir novo valor
      if (this.historyManager && cell.value) {
        const currentBoard = this.getCurrentBoardState();
        const index = parseInt(cell.dataset.index);
        this.historyManager.saveState(currentBoard, index);
      }

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

      // Salvar estado ANTES de fazer qualquer mudança (apenas se o valor realmente mudou)
      if (this.historyManager && newValue !== oldValue && !cell.disabled) {
        const currentBoard = this.getCurrentBoardState();
        const index = parseInt(cell.dataset.index);
        this.historyManager.saveState(currentBoard, index);
        cell.setAttribute("data-old-value", newValue);
      }

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

      // Salvar histórico quando o usuário sai da célula (apenas se houve mudança)
      const currentValue = cell.value || "";
      const oldValue = cell.getAttribute("data-old-value") || "";
      
      if (currentValue !== oldValue && this.historyManager) {
        const currentBoard = this.getCurrentBoardState();
        const index = parseInt(cell.dataset.index);
        this.historyManager.saveState(currentBoard, index);
        cell.setAttribute("data-old-value", currentValue);
        
        // Notificar que o histórico mudou (para atualizar botões undo/redo)
        if (this.onHistoryChange) {
          this.onHistoryChange();
        }
      }
    } catch (error) {
      console.error('Erro ao processar blur da célula:', error);
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
