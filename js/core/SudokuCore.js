export function isValidPlacement(num, row, col, board, size = 9, sub = 3) {
  for (let i = 0; i < size; i++) {
    if ((board[row][i] === num && i !== col) || (board[i][col] === num && i !== row)) {
      return false;
    }
  }
  const startRow = Math.floor(row / sub) * sub;
  const startCol = Math.floor(col / sub) * sub;
  for (let i = startRow; i < startRow + sub; i++) {
    for (let j = startCol; j < startCol + sub; j++) {
      if (board[i][j] === num && (i !== row || j !== col)) {
        return false;
      }
    }
  }
  return true;
}

export function findNextCell(board, size = 9, sub = 3) {
  let best = null;
  let bestCount = 10;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== 0) continue;
      const candidates = [];
      for (let num = 1; num <= size; num++) {
        if (isValidPlacement(num, row, col, board, size, sub)) {
          candidates.push(num);
        }
      }
      if (candidates.length < bestCount) {
        best = { row, col, candidates };
        bestCount = candidates.length;
        if (bestCount === 1) return best;
      }
    }
  }
  return best;
}

export function countSolutions(board, size = 9, sub = 3, count = 0) {
  if (count >= 2) return count;
  let target = null;
  let bestCount = 10;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 0) {
        const candidates = [];
        for (let n = 1; n <= size; n++) {
          if (isValidPlacement(n, row, col, board, size, sub)) candidates.push(n);
        }
        if (candidates.length < bestCount) {
          target = { row, col, candidates };
          bestCount = candidates.length;
          if (bestCount === 1) break;
        }
      }
    }
    if (bestCount === 1) break;
  }
  if (!target) return count + 1;
  for (const n of target.candidates) {
    board[target.row][target.col] = n;
    count = countSolutions(board, size, sub, count);
    board[target.row][target.col] = 0;
    if (count >= 2) return count;
  }
  return count;
}
