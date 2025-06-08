// js/animationManager.js
let gridAnimationLoop;
let isGridAnimationActive = true;

export function startInitialGridAnimation(cellsElements) {
    if (!cellsElements || cellsElements.length === 0) return;
    isGridAnimationActive = true;

    function animateSequence() {
        cellsElements.forEach((cell, i) => {
            setTimeout(() => {
                cell.classList.add('animated'); // CSS: .animated { animation: colorFlash ... }
                setTimeout(() => cell.classList.remove('animated'), 1200);
            }, i * 15);
        });
    }
    animateSequence(); // Primeira execução
    gridAnimationLoop = setInterval(() => {
        if (isGridAnimationActive) {
            animateSequence();
        }
    }, 1500); // Ajuste o tempo conforme a duração da animação + delay desejado
}

export function stopInitialGridAnimation() {
    isGridAnimationActive = false;
    clearInterval(gridAnimationLoop);
    // Poderia também remover a classe 'animated' de todas as células aqui se necessário.
}