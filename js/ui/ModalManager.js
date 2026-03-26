export class ModalManager {
  constructor() {
    this.modal = document.getElementById("customModal");
    this.modalButton = document.getElementById("modalButton");
    this.modalTitle = document.getElementById("modalTitle");
    this.modalMessage = document.getElementById("modalMessage");
    this.previouslyFocused = null;
    this.focusTrapHandler = null;
    this.openModals = new Set();
    this.mainContainer = document.querySelector("main.container");
  }

  setup() {
    this.modalButton.addEventListener(
      "click",
      () => (this.modal.style.display = "none")
    );
    window.addEventListener("click", (event) => {
      if (event.target === this.modal) this.modal.style.display = "none";
    });
  }

  showCustomAlert(title, message, type) {
    if (type === "success") {
      // Lógica específica para sucesso será tratada pelo GameController
    }

    this.modalTitle.textContent = title;
    
    // Se message contém HTML, usar innerHTML, senão textContent
    if (message.includes('<') && message.includes('>')) {
      this.modalMessage.innerHTML = message;
    } else {
      this.modalMessage.textContent = message;
    }
    
    const content = this.modal.querySelector(".modal-content");

    content.style.background =
      type === "success"
        ? "linear-gradient(135deg,rgb(155, 55, 231) 0%,rgb(155, 55, 231) 100%)"
        : type === "info"
        ? "linear-gradient(135deg, #2196f3 0%, #2196f3 100%)"
        : "linear-gradient(135deg, #ff5555 0%, #ff5555 100%)";

    this.modal.style.display = "block";
    this.trapFocus(this.modal);
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "flex";
    modal.classList.add("fade-in");
    this.trapFocus(modal);
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("fade-in");
    modal.classList.add("fade-out");

    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("fade-out");
      this.releaseFocus(modal);
    }, 300);
  }

  trapFocus(modalEl) {
    if (!modalEl) return;
    this.openModals.add(modalEl.id || 'customModal');
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    const focusables = modalEl.querySelectorAll(focusableSelectors.join(','));
    const focusArray = Array.from(focusables).filter(el => el.offsetParent !== null);
    this.previouslyFocused = document.activeElement;
    if (focusArray.length > 0) {
      focusArray[0].focus();
    } else {
      modalEl.setAttribute('tabindex', '-1');
      modalEl.focus();
    }
    if (this.mainContainer) {
      this.mainContainer.setAttribute('aria-hidden', 'true');
    }
    const handleKeydown = (e) => {
      if (e.key !== 'Tab') return;
      const updatedFocusables = Array.from(modalEl.querySelectorAll(focusableSelectors.join(','))).filter(el => el.offsetParent !== null);
      if (updatedFocusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = updatedFocusables[0];
      const last = updatedFocusables[updatedFocusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    modalEl._focusTrapHandler = handleKeydown;
    modalEl.addEventListener('keydown', handleKeydown);
  }

  releaseFocus(modalEl) {
    if (modalEl && modalEl._focusTrapHandler) {
      modalEl.removeEventListener('keydown', modalEl._focusTrapHandler);
      delete modalEl._focusTrapHandler;
    }
    if (this.openModals.size > 0) {
      this.openModals.delete(modalEl.id || 'customModal');
    }
    if (this.openModals.size === 0 && this.mainContainer) {
      this.mainContainer.removeAttribute('aria-hidden');
    }
    if (this.previouslyFocused && typeof this.previouslyFocused.focus === 'function') {
      this.previouslyFocused.focus();
      this.previouslyFocused = null;
    }
  }

  announce(message) {
    try {
      const region = document.getElementById('a11y-announcement');
      if (!region) return;
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 10);
    } catch (e) {}
  }
}
