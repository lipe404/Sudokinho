// js/utils.js
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function createEmptyBoard(size) {
    return Array.from({ length: size }, () => Array(size).fill(0));
}