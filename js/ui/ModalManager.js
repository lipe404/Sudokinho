export class ModalManager {
  constructor() {
    this.modal = document.getElementById("customModal");
    this.modalButton = document.getElementById("modalButton");
    this.modalTitle = document.getElementById("modalTitle");
    this.modalMessage = document.getElementById("modalMessage");
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
    this.modalMessage.textContent = message;
    const content = this.modal.querySelector(".modal-content");

    content.style.background =
      type === "success"
        ? "linear-gradient(135deg,rgb(155, 55, 231) 0%,rgb(155, 55, 231) 100%)"
        : "linear-gradient(135deg, #ff5555 0%, #ff5555 100%)";

    this.modal.style.display = "block";
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "flex";
    modal.classList.add("fade-in");
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("fade-in");
    modal.classList.add("fade-out");

    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("fade-out");
    }, 300);
  }
}
