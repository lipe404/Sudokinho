/**
 * Gerenciador de histórico para funcionalidade Undo/Redo
 * @class HistoryManager
 */
export class HistoryManager {
  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
    this.baseBoard = null;
    this.changes = [];
    this.currentIndex = -1;
  }

  /**
   * Salva o estado atual do tabuleiro
   * @param {number[][]} board - Estado atual do tabuleiro
   * @param {number} selectedCellIndex - Índice da célula selecionada
   * @returns {boolean} True se o estado foi salvo com sucesso
   */
  saveState(board, selectedCellIndex = null) {
    try {
      if (!this.baseBoard) {
        this.baseBoard = board.map(row => [...row]);
        this.changes = [];
        this.currentIndex = -1;
        return true;
      }
      const current = this.getBoardAt(this.currentIndex);
      const diffs = [];
      for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
          if (board[r][c] !== current[r][c]) {
            diffs.push({ index: r * board.length + c, from: current[r][c], to: board[r][c], selectedCellIndex, timestamp: Date.now() });
          }
        }
      }
      diffs.forEach(d => this.saveDiff(d.index, d.from, d.to, d.selectedCellIndex));
      return true;
    } catch (error) {
      console.error('Erro ao salvar estado no histórico:', error);
      return false;
    }
  }

  /**
   * Salva uma mudança pontual (diff) no histórico
   * @param {number} cellIndex
   * @param {number} from
   * @param {number} to
   * @param {number|null} selectedCellIndex
   */
  saveDiff(cellIndex, from, to, selectedCellIndex = null) {
    try {
      if (from === to) return false;
      this.changes = this.changes.slice(0, this.currentIndex + 1);
      const change = { index: cellIndex, from, to, selectedCellIndex, timestamp: Date.now() };
      this.changes.push(change);
      this.currentIndex++;
      if (this.changes.length > this.maxHistory) {
        const oldest = this.changes.shift();
        if (this.baseBoard) {
          const r = Math.floor(oldest.index / this.baseBoard.length);
          const c = oldest.index % this.baseBoard.length;
          this.baseBoard[r][c] = oldest.to;
        }
        this.currentIndex--;
      }
      return true;
    } catch (error) {
      console.error('Erro ao salvar diff no histórico:', error);
      return false;
    }
  }

  /**
   * Desfaz a última ação
   * @returns {Object|null} Estado anterior ou null se não houver
   */
  undo() {
    if (!this.canUndo()) return null;
    this.currentIndex--;
    const board = this.getBoardAt(this.currentIndex);
    const selectedCellIndex = this.changes[this.currentIndex + 1]?.selectedCellIndex ?? null;
    return { board, selectedCellIndex, timestamp: Date.now() };
  }

  /**
   * Refaz a última ação desfeita
   * @returns {Object|null} Estado seguinte ou null se não houver
   */
  redo() {
    if (!this.canRedo()) return null;
    this.currentIndex++;
    const board = this.getBoardAt(this.currentIndex);
    const selectedCellIndex = this.changes[this.currentIndex]?.selectedCellIndex ?? null;
    return { board, selectedCellIndex, timestamp: Date.now() };
  }

  /**
   * Verifica se é possível desfazer
   * @returns {boolean}
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * Verifica se é possível refazer
   * @returns {boolean}
   */
  canRedo() {
    return this.currentIndex < this.changes.length - 1;
  }

  /**
   * Limpa todo o histórico
   */
  clear() {
    this.baseBoard = null;
    this.changes = [];
    this.currentIndex = -1;
  }

  /**
   * Retorna o número de estados no histórico
   * @returns {number}
   */
  getHistorySize() {
    return this.changes.length;
  }

  /**
   * Ajusta o tamanho máximo do histórico
   * @param {number} max
   */
  setMaxHistory(max) {
    this.maxHistory = Math.max(1, parseInt(max) || 50);
    while (this.changes.length > this.maxHistory) {
      const oldest = this.changes.shift();
      if (this.baseBoard) {
        const r = Math.floor(oldest.index / this.baseBoard.length);
        const c = oldest.index % this.baseBoard.length;
        this.baseBoard[r][c] = oldest.to;
      }
      this.currentIndex--;
    }
  }

  /**
   * Obtém um snapshot do tabuleiro no índice atual
   * @param {number} index
   * @returns {number[][]}
   */
  getBoardAt(index) {
    if (!this.baseBoard) return [];
    const size = this.baseBoard.length;
    const board = this.baseBoard.map(row => [...row]);
    for (let i = 0; i <= index; i++) {
      if (i < 0) continue;
      const ch = this.changes[i];
      const r = Math.floor(ch.index / size);
      const c = ch.index % size;
      board[r][c] = ch.to;
    }
    return board;
  }
}

