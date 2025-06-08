// js/domManager.js
import { SIZE } from './config.js';

/**
 * Cria as células da grade no DOM.
 * @param {HTMLElement} gridElement - O elemento container da grade.
 * @param {Function} onCellInputCallback - Callback para o evento input da célula.
 * @param {Function} onCellClickCallback - Callback para o evento click da célula.
 * @param {Function} onCellFocusCallback - Callback para o evento focus da célula.
 * @returns {HTMLInputElement[]} Array de elementos input das células.
 */
export function createGridUI(gridElement, onCellInputCallback, onCellClickCallback, onCellFocusCallback) {
    gridElement.innerHTML = ''; // Limpa a grade anterior
    const cellsArray = [];
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.className = "cell";
        cell.maxLength = 1;
        cell.dataset.index = i;
        cell.setAttribute("inputmode", "numeric");
        cell.setAttribute("pattern", "[1-9]*");

        cell.addEventListener("input", onCellInputCallback);
        cell.addEventListener("click", onCellClickCallback);
        cell.addEventListener("focus", onCellFocusCallback);
        
        // Prevenir ações em células desabilitadas
        cell.addEventListener("mousedown", (e) => { if (cell.disabled) e.preventDefault(); });
        cell.addEventListener("touchstart", (e) => { if (cell.disabled) e.preventDefault(); });
        cell.addEventListener("selectstart", (e) => { if (cell.disabled) e.preventDefault(); });

        cell.disabled = true; // Começam desabilitadas até um jogo iniciar
        cellsArray.push(cell);
        gridElement.appendChild(cell);
    }
    return cellsArray;
}

export function fillCellsUI(cellsElements, boardData) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const index = row * SIZE + col;
            const cell = cellsElements[index];
            const value = boardData[row][col];
            cell.value = value === 0 ? "" : value.toString();
            cell.classList.toggle("fixed", value !== 0);
            cell.disabled = (value !== 0);
            cell.classList.remove("hint", "invalid", "selected", "highlight", "highlight-fixed"); // Reset visual
            cell.style.animation = ""; // Reset animação
        }
    }
}

export function updateCellsFromBoardUI(cellsElements, boardData) {
    cellsElements.forEach((cell, i) => {
        const row = Math.floor(i / SIZE);
        const col = i % SIZE;
        // Atualiza apenas células não fixas, se necessário, ou todas se for uma solução.
        // Esta função é chamada pelo "Resolver" que preenche tudo.
        if (!cell.classList.contains("fixed")) { // Verifica se a célula não é fixa
             cell.value = boardData[row][col] === 0 ? "" : boardData[row][col].toString();
        }
    });
}


export function clearAllCellsUI(cellsElements) {
    cellsElements.forEach(cell => {
        cell.value = "";
        cell.classList.remove("fixed", "invalid", "hint", "selected", "highlight", "highlight-fixed");
        cell.disabled = true; // Desabilita ao limpar, antes de novo jogo
        cell.style.animation = "";
        cell.style.backgroundColor = '';
        cell.style.boxShadow = '';
    });
}

export function enablePlayableCellsUI(cellsElements) {
    cellsElements.forEach(cell => {
        if (!cell.classList.contains("fixed")) {
            cell.disabled = false;
        }
    });
}

export function highlightInvalidCellUI(cellElement) {
    cellElement.classList.add("invalid");
    setTimeout(() => cellElement.classList.remove("invalid"), 2000);
}

export function highlightNumbersUI(cellsElements, clickedCell) {
    cellsElements.forEach(c => {
        c.classList.remove("highlight", "selected", "highlight-fixed");
        c.style.backgroundColor = ''; // Reset
        c.style.boxShadow = ''; // Reset
    });

    const clickedValue = clickedCell.value;
    if (!clickedValue || clickedCell.disabled) { // Não destacar se vazia ou fixa (já estilizada)
        if(clickedCell.value && clickedCell.classList.contains("fixed")){
            // apenas seleciona a fixa se tiver valor
             clickedCell.classList.add("selected");
        } else {
            return;
        }
    }
    
    clickedCell.classList.add("selected");

    cellsElements.forEach(cell => {
        if (cell.value === clickedValue) {
            if (cell.classList.contains("fixed")) {
                cell.classList.add("highlight-fixed");
                 // Estilos para highlight-fixed já estão no CSS
            } else {
                cell.classList.add("highlight");
                // Estilos para highlight já estão no CSS
            }
        }
    });
}

export function applyHintUI(cellElement, value) {
    cellElement.value = value;
    cellElement.classList.add("hint");
    cellElement.style.animation = "hintPulse 1.5s";
    setTimeout(() => {
        cellElement.style.animation = "";
        // cell.classList.remove("hint"); // Decida se a classe hint deve permanecer
    }, 1500);
}

export function toggleGridAnimation(gridElement, isActive) {
    if (isActive) {
        gridElement.classList.add("grid-animation");
    } else {
        gridElement.classList.remove("grid-animation");
    }
}