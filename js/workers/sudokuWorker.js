import { isValidPlacement, findNextCell, countSolutions } from '../core/SudokuCore.js';

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
};

const fillBoard = (board, size, sub) => {
  const next = findNextCell(board, size, sub);
  if (!next) return true;
  const { r, c, candidates } = next;
  const nums = shuffle(candidates.slice());
  for (const num of nums) {
    board[r][c] = num;
    if (fillBoard(board, size, sub)) return true;
    board[r][c] = 0;
  }
  return false;
};

const removeNumbers = (board, solution, size, sub, difficulty, maxAttempts = 300) => {
  let cellsToRemove = difficulty.min + Math.floor(Math.random() * (difficulty.max - difficulty.min + 1));
  const positions = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) positions.push({ r, c });
  const order = shuffle(positions);
  let attempts = 0;
  for (let i = 0; i < order.length && cellsToRemove > 0 && attempts < maxAttempts; i++) {
    const { r, c } = order[i];
    if (board[r][c] === 0) continue;
    const temp = board[r][c];
    board[r][c] = 0;
    const copy = board.map(row => row.slice());
    if (countSolutions(copy, size, sub) === 1) {
      cellsToRemove--;
    } else {
      board[r][c] = temp;
    }
    attempts++;
  }
  return attempts;
};

onmessage = (e) => {
  const { action, size, subgrid, difficulty } = e.data || {};
  if (action === 'generate') {
    try {
      const board = Array.from({ length: size }, () => Array(size).fill(0));
      const t0 = performance.now();
      const ok = fillBoard(board, size, subgrid);
      const t1 = performance.now();
      if (!ok) {
        postMessage({ type: 'error' });
        return;
      }
      const solution = board.map(r => r.slice());
      const t2 = performance.now();
      const attempts = removeNumbers(board, solution, size, subgrid, difficulty);
      const t3 = performance.now();
      postMessage({
        type: 'generated',
        board,
        solution,
        genMs: Math.round(t1 - t0),
        removeMs: Math.round(t3 - t2),
        attempts
      });
    } catch (_) {
      postMessage({ type: 'error' });
    }
  }
};
