const isValidPlacement = (num, row, col, board, size, sub) => {
  for (let i = 0; i < size; i++) {
    if ((board[row][i] === num && i !== col) || (board[i][col] === num && i !== row)) return false;
  }
  const startRow = Math.floor(row / sub) * sub;
  const startCol = Math.floor(col / sub) * sub;
  for (let i = startRow; i < startRow + sub; i++) {
    for (let j = startCol; j < startCol + sub; j++) {
      if (board[i][j] === num && (i !== row || j !== col)) return false;
    }
  }
  return true;
};

const findNextCell = (board, size, sub) => {
  let best = null;
  let bestCount = 10;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== 0) continue;
      const candidates = [];
      for (let n = 1; n <= size; n++) {
        if (isValidPlacement(n, r, c, board, size, sub)) candidates.push(n);
      }
      if (candidates.length < bestCount) {
        best = { r, c, candidates };
        bestCount = candidates.length;
        if (bestCount === 1) return best;
      }
    }
  }
  return best;
};

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

const countSolutions = (board, size, sub, count = 0) => {
  if (count >= 2) return count;
  let r = -1, c = -1;
  let bestCount = 10, bestCandidates = null;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] === 0) {
        const candidates = [];
        for (let n = 1; n <= size; n++) if (isValidPlacement(n, i, j, board, size, sub)) candidates.push(n);
        if (candidates.length < bestCount) {
          bestCount = candidates.length;
          bestCandidates = candidates;
          r = i; c = j;
          if (bestCount === 1) break;
        }
      }
    }
    if (bestCount === 1) break;
  }
  if (r === -1) return count + 1;
  for (const n of bestCandidates) {
    board[r][c] = n;
    count = countSolutions(board, size, sub, count);
    board[r][c] = 0;
    if (count >= 2) return count;
  }
  return count;
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
