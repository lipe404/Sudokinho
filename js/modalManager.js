// js/modalManager.js

// Modal Genérico
const generalModal = document.getElementById("customModal");
const generalModalTitle = document.getElementById("modalTitle");
const generalModalMessage = document.getElementById("modalMessage");
const generalModalButton = document.getElementById("modalButton");

// Modal de Dificuldade
const difficultyModal = document.getElementById("difficultyModal");
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

export function setupGeneralModal() {
    if (generalModalButton) generalModalButton.addEventListener("click", () => generalModal.style.display = "none");
    window.addEventListener("click", (event) => {
        if (event.target === generalModal) generalModal.style.display = "none";
    });
}

export function showCustomAlert(title, message, type = "info", timerValue = "") {
    if (!generalModal || !generalModalTitle || !generalModalMessage) return;

    generalModalTitle.textContent = title;
    let fullMessage = message;
    if (type === "success" && timerValue) {
        fullMessage = `Parabéns! Você completou em ${timerValue}! ${message}`;
    }
    generalModalMessage.textContent = fullMessage;

    const content = generalModal.querySelector(".modal-content");
    if (content) {
        if (type === "success") {
            content.style.background = "linear-gradient(135deg,rgb(76,175,80) 0%,rgb(76,175,80) 100%)"; // Cor de sucesso
        } else if (type === "error") {
            content.style.background = "linear-gradient(135deg, #ff5555 0%, #ff5555 100%)";
        } else { // info ou default
            content.style.background = "linear-gradient(135deg,rgb(155, 55, 231) 0%,rgb(155, 55, 231) 100%)"; // Cor padrão do modal
        }
    }
    generalModal.style.display = "block"; // Usar 'flex' se o CSS do modal usa display:flex para centralizar
}

function showModalWithTransition(modalElement) {
    if (!modalElement) return;
    modalElement.style.display = 'flex';
    requestAnimationFrame(() => { // Garante que o display:flex seja aplicado antes de adicionar a classe
        modalElement.classList.add('fade-in');
        modalElement.classList.remove('fade-out');
    });
}

function hideModalWithTransition(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('fade-in');
    modalElement.classList.add('fade-out');

    const handleTransitionEnd = () => {
        modalElement.style.display = 'none';
        modalElement.classList.remove('fade-out');
        modalElement.removeEventListener('transitionend', handleTransitionEnd);
    };
    modalElement.addEventListener('transitionend', handleTransitionEnd);
}

export function showDifficultyModalUI(onDifficultySelectCallback) {
    if (!difficultyModal) return;
    showModalWithTransition(difficultyModal);
    difficultyButtons.forEach(button => {
        // Remove listener antigo para evitar múltiplos registros se chamado várias vezes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', (event) => {
            const difficulty = event.target.getAttribute('data-difficulty');
            onDifficultySelectCallback(difficulty);
        }, { once: true });
    });
}

export function hideDifficultyModalUI() {
   if (difficultyModal) hideModalWithTransition(difficultyModal);
}