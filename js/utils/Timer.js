export class Timer {
  constructor() {
    this.timerInterval = null;
    this.seconds = 0;
    this.timerDisplay = document.getElementById("timer");
  }

  start() {
    this.clear();
    this.seconds = 0;
    this.updateDisplay();

    this.timerInterval = setInterval(() => {
      this.seconds++;
      this.updateDisplay();
    }, 1000);
  }

  clear() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
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
