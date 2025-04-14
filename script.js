document.addEventListener("DOMContentLoaded", () => {
    // Constantes e configurações
    const SIZE = 9;
    const SUBGRID_SIZE = 3;
    const MIN_REMOVED_CELLS = 40;
    const MAX_REMOVED_CELLS = 49;
    const MAX_ATTEMPTS = 200;

    // Elementos DOM
    const grid = document.getElementById("sudoku-grid");
    const solveButton = document.getElementById("solve-button");
    const newGameButton = document.getElementById("new-game-button");
    const modal = document.getElementById("customModal");
    const modalButton = document.getElementById("modalButton");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const audioPlayer = document.getElementById('audio-player');

    // Estado do jogo
    const cells = [];
    let currentBoard = createEmptyBoard();
    let timerInterval;
    let seconds = 0;

    // Inicialização do jogo
    initGame();

    // Função principal de inicialização
    function initGame() {
        setupModal();
        createGrid();
        generateSudoku();
        setupSolveButton();
        setupNewGameButton();
        startTimer();
    }

    // Cronômetro
    function startTimer() {
        clearInterval(timerInterval);
        seconds = 0;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Configuração do modal
    function setupModal() {
        modalButton.addEventListener("click", () => modal.style.display = "none");
        window.addEventListener("click", (event) => {
            if (event.target === modal) modal.style.display = "none";
        });
    }

    // Criação da grade
    function createGrid() {
        for (let i = 0; i < SIZE * SIZE; i++) {
            const cell = document.createElement("input");
            cell.type = "text";
            cell.className = "cell";
            cell.maxLength = 1;
            cell.dataset.index = i;
            cell.setAttribute("inputmode", "numeric");
            cell.setAttribute("pattern", "[1-9]*");
            cell.addEventListener("input", validateCellInput);
            cell.addEventListener("click", highlightSameNumbers);
            cell.addEventListener("focus", () => cell.select());
            cells.push(cell);
            grid.appendChild(cell);
        }
    }

    // Validação de entrada da célula
    function validateCellInput(e) {
        const value = e.target.value;
        if (value && !/^[1-9]$/.test(value)) {
            e.target.value = "";
        }
    }

    // Configuração do botão Novo Jogo
    function setupNewGameButton() {
        newGameButton.addEventListener("click", resetGame);
    }

    // Configuração do botão de resolver
    function setupSolveButton() {
        solveButton.addEventListener("click", solveCurrentSudoku);
    }

    // Função para resetar o jogo
    function resetGame() {
        clearInterval(timerInterval);
        generateSudoku();
        startTimer();
        modal.style.display = "none";
    }

    // Lógica para resolver o Sudoku atual
    function solveCurrentSudoku() {
        if (!isCurrentBoardValid()) {
            showCustomAlert("Atenção", "O tabuleiro contém valores inválidos. Corrija antes de resolver.", "error");
            return;
        }

        const boardToSolve = getCurrentBoardState();

        if (solveSudoku(boardToSolve)) {
            updateCellsFromBoard(boardToSolve);
            clearInterval(timerInterval);
            const finalTime = document.getElementById('timer').textContent;
            showCustomAlert("Parabéns Mozi!", `Você completou em ${finalTime}! Você é a melhor!`, "success");
        } else {
            showCustomAlert("Poxa Mozi", "Tenta de novo aí", "error");
        }
    }

    // Geração de um novo Sudoku
    function generateSudoku() {
        currentBoard = createEmptyBoard();
        clearAllCells();
        fillBoard(currentBoard);
        removeNumbers(currentBoard);
        fillCells(currentBoard);
    }

    // Funções auxiliares do Sudoku
    function createEmptyBoard() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    }

    function fillBoard(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffleArray([...Array(SIZE).keys()].map(n => n + 1));
                    for (const num of numbers) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num;
                            if (fillBoard(board)) return true;
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function removeNumbers(board) {
        let cellsToRemove = MIN_REMOVED_CELLS + Math.floor(Math.random() * (MAX_REMOVED_CELLS - MIN_REMOVED_CELLS + 1));
        let attempts = 0;

        while (cellsToRemove > 0 && attempts < MAX_ATTEMPTS) {
            const row = Math.floor(Math.random() * SIZE);
            const col = Math.floor(Math.random() * SIZE);

            if (board[row][col] !== 0) {
                const temp = board[row][col];
                board[row][col] = 0;

                const boardCopy = board.map(row => [...row]);
                if (countSolutions(boardCopy) === 1) {
                    cellsToRemove--;
                } else {
                    board[row][col] = temp; // Reverte se não for solução única
                }

                attempts++;
            }
        }
    }

    function countSolutions(board, count = 0) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= SIZE && count < 2; num++) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num;
                            count = countSolutions(board, count);
                            board[row][col] = 0;
                        }
                    }
                    return count;
                }
            }
        }
        return count + 1;
    }

    function fillCells(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const index = row * SIZE + col;
                const cell = cells[index];
                const value = board[row][col];

                cell.value = value || "";
                cell.classList.toggle("fixed", value !== 0);
                cell.disabled = value !== 0;
            }
        }
    }

    function solveSudoku(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= SIZE; num++) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num;
                            if (solveSudoku(board)) return true;
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function isValidPlacement(num, row, col, board) {
        // Verifica linha e coluna
        for (let i = 0; i < SIZE; i++) {
            if ((board[row][i] === num && i !== col) || 
                (board[i][col] === num && i !== row)) {
                return false;
            }
        }

        // Verifica quadrante 3x3
        const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
        const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;

        for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
            for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
                if (board[i][j] === num && i !== row && j !== col) {
                    return false;
                }
            }
        }

        return true;
    }

    function isCurrentBoardValid() {
        const board = getCurrentBoardState();
    
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const num = board[row][col];
                if (num !== 0) {
                    board[row][col] = 0; // remove temporariamente o número
                    if (!isValidPlacement(num, row, col, board)) {
                        highlightInvalidCell(row, col);
                        board[row][col] = num; // restaura o valor
                        return false;
                    }
                    board[row][col] = num; // restaura o valor
                }
            }
        }
        return true;
    }

    // NOVA FUNÇÃO: Destacar números iguais
    function highlightSameNumbers(e) {
        // Remove destaque anterior
        cells.forEach(c => {
            c.classList.remove("highlight", "selected", "highlight-fixed");
            c.style.backgroundColor = '';
            c.style.boxShadow = '';
        });

        const clickedCell = e.target;
        const clickedValue = clickedCell.value;

        if (!clickedValue) return;

        // Adiciona classe à célula clicada
        clickedCell.classList.add("selected");

        // Destaca todas as células com o mesmo valor
        cells.forEach(cell => {
            if (cell.value === clickedValue) {
                if (cell.classList.contains("fixed")) {
                    // Destaque diferente para números fixos (pré-preenchidos)
                    cell.classList.add("highlight-fixed");
                    cell.style.backgroundColor = '#d8a4ff';
                    cell.style.boxShadow = '0 0 0 2px #8436c7';
                } else {
                    // Destaque para números inseridos pelo jogador
                    cell.classList.add("highlight");
                    cell.style.backgroundColor = '#d8a4ff';
                    cell.style.boxShadow = '0 0 0 2px  #8436c7';
                }
            }
        });
    }

    function highlightInvalidCell(row, col) {
        const index = row * SIZE + col;
        cells[index].classList.add("invalid");
        setTimeout(() => cells[index].classList.remove("invalid"), 2000);
    }

    function getCurrentBoardState() {
        const board = createEmptyBoard();
        cells.forEach((cell, i) => {
            const row = Math.floor(i / SIZE);
            const col = i % SIZE;
            board[row][col] = cell.value ? parseInt(cell.value) : 0;
        });
        return board;
    }

    function updateCellsFromBoard(board) {
        cells.forEach((cell, i) => {
            const row = Math.floor(i / SIZE);
            const col = i % SIZE;
            if (!cell.classList.contains("fixed")) {
                cell.value = board[row][col];
            }
        });
    }

    function clearAllCells() {
        cells.forEach(cell => {
            cell.value = "";
            cell.classList.remove("fixed", "invalid");
            cell.disabled = false;
        });
    }

    function showCustomAlert(title, message, type) {
        if (type === "success") {
            clearInterval(timerInterval);
        }
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        const content = modal.querySelector(".modal-content");
        content.style.background = type === "success"
            ? "linear-gradient(135deg,rgb(155, 55, 231) 0%,rgb(155, 55, 231) 100%)"
            : "linear-gradient(135deg, #f44336 0%, #c62828 100%)";

        modal.style.display = "block";
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Evento para tocar áudio
    document.getElementById('play-button').addEventListener('click', function() {
        audioPlayer.play();
    });
});