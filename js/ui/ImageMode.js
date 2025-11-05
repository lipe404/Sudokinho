/**
 * Gerenciador de modo de imagem (porquinhos)
 * @class ImageMode
 */
export class ImageMode {
  constructor(gameState) {
    this.gameState = gameState;
    this.pigImages = {};
    this.preloadImages();
  }

  /**
   * Pré-carrega as imagens dos porquinhos
   */
  preloadImages() {
    try {
      for (let i = 1; i <= 9; i++) {
        const img = new Image();
        img.src = `imgs/assets/pig${i}.png`;
        img.onerror = () => {
          console.warn(`Imagem pig${i}.png não encontrada`);
        };
        this.pigImages[i] = img;
      }
    } catch (error) {
      console.error('Erro ao pré-carregar imagens:', error);
    }
  }

  /**
   * Alterna o modo de imagem
   */
  toggleMode() {
    try {
      const newMode = !this.gameState.getImageMode();
      this.gameState.setImageMode(newMode);
      this.updateAllCells();
      this.updateModeButton();
    } catch (error) {
      console.error('Erro ao alternar modo de imagem:', error);
    }
  }

  /**
   * Define o modo de imagem
   * @param {boolean} isImageMode - Se o modo de imagem está ativo
   */
  setMode(isImageMode) {
    try {
      this.gameState.setImageMode(isImageMode);
      this.updateAllCells();
      this.updateModeButton();
    } catch (error) {
      console.error('Erro ao definir modo de imagem:', error);
    }
  }

  /**
   * Atualiza todas as células
   */
  updateAllCells() {
    try {
      this.gameState.cells.forEach((cell) => {
        this.updateCellDisplay(cell);
      });
    } catch (error) {
      console.error('Erro ao atualizar células:', error);
    }
  }

  /**
   * Atualiza o display de uma célula específica
   * @param {HTMLElement} cell - Elemento da célula
   */
  updateCellDisplay(cell) {
    try {
      if (!cell) return;

      const isImageMode = this.gameState.getImageMode();
      if (isImageMode && cell.value && cell.value !== "") {
        this.setCellImage(cell, parseInt(cell.value));
      } else {
        this.setCellText(cell);
      }
    } catch (error) {
      console.error('Erro ao atualizar display da célula:', error);
    }
  }

  /**
   * Define a imagem da célula
   * @param {HTMLElement} cell - Elemento da célula
   * @param {number} number - Número (1-9)
   */
  setCellImage(cell, number) {
    try {
      if (number >= 1 && number <= 9 && cell) {
        cell.style.backgroundImage = `url('imgs/assets/pig${number}.png')`;
        cell.style.backgroundSize = "contain";
        cell.style.backgroundRepeat = "no-repeat";
        cell.style.backgroundPosition = "center";
        cell.style.color = "transparent";
        cell.style.fontSize = "0";
        cell.setAttribute("data-value", number);
      }
    } catch (error) {
      console.error('Erro ao definir imagem da célula:', error);
    }
  }

  /**
   * Define o texto da célula
   * @param {HTMLElement} cell - Elemento da célula
   */
  setCellText(cell) {
    try {
      if (!cell) return;

      cell.style.backgroundImage = "none";
      cell.style.color = "";
      cell.style.fontSize = "";

      const dataValue = cell.getAttribute("data-value");
      if (dataValue) {
        cell.value = dataValue;
      }
    } catch (error) {
      console.error('Erro ao definir texto da célula:', error);
    }
  }

  /**
   * Atualiza o botão do modo
   */
  updateModeButton() {
    try {
      const button = document.getElementById("image-mode-button");
      if (button) {
        const isImageMode = this.gameState.getImageMode();
        button.textContent = isImageMode ? "🔢" : "🐹";
        button.setAttribute(
          "aria-label",
          isImageMode
            ? "Mudar para modo números"
            : "Mudar para modo porquinhos"
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar botão do modo:', error);
    }
  }

  /**
   * Obtém o modo atual
   * @returns {boolean}
   */
  getCurrentMode() {
    return this.gameState.getImageMode();
  }
}
