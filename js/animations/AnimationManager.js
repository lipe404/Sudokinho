export class AnimationManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.loopAnimacao = null;
  }

  startGridAnimation() {
    const grid = document.getElementById("sudoku-grid");
    grid.classList.add("grid-animation");
    this.animarGridSudoku();
  }

  animarGridSudoku() {
    const cells = document.querySelectorAll(".cell");

    const animarSequencia = () => {
      cells.forEach((cell, i) => {
        setTimeout(() => {
          cell.classList.add("animated");
          setTimeout(() => cell.classList.remove("animated"), 1200);
        }, i * 15);
      });
    };

    animarSequencia();

    this.loopAnimacao = setInterval(() => {
      if (this.gameState.animacaoAtiva) {
        animarSequencia();
      }
    }, 1500);
  }

  animateHint(cell) {
    cell.classList.add("hint");
    cell.style.animation = "hintPulse 1.5s";
    setTimeout(() => {
      cell.style.animation = "";
    }, 1500);
  }

  stopGridAnimation() {
    if (this.loopAnimacao) {
      clearInterval(this.loopAnimacao);
      this.loopAnimacao = null;
    }
    this.gameState.animacaoAtiva = false;
  }
}
