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
        const avif = `imgs/assets/pig${i}.avif`;
        const png = `imgs/assets/pig${i}.png`;
        const jpg = `imgs/assets/pig${i}.jpg`;
        const img = new Image();
        img.onload = () => {
          this.pigImages[i] = avif;
        };
        img.onerror = () => {
          const imgFallback = new Image();
          imgFallback.onload = () => {
            this.pigImages[i] = png;
          };
          imgFallback.onerror = () => {
            this.pigImages[i] = jpg;
          };
          imgFallback.src = png;
        };
        img.src = avif;
        // Define um default imediato enquanto carrega
        this.pigImages[i] = avif;
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
      try {
        const settings = JSON.parse(localStorage.getItem('sudokinho_settings') || '{}');
        settings.imageMode = newMode;
        localStorage.setItem('sudokinho_settings', JSON.stringify(settings));
      } catch (_) {}
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
      try {
        const settings = JSON.parse(localStorage.getItem('sudokinho_settings') || '{}');
        settings.imageMode = isImageMode;
        localStorage.setItem('sudokinho_settings', JSON.stringify(settings));
      } catch (_) {}
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
        const url = this.pigImages[number] || `imgs/assets/pig${number}.png`;
        cell.style.backgroundImage = `url('${url}')`;
        cell.classList.add('image-mode');
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
      cell.classList.remove('image-mode');

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
