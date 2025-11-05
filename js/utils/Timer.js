/**
 * Gerenciador de timer sincronizado com GameState
 * @class Timer
 */
export class Timer {
  constructor(gameState) {
    this.gameState = gameState;
    this.timerDisplay = null;
    this.initializeDisplay();
  }

  /**
   * Inicializa o elemento de display do timer
   */
  initializeDisplay() {
    try {
      this.timerDisplay = document.getElementById("timer");
      if (!this.timerDisplay) {
        console.warn('Elemento timer não encontrado no DOM');
      }
    } catch (error) {
      console.error('Erro ao inicializar display do timer:', error);
    }
  }

  /**
   * Inicia o timer
   */
  start() {
    try {
      this.clear();
      this.gameState.timer.seconds = 0;
      this.gameState.timer.isRunning = true;
      this.updateDisplay();

      this.gameState.timer.interval = setInterval(() => {
        this.gameState.timer.seconds++;
        this.updateDisplay();
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar timer:', error);
      this.gameState.timer.isRunning = false;
    }
  }

  /**
   * Continua o timer do ponto atual
   */
  resume() {
    try {
      if (this.gameState.timer.interval) return;

      this.gameState.timer.isRunning = true;
      this.gameState.timer.interval = setInterval(() => {
        this.gameState.timer.seconds++;
        this.updateDisplay();
      }, 1000);
    } catch (error) {
      console.error('Erro ao retomar timer:', error);
      this.gameState.timer.isRunning = false;
    }
  }

  /**
   * Restaura timer com tempo específico
   * @param {number} savedSeconds - Segundos salvos
   */
  restoreAndStart(savedSeconds) {
    try {
      this.clear();
      this.gameState.timer.seconds = savedSeconds || 0;
      this.updateDisplay();
      this.resume();
    } catch (error) {
      console.error('Erro ao restaurar timer:', error);
    }
  }

  /**
   * Limpa o timer
   */
  clear() {
    try {
      if (this.gameState.timer.interval) {
        clearInterval(this.gameState.timer.interval);
        this.gameState.timer.interval = null;
      }
      this.gameState.timer.isRunning = false;
    } catch (error) {
      console.error('Erro ao limpar timer:', error);
    }
  }

  /**
   * Pausa o timer sem limpar o tempo
   */
  pause() {
    try {
      if (this.gameState.timer.interval) {
        clearInterval(this.gameState.timer.interval);
        this.gameState.timer.interval = null;
      }
      this.gameState.timer.isRunning = false;
    } catch (error) {
      console.error('Erro ao pausar timer:', error);
    }
  }

  /**
   * Reseta o timer completamente
   */
  reset() {
    try {
      this.clear();
      this.gameState.timer.seconds = 0;
      this.updateDisplay();
    } catch (error) {
      console.error('Erro ao resetar timer:', error);
    }
  }

  /**
   * Atualiza o display do timer
   */
  updateDisplay() {
    try {
      if (!this.timerDisplay) {
        this.initializeDisplay();
        if (!this.timerDisplay) return;
      }

      const seconds = this.gameState.timer.seconds;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      this.timerDisplay.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error('Erro ao atualizar display do timer:', error);
    }
  }

  /**
   * Obtém o tempo atual formatado
   * @returns {string}
   */
  getCurrentTime() {
    try {
      if (this.timerDisplay) {
        return this.timerDisplay.textContent;
      }
      const seconds = this.gameState.timer.seconds;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error('Erro ao obter tempo atual:', error);
      return "00:00";
    }
  }

  /**
   * Obtém os segundos atuais
   * @returns {number}
   */
  getSeconds() {
    return this.gameState.timer.seconds;
  }
}
