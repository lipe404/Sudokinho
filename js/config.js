// js/config.js
export const SIZE = 9;
export const SUBGRID_SIZE = 3;
export const MAX_ATTEMPTS_GENERATION = 300; // Renomeado para clareza
export const HINT_COOL_DOWN_MS = 60000;

export const DIFFICULTY_LEVELS = {
    easy: { cellsToRemoveMin: 30, cellsToRemoveMax: 40, name: "Fácil" }, // Renomeado para clareza
    medium: { cellsToRemoveMin: 40, cellsToRemoveMax: 50, name: "Médio" },
    hard: { cellsToRemoveMin: 50, cellsToRemoveMax: 60, name: "Difícil" }
};