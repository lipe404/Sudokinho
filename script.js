/**
 * Sudoku Game Script
 * Desenvolvido por Felipe Toledo @spaceman.404
 * Versão: 2.0
 * Data: 15-04-2025
 * Descrição: Gera um tabuleiro de Sudoku com diferentes níveis de dificuldade,
 * permite ao usuário resolver o puzzle e verificar a validade da solução.
 * Inclui funcionalidades de dica, cronômetro e animações.
 * O jogo é jogável em dispositivos móveis e desktop.
 * Funcionalidades:
 * - Geração de tabuleiro aleatório
 * - Validação de entradas
 * - Resolução automática
 * - Dicas para o jogador
 * - Cronômetro para medir o tempo de jogo
 * - Modal para mensagens e alertas
 * - Controle de áudio
 * - Destaque para células e números iguais
 * - Animações para dicas e validações
 * - Responsividade para dispositivos móveis
 * - Estilo moderno e atraente
 * - Código modular e limpo
 * - Comentários explicativos
 * - Melhorias de desempenho
 * - Controle de dificuldade
 * - Animação de inicialização
 */
document.addEventListener("DOMContentLoaded", () => {
    // Constantes e configurações
    const SIZE = 9; // Tamanho da grade do Sudoku (9x9)
    const SUBGRID_SIZE = 3; // Tamanho do subgrid (3x3)
    const MAX_ATTEMPTS = 300; // Tentativas para encontrar uma configuração jogável válida
    const HINT_COOL_DOWN = 60000; // 60 segundos entre dicas
    // Elementos DOM
    const grid = document.getElementById("sudoku-grid"); // Grid do Sudoku
    const solveButton = document.getElementById("solve-button"); // Botão de solução
    const newGameButton = document.getElementById("new-game-button"); // Botão de novo jogo
    const hintButton = document.getElementById("hint-button"); // Botão de dica
    const modal = document.getElementById("customModal"); // Modal
    const modalButton = document.getElementById("modalButton"); // Botão do modal
    const modalTitle = document.getElementById("modalTitle"); // Título do modal
    const modalMessage = document.getElementById("modalMessage"); // Mensagem do modal
    const audioPlayer = document.getElementById('audio-player'); // Elemento de áudio
    const playButton = document.getElementById('play-button'); // Botão de tocar áudio
    const pauseButton = document.getElementById('pause-button'); // Botão de pausar áudio
    // Níveis de dificuldade
    const DIFFICULTY_LEVELS = {
        easy: { min: 30, max: 40, name: "Fácil" }, // Nível fácil
        medium: { min: 40, max: 50, name: "Médio" }, // Nível médio
        hard: { min: 50, max: 60, name: "Difícil" } // Nível difícil
    };
    let currentDifficulty = DIFFICULTY_LEVELS.medium; // Dificuldade padrão
    // Estado do jogo
    const cells = []; // Células do Sudoku
    let currentBoard = createEmptyBoard(); // Tabuleiro atual
    let solutionBoard = createEmptyBoard(); // Armazenar a solução para dicas
    let timerInterval; // Intervalo do cronômetro
    let seconds = 0; // Tempo em segundos
    let lastHintTime = 0; // Controle do tempo entre dicas
    let playerCompleted = false; // Para verificar se o jogador completou o jogo
    let animacaoAtiva = true; // Controle de animação
    let loopAnimacao; // Controle de loop de animação
    // Inicialização do jogo
    initGame();
    // Função principal de inicialização
    function initGame() {
        setupModal(); // Configuração do modal
        createGrid(); // Criação da grade
        setupSolveButton(); // Configuração do botão de solução
        setupNewGameButton(); // Configuração do botão de novo jogo
        setupHintButton(); // Configuração do botão de dica
        setupAudioControls(); // Configuração dos controles de áudio
        solveButton.style.display = "none"; // Ocultar o botão de solução
        hintButton.style.display = "none"; // Ocultar o botão de dica
        animarGridSudoku() // Chama a função de animação
        grid.classList.add("grid-animation") // Adiciona a classe de animação
    }
    //Controles de Áudio
    function setupAudioControls() {
        // Botão Play
        playButton.addEventListener('click', () => {
            audioPlayer.play();
            playButton.style.display = 'none';
            pauseButton.style.display = 'block';
            playButton.setAttribute('aria-pressed', 'true');
            pauseButton.setAttribute('aria-pressed', 'false');
        });
        // Botão Pause
        pauseButton.addEventListener('click', () => {
            audioPlayer.pause();
            pauseButton.style.display = 'none';
            playButton.style.display = 'block';
            pauseButton.setAttribute('aria-pressed', 'true');
            playButton.setAttribute('aria-pressed', 'false');
        });
        // Atualizar estado inicial
        if (audioPlayer.paused) {
            pauseButton.style.display = 'none';
            playButton.style.display = 'block';
        } else {
            pauseButton.style.display = 'block';
            playButton.style.display = 'none';
        }
    }
    //Configuração do botão de dica
    function setupHintButton() {
        hintButton.addEventListener('click', provideHint); // Adiciona evento de clique
    }
    // Função para fornecer dicas
    function provideHint() {
        const now = Date.now();
        // Verificar cooldown
        if (now - lastHintTime < HINT_COOL_DOWN) {
            const remainingTime = Math.ceil((HINT_COOL_DOWN - (now - lastHintTime)) / 1000); // Tempo restante em segundos
            showCustomAlert("Aguarde", `Você pode pedir outra dica em ${remainingTime} segundos.`, "info"); // Mensagem de espera
            return; // Sai da função
        }
        // Encontrar células vazias
        const emptyCells = [];
        for (let i = 0; i < cells.length; i++) {
            if (!cells[i].value && !cells[i].disabled) {
                emptyCells.push(i);
            }
        }
        if (emptyCells.length === 0) {
            showCustomAlert("O tabuleiro já está completo!");
            solveButton.style.display = "none"; // Ocultar o botão de solução
            hintButton.style.display = "none"; // Ocultar o botão de dica
            return;
        }
        // Escolher uma célula aleatória vazia
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]; // Índice da célula escolhida
        const cell = cells[randomIndex]; // Célula escolhida
        const row = Math.floor(randomIndex / SIZE); // Linha da célula
        const col = randomIndex % SIZE; // Coluna da célula
        cell.value = solutionBoard[row][col]; // Preenche a célula
        cell.classList.add("hint"); // Adiciona classe de dica
        cell.style.animation = "hintPulse 1.5s"; // Animação de pulsação
        setTimeout(() => {
            cell.style.animation = ""; // Remove a animação após 1.5s
        }, 1500);
        lastHintTime = now; // Atualiza o tempo da última dica
    }
    // Cronômetro
    function startTimer() {
        clearInterval(timerInterval); // Limpa o intervalo anterior
        seconds = 0; // Reinicia o cronômetro
        updateTimerDisplay(); // Atualiza a exibição inicial
        timerInterval = setInterval(() => {
            seconds++; // Incrementa o cronômetro
            updateTimerDisplay(); // Atualiza a exibição
        }, 1000); // Atualiza a cada segundo
    }
    // Atualiza a exibição do cronômetro
    function updateTimerDisplay() {
        const minutes = Math.floor(seconds / 60); // Calcula os minutos
        const remainingSeconds = seconds % 60; // Calcula os segundos
        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; // Formata a exibição
    }
    // Configuração do modal
    function setupModal() {
        modalButton.addEventListener("click", () => modal.style.display = "none"); // Botão de fechar
        window.addEventListener("click", (event) => {
            if (event.target === modal) modal.style.display = "none"; // Fecha o modal ao clicar fora
        });
    }
    // Criação da grade
    function createGrid() {
        for (let i = 0; i < SIZE * SIZE; i++) {
            const cell = document.createElement("input"); // Cria um input
            cell.type = "text"; // Tipo texto
            cell.className = "cell"; // Classe de célula
            cell.maxLength = 1; // Máximo de 1 caractere
            cell.dataset.index = i; // Índice da celula
            cell.setAttribute("inputmode", "numeric"); // Modo numérico
            cell.setAttribute("pattern", "[1-9]*"); // Padrão de 1 a 9
            cell.addEventListener("input", validateCellInput); // Validação de entrada
            cell.addEventListener("click", highlightSameNumbers); // Destacar números iguais
            cell.addEventListener("focus", () => {
                if (!cell.disabled) {
                    cell.select();
                } else {
                    cell.blur(); // opcional: tira o foco das células desativadas
                }
            }); // Seleciona o input ao clicar
            cell.addEventListener("mousedown", (e) => {
                if (cell.disabled) {
                    e.preventDefault(); // Impede a seleção do conteúdo com o mouse
                }
            });
            cell.addEventListener("touchstart", (e) => {
                if (cell.disabled) {
                    e.preventDefault(); // Evita zoom/touch highlight em célula fixa
                }
            });
            cell.disabled = true; // Desativa inicialmente
            cells.push(cell); // Adiciona a celula ao array
            grid.appendChild(cell); // Adiciona a célula à grade
        }
    }
    // Função para ativar a célula
    function enableCells() {
        cells.forEach(cell => {
            if (!cell.classList.contains("pre-filled")) {
                cell.disabled = false;
            }
        });
    }
    // Validação de entrada da célula
    function validateCellInput(e) {
        const value = e.target.value; // Valor digitado
        if (value && !/^[1-9]$/.test(value)) {
            e.target.value = ""; // Limpa o valor inválido
        }
        else {
            checkIfPlayerCompletedBoard(); // <-- Checagem após digitação válida
        }
    }
    // Configuração do botão Novo Jogo
    function setupNewGameButton() {
        newGameButton.addEventListener("click", () => {
            newGameButton.disabled = true; // Desabilita o botão
            grid.classList.remove("grid-animation"); // Remove a animação
            animacaoAtiva = false; // Desativa animação
            showDifficultyModal(); // Mostra o modal de dificuldade
        });
    }
    // Configuração do botão de resolver
    function setupSolveButton() {
        solveButton.addEventListener("click", solveCurrentSudoku); // Botão de resolver
    }
    // Função para resetar o jogo
    function resetGame() {
        clearInterval(timerInterval); // Limpa o cronômetro
        clearAllCells(); // Limpa todas as Celtulas
        generateSudoku(); // Gera o jogo com a dificuldade atual
        playerCompleted = false; // Reseta o status de conclusão do jogador
    }
    // Lógica para resolver o Sudoku atual
    function solveCurrentSudoku() {
        if (!isCurrentBoardValid()) {
            showCustomAlert("Atenção", "O tabuleiro contém valores inválidos. Corrija antes de resolver.", "error"); // Alerta de erro quando clicar em resolver e o tabuleiro contém valores inválidos
            return;
        }
        const boardToSolve = getCurrentBoardState(); // Obtenha o tabuleiro atual
        playerCompleted = false; // O jogador não completou manualmente
        if (solveSudoku(boardToSolve)) {
            updateCellsFromBoard(boardToSolve); // Atualiza as células com a solução
            clearInterval(timerInterval); // Limpa o cronômetro
            const finalTime = document.getElementById('timer').textContent; // Obtenha o tempo final
            showCustomAlert("Jogo Resolvido", "O jogo foi resolvido pela máquina.", "info");
            solveButton.style.display = "none"; // Ocultar o botão de solução
            hintButton.style.display = "none"; // Ocultar o botão de dica
        } else {
            showCustomAlert("Poxa", "Tenta de novo aí", "error");
        }
    }
    // Geração de um novo Sudoku
    function generateSudoku() {
        currentBoard = createEmptyBoard(); // Cria um tabuleiro vazio
        solutionBoard = createEmptyBoard(); // Cria um tabuleiro vazio para a solução
        clearAllCells(); // Limpa todas as células
        fillBoard(currentBoard); // Preenche o tabuleiro
        solutionBoard = currentBoard.map(row => [...row]); // Cria uma cópia do tabuleiro atual
        removeNumbers(currentBoard, currentDifficulty); // Remove números
        fillCells(currentBoard); // Preenche as células
        solveButton.style.display = "inline-block"; // Mostra o botão de resolver
        hintButton.style.display = "inline-block"; // Mostra o botão de dica
        animacaoAtiva = false; // Desativa animação após gerar o novo jogo
    }
    // Funções auxiliares do Sudoku
    function createEmptyBoard() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); // Cria um tabuleiro vazio
    }
    // Função para preencher o tabuleiro
    function fillBoard(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    const numbers = shuffleArray([...Array(SIZE).keys()].map(n => n + 1)); // Números de 1 a 9
                    for (const num of numbers) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num; // Preenche a célula
                            if (fillBoard(board)) return true; // Recursão
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false; // Se não encontrar solução, retorna falso
                }
            }
        }
        return true; // Se o tabuleiro estiver completo, retorna verdadeiro
    }
    // Remover números para criar o tabuleiro jogável
    function removeNumbers(board, difficulty) {
        let cellsToRemove = difficulty.min + Math.floor(Math.random() * (difficulty.max - difficulty.min + 1)); // Número de Celtulas a serem removidas
        let attempts = 0; // Contador de tentativas
        // Remover células até atingir o número desejado
        while (cellsToRemove > 0 && attempts < MAX_ATTEMPTS) {
            const row = Math.floor(Math.random() * SIZE); // Linha aleatória
            const col = Math.floor(Math.random() * SIZE); // Coluna aleatória
            // Verifica se a célula não está vazia
            if (board[row][col] !== 0) {
                const temp = board[row][col]; // Armazena o valor temporariamente
                board[row][col] = 0; // Remove o número
                const boardCopy = board.map(row => [...row]); // Cria uma cópia do tabuleiro
                if (countSolutions(boardCopy) === 1) {
                    cellsToRemove--; // Decrementa o contador se a solução for única
                } else {
                    board[row][col] = temp; // Reverte se não for solução única
                }
                attempts++; // Incrementa o contador de tentativas
            }
        }
    }
    // Função para exibir o modal de dificuldade
    function handleDifficultySelection(event) {
        const difficulty = event.target.getAttribute('data-difficulty'); // Obtem a dificuldade do botão
        currentDifficulty = DIFFICULTY_LEVELS[difficulty]; // Define a dificuldade atual
        hideModal('difficultyModal'); // Fecha o modal
        resetGame(); // Reseta o jogo
        startTimer(); // Inicia o cronômetro
        enableCells(); // Habilita as células
        newGameButton.disabled = false; // Ativa o botão de novo jogo
    }
    // Função para mostrar modais com transição
    function showModal(modalId) {
        const modal = document.getElementById(modalId); // Obtem o modal
        modal.style.display = 'flex'; // Exibe o modal
        modal.classList.add('fade-in'); // Adiciona classe de animação
    }
    // Função para esconder modais com transição
    function hideModal(modalId) {
        const modal = document.getElementById(modalId); // Obtem o modal
        modal.classList.remove('fade-in'); // Remove classe de animação
        modal.classList.add('fade-out'); // Adiciona classe de animação
        // Espera o fim da animação antes de ocultar
        setTimeout(() => {
            modal.style.display = 'none'; // Esconde o modal
            modal.classList.remove('fade-out'); // Remove classe de animação
        }, 300); // tempo igual ao da animação CSS
    }
    // Função principal para exibir o modal de dificuldade
    function showDifficultyModal() {
        showModal('difficultyModal'); // Exibe o modal
        const buttons = document.querySelectorAll('.difficulty-btn'); // Obtem os botões
        buttons.forEach(button => {
            button.addEventListener('click', handleDifficultySelection, { once: true }); // Adiciona evento de clique
        });
    }
    // Contar soluções para verificar unicidade
    function countSolutions(board, count = 0) {
        if (count >= 2) return count; // Parar se já encontrou mais de uma solução
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= SIZE; num++) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num; // Preenche a celula
                            count = countSolutions(board, count); // Recursão
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return count; // Se nao encontrar solução, retorna
                }
            }
        }
        return count + 1; // Se encontrar solução, retorna
    }
    // Preencher células com valores do tabuleiro
    function fillCells(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const index = row * SIZE + col; // Índice da célula
                const cell = cells[index]; // Celula
                const value = board[row][col]; // Valor
                cell.value = value || ""; // Preenche a célula
                cell.classList.toggle("fixed", value !== 0); // Adiciona classe de fixo
                cell.disabled = value !== 0; // Desabilita a celula
                cell.classList.remove("hint"); // Resetar classe de dica
            }
        }
    }
    // Resolver Sudoku usando backtracking
    function solveSudoku(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= SIZE; num++) {
                        if (isValidPlacement(num, row, col, board)) {
                            board[row][col] = num; // Preenche a celula
                            if (solveSudoku(board)) return true; // Recursão
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false; // Se não encontrar solução, retorna falso
                }
            }
        }
        return true; // Se o tabuleiro estiver completo, retorna verdadeiro
    }
    // Verifica se o número pode ser colocado na célula
    function isValidPlacement(num, row, col, board) {
        // Verifica linha e coluna
        for (let i = 0; i < SIZE; i++) {
            if ((board[row][i] === num && i !== col) ||
                (board[i][col] === num && i !== row)) {
                return false; // Se encontrar um número igual, retorna falso
            }
        }
        // Verifica quadrante 3x3
        const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE; // Linha do quadrante
        const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE; // Coluna do quadrante
        // Verifica se o número ja existe no quadrante
        for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
            for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
                if (board[i][j] === num && i !== row && j !== col) {
                    return false; // Se encontrar um número igual, retorna falso
                }
            }
        }
        return true;
    }
    // Verifica se o tabuleiro atual é válido
    function isCurrentBoardValid() {
        const board = getCurrentBoardState(); // Obtem o estado atual do tabuleiro
        // Verifica se o tabuleiro atual é válido
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const num = board[row][col]; // Obtem o número
                if (num !== 0) {
                    board[row][col] = 0; // remove temporariamente o número
                    if (!isValidPlacement(num, row, col, board)) {
                        highlightInvalidCell(row, col); // destaca a celula
                        board[row][col] = num; // restaura o valor
                        return false; // Se não for válido, retorna falso
                    }
                    board[row][col] = num; // restaura o valor
                }
            }
        }
        return true;
    }
    //Destacar números iguais
    function highlightSameNumbers(e) {
        // Remove destaque anterior
        cells.forEach(c => {
            c.classList.remove("highlight", "selected", "highlight-fixed"); // Remove classes de destaque
            c.style.backgroundColor = ''; // Remove cor de fundo
            c.style.boxShadow = ''; // Remove sombra
        });
        // Verifica se a célula clicada é válida
        const clickedCell = e.target; // Celula clicada
        const clickedValue = clickedCell.value; // Valor da célula clicada
        // Verifica se a célula clicada é fixa
        if (!clickedValue) return;
        // Adiciona classe à célula clicada
        clickedCell.classList.add("selected");
        // Destaca todas as células com o mesmo valor
        cells.forEach(cell => {
            if (cell.value === clickedValue) {
                if (cell.classList.contains("fixed")) {
                    // Destaque diferente para números fixos (pré-preenchidos)
                    cell.classList.add("highlight-fixed"); // Adiciona classe de destaque
                    cell.style.backgroundColor = '#d8a4ff'; // Define cor de fundo
                    cell.style.boxShadow = '0 0 0 2px #8436c7'; // Define sombra
                } else {
                    // Destaque para números inseridos pelo jogador
                    cell.classList.add("highlight"); // Adiciona classe de destaque
                    cell.style.backgroundColor = '#d8a4ff'; // Define cor de fundo
                    cell.style.boxShadow = '0 0 0 2px  #8436c7'; // Define sombra
                }
            }
        });
    }
    // Destacar célula inválida
    function highlightInvalidCell(row, col) {
        const index = row * SIZE + col; // Índice da célula
        cells[index].classList.add("invalid"); // Adiciona classe de destaque
        setTimeout(() => cells[index].classList.remove("invalid"), 2000); // Remove destaque após 2 segundos
    }
    // Obter o estado atual do tabuleiro
    function getCurrentBoardState() {
        const board = createEmptyBoard(); // Cria um tabuleiro vazio
        for (let i = 0; i < cells.length; i++) {
            const value = parseInt(cells[i].value); // Valor da célula
            const row = Math.floor(i / SIZE); // Linha
            const col = i % SIZE; // Coluna
            board[row][col] = isNaN(value) ? 0 : value; // Define o valor da célula no tabuleiro
        }
        return board; // Retorna o tabuleiro
    }
    // Atualizar células a partir do tabuleiro
    function updateCellsFromBoard(board) {
        cells.forEach((cell, i) => {
            const row = Math.floor(i / SIZE); // Linha
            const col = i % SIZE; // Coluna
            if (!cell.classList.contains("fixed")) {
                cell.value = board[row][col]; // Define o valor da célula
            }
        });
    }
    // Limpar todas as células
    function clearAllCells() {
        cells.forEach(cell => {
            cell.value = ""; // Limpa o valor
            cell.classList.remove("fixed", "invalid"); // Remove classes de destaque
            cell.disabled = false; // Habilita a célula
        });
    }
    // Mostrar modal personalizado
    function showCustomAlert(title, message, type) {
        if (type === "success") {
            clearInterval(timerInterval); // Limpa o cronômetro
            if (playerCompleted) {
                message = `Parabéns! Você completou em ${document.getElementById('timer').textContent}!`; // Mensagem personalizada
                solveButton.style.display = "none"; // Ocultar o botão de solução
                hintButton.style.display = "none"; // Ocultar o botão de dica
            }
        }
        modalTitle.textContent = title; // Título do modal
        modalMessage.textContent = message; // Mensagem do modal
        const content = modal.querySelector(".modal-content"); // Conteúdo do modal
        content.style.background = type === "success"
            ? "linear-gradient(135deg,rgb(155, 55, 231) 0%,rgb(155, 55, 231) 100%)"
            : "linear-gradient(135deg, #ff5555 0%, #ff5555 100%)"; // Define cor de fundo
        modal.style.display = "block"; // Mostra o modal
    }
    // Embaralhar array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Índice aleatório
            [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
        }
        return array; // Retorna o array embaralhado
    }
    // Verifica se o jogador completou o tabuleiro
    function checkIfPlayerCompletedBoard() {
        const board = getCurrentBoardState(); // Obtem o estado atual do tabuleiro
        if (isBoardComplete(board) && isBoardCorrect(board)) {
            clearInterval(timerInterval); // Limpa o cronômetro
            const finalTime = document.getElementById('timer').textContent; // Tempo final
            showCustomAlert("Parabéns!", `Você completou o Sudoku corretamente em ${finalTime}!`, "success"); // Alerta de sucesso
            solveButton.style.display = "none"; // Ocultar o botão de solução
            hintButton.style.display = "none"; // Ocultar o botão de dica
            playerCompleted = true; // O jogador completou manualmente
        }
    }
    // Verifica se o tabuleiro está completo
    function isBoardComplete(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (board[row][col] === 0) return false; // Se encontrar uma célula vazia, retorna falso
            }
        }
        return true; // Se não encontrar células vazias, retorna verdadeiro
    }
    // Verifica se o tabuleiro está correto
    function isBoardCorrect(board) {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const value = board[row][col]; // Valor
                board[row][col] = 0; // Remove temporariamente o valor
                const isValid = isValidPlacement(value, row, col, board); // Verifica se o valor é valido
                board[row][col] = value; // Restaura o valor
                if (!isValid) return false; // Se não for válido, retorna falso
            }
        }
        return true; // Se o tabuleiro estiver correto, retorna verdadeiro
    }
    // Função de animação inicial das células
    function animarGridSudoku() {
        const cells = document.querySelectorAll('.cell'); // Seleciona todas as células
        // Defina primeiro a função interna
        function animarSequencia() {
            cells.forEach((cell, i) => {
                setTimeout(() => {
                    cell.classList.add('animated'); // Adiciona a classe de animação
                    setTimeout(() => cell.classList.remove('animated'), 1200); // Remove a classe de animação
                }, i * 15); // Efeito cascata
            });
        }
        // Executa uma vez
        animarSequencia();
        // Depois inicia o loop com intervalo
        loopAnimacao = setInterval(() => {
            if (animacaoAtiva) {
                animarSequencia(); // Chama a função de animação
            }
        }, 1500); // Tempo total da animação + atraso
    }
    // Evento para tocar áudio
    document.getElementById('play-button').addEventListener('click', function() {
        audioPlayer.play(); // Toca o áudio
    });
});
