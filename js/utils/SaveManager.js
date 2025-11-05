/**
 * Gerenciador de persistência LocalStorage
 * @class SaveManager
 */
export class SaveManager {
  constructor() {
    this.SAVE_KEY = 'sudokinho_save';
    this.STATS_KEY = 'sudokinho_stats';
    this.SETTINGS_KEY = 'sudokinho_settings';
  }

  /**
   * Salva o estado atual do jogo
   * @param {Object} gameData - Dados do jogo
   * @returns {boolean} True se salvou com sucesso
   */
  saveGame(gameData) {
    try {
      const saveData = {
        board: gameData.board,
        solution: gameData.solution,
        difficulty: gameData.difficulty,
        time: gameData.time,
        imageMode: gameData.imageMode,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
      // Se o localStorage estiver cheio, tentar limpar dados antigos
      if (error.name === 'QuotaExceededError') {
        this.clearOldSaves();
        try {
          localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
          return true;
        } catch (retryError) {
          console.error('Erro ao salvar após limpeza:', retryError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Carrega o jogo salvo
   * @returns {Object|null} Dados do jogo ou null
   */
  loadGame() {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return null;
      
      const gameData = JSON.parse(saved);
      
      // Verificar se não é muito antigo (7 dias)
      const daysSinceSave = (Date.now() - gameData.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceSave > 7) {
        this.clearSave();
        return null;
      }
      
      return gameData;
    } catch (error) {
      console.error('Erro ao carregar jogo:', error);
      this.clearSave();
      return null;
    }
  }

  /**
   * Verifica se existe um jogo salvo
   * @returns {boolean}
   */
  hasSaveGame() {
    try {
      return localStorage.getItem(this.SAVE_KEY) !== null;
    } catch (error) {
      console.error('Erro ao verificar jogo salvo:', error);
      return false;
    }
  }

  /**
   * Remove o jogo salvo
   */
  clearSave() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch (error) {
      console.error('Erro ao limpar jogo salvo:', error);
    }
  }

  /**
   * Salva estatísticas
   * @param {Object} stats - Estatísticas do jogo
   */
  saveStats(stats) {
    try {
      const existingStats = this.loadStats();
      const updatedStats = {
        ...existingStats,
        ...stats,
        lastUpdated: Date.now()
      };
      localStorage.setItem(this.STATS_KEY, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  }

  /**
   * Carrega estatísticas
   * @returns {Object} Estatísticas
   */
  loadStats() {
    try {
      const saved = localStorage.getItem(this.STATS_KEY);
      return saved ? JSON.parse(saved) : this.getDefaultStats();
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Retorna estatísticas padrão
   * @returns {Object}
   */
  getDefaultStats() {
    return {
      gamesPlayed: 0,
      gamesCompleted: 0,
      bestTimes: {},
      averageTimes: {},
      hintsUsed: 0,
      errors: 0,
      streak: 0,
      bestStreak: 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Salva configurações do usuário
   * @param {Object} settings - Configurações
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  /**
   * Carrega configurações do usuário
   * @returns {Object} Configurações
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem(this.SETTINGS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return {};
    }
  }

  /**
   * Limpa dados antigos do localStorage
   */
  clearOldSaves() {
    try {
      // Limpar apenas saves antigos (mais de 30 dias)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sudokinho_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.timestamp) {
              const daysSince = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
              if (daysSince > 30) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // Ignorar erros ao processar chaves individuais
          }
        }
      });
    } catch (error) {
      console.error('Erro ao limpar dados antigos:', error);
    }
  }
}

