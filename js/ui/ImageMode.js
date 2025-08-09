// js/ui/ImageMode.js
export class ImageMode {
  constructor(gameState) {
    this.gameState = gameState;
    this.isImageMode = false;
    this.pigImages = {};
    this.preloadImages();
  }

  preloadImages() {
    for (let i = 1; i <= 9; i++) {
      const img = new Image();
      img.src = `imgs/assets/pig${i}.png`;
      this.pigImages[i] = img;
    }
  }

  toggleMode() {
    this.isImageMode = !this.isImageMode;
    this.updateAllCells();
    this.updateModeButton();
  }

  setMode(isImageMode) {
    this.isImageMode = isImageMode;
    this.updateAllCells();
    this.updateModeButton();
  }

  updateAllCells() {
    this.gameState.cells.forEach((cell, index) => {
      this.updateCellDisplay(cell);
    });
  }

  updateCellDisplay(cell) {
    if (this.isImageMode && cell.value && cell.value !== "") {
      this.setCellImage(cell, parseInt(cell.value));
    } else {
      this.setCellText(cell);
    }
  }

  setCellImage(cell, number) {
    if (number >= 1 && number <= 9) {
      // Limpar conteúdo de texto
      cell.style.backgroundImage = `url('imgs/assets/pig${number}.png')`;
      cell.style.backgroundSize = "contain";
      cell.style.backgroundRepeat = "no-repeat";
      cell.style.backgroundPosition = "center";
      cell.style.color = "transparent";
      cell.style.fontSize = "0";

      // Manter o valor para lógica do jogo
      cell.setAttribute("data-value", number);
    }
  }

  setCellText(cell) {
    cell.style.backgroundImage = "none";
    cell.style.color = "";
    cell.style.fontSize = "";

    const dataValue = cell.getAttribute("data-value");
    if (dataValue) {
      cell.value = dataValue;
    }
  }

  updateModeButton() {
    const button = document.getElementById("image-mode-button");
    if (button) {
      button.textContent = this.isImageMode ? "🔢" : "🐹";
      button.setAttribute(
        "aria-label",
        this.isImageMode
          ? "Mudar para modo números"
          : "Mudar para modo porquinhos"
      );
    }
  }

  getCurrentMode() {
    return this.isImageMode;
  }
}
