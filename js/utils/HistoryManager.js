/**
 * Gerenciador de histórico para funcionalidade Undo/Redo
 * @class HistoryManager
 */
export class HistoryManager {
  constructor(maxHistory = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = maxHistory;
  }

  /**
   * Salva o estado atual do tabuleiro
   * @param {number[][]} board - Estado atual do tabuleiro
   * @param {number} selectedCellIndex - Índice da célula selecionada
   * @returns {boolean} True se o estado foi salvo com sucesso
   */
  saveState(board, selectedCellIndex = null) {
    try {
      // Remove estados futuros se houver undo
      this.history = this.history.slice(0, this.currentIndex + 1);
      
      // Adiciona novo estado
      const state = {
        board: board.map(row => [...row]),
        selectedCellIndex,
        timestamp: Date.now()
      };
      
      this.history.push(state);
      this.currentIndex++;
      
      // Limita o tamanho do histórico
      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.currentIndex--;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar estado no histórico:', error);
      return false;
    }
  }

  /**
   * Desfaz a última ação
   * @returns {Object|null} Estado anterior ou null se não houver
   */
  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Refaz a última ação desfeita
   * @returns {Object|null} Estado seguinte ou null se não houver
   */
  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Verifica se é possível desfazer
   * @returns {boolean}
   */
  canUndo() {
    return this.currentIndex > 0;
  }

  /**
   * Verifica se é possível refazer
   * @returns {boolean}
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Limpa todo o histórico
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Retorna o número de estados no histórico
   * @returns {number}
   */
  getHistorySize() {
    return this.history.length;
  }
}

