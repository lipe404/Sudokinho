// js/sudokuEngine.js
import { SIZE, SUBGRID_SIZE, MAX_ATTEMPTS_GENERATION } from './config.js';
import { shuffleArray } from './utils.js';

export function isValidPlacement(num, row, col, board) {
    // Verifica linha e coluna
    for (let i = 0; i < SIZE; i++) {
        if ((board[row][i] === num && i !== col) || (board[i][col] === num && i !== row)) {
            return false;
        }
    }
    // Verifica quadrante 3x3
    const startRow = Math.floor(row / SUBGRID_SIZE) * SUBGRID_SIZE;
    const startCol = Math.floor(col / SUBGRID_SIZE) * SUBGRID_SIZE;
    for (let i = startRow; i < startRow + SUBGRID_SIZE; i++) {
        for (let j = startCol; j < startCol + SUBGRID_SIZE; j++) {
            if (board[i][j] === num && (i !== row || j !== col)) { // Correção: (i !== row || j !== col) para não checar a própria célula
                return false;
            }
        }
    }
    return true;
}

export function fillBoard(board) { // Gera um tabuleiro completo
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

export function countSolutions(board, count = 0) {
    if (count >= 2) return count;
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= SIZE; num++) {
                    if (isValidPlacement(num, row, col, board)) {
                        board[row][col] = num;
                        count = countSolutions(board, count);
                        if (count >= 2) return count; // Otimização: parar cedo
                        board[row][col] = 0; // Backtrack
                    }
                }
                return count;
            }
        }
    }
    return count + 1;
}

export function removeNumbers(board, difficultyConfig) {
    let cellsToRemove = difficultyConfig.cellsToRemoveMin + 
                        Math.floor(Math.random() * (difficultyConfig.cellsToRemoveMax - difficultyConfig.cellsToRemoveMin + 1));
    let attempts = 0;
    const boardCopy = board.map(row => [...row]); // Trabalhar em uma cópia para não modificar o original diretamente

    while (cellsToRemove > 0 && attempts < MAX_ATTEMPTS_GENERATION * 10) { // Aumentar tentativas se necessário
        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);

        if (boardCopy[row][col] !== 0) {
            const temp = boardCopy[row][col];
            boardCopy[row][col] = 0;
            
            const tempCheckBoard = boardCopy.map(r => [...r]); // Cópia para countSolutions
            if (countSolutions(tempCheckBoard) === 1) {
                cellsToRemove--;
            } else {
                boardCopy[row][col] = temp; // Reverte se não for solução única
            }
        }
        attempts++;
    }
    // Aplicar as remoções ao board original
    for(let r=0; r<SIZE; r++) {
        for(let c=0; c<SIZE; c++) {
            board[r][c] = boardCopy[r][c];
        }
    }
}

export function solveSudoku(board) { // Resolve um tabuleiro a partir de um estado
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

export function isBoardComplete(board) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) return false;
        }
    }
    return true;
}

export function isBoardCorrect(board) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] !== 0) {
                const value = board[row][col];
                board[row][col] = 0; // Temporariamente remove para verificar
                const isValid = isValidPlacement(value, row, col, board);
                board[row][col] = value; // Restaura
                if (!isValid) return false;
            }
        }
    }
    return true;
}