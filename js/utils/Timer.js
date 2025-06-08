export class Timer {
  constructor() {
    this.timerInterval = null;
    this.seconds = 0;
    this.timerDisplay = document.getElementById("timer");
  }

  start() {
    this.clear();
    this.seconds = 0; // ✅ SEMPRE resetar para novo jogo
    this.updateDisplay();

    this.timerInterval = setInterval(() => {
      this.seconds++;
      this.updateDisplay();
    }, 1000);
  }

  // ✨ NOVA FUNÇÃO: Continuar timer do ponto atual
  resume() {
    if (this.timerInterval) return; // Já está rodando

    this.timerInterval = setInterval(() => {
      this.seconds++;
      this.updateDisplay();
    }, 1000);
  }

  // ✨ NOVA FUNÇÃO: Restaurar timer com tempo específico
  restoreAndStart(savedSeconds) {
    this.clear();
    this.seconds = savedSeconds;
    this.updateDisplay();
    this.resume(); // Usa resume para não resetar os seconds
  }

  clear() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ✨ NOVA FUNÇÃO: Pausar sem limpar o tempo
  pause() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ✨ NOVA FUNÇÃO: Reset completo
  reset() {
    this.clear();
    this.seconds = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    const minutes = Math.floor(this.seconds / 60);
    const remainingSeconds = this.seconds % 60;
    this.timerDisplay.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  getCurrentTime() {
    return this.timerDisplay.textContent;
  }
}
