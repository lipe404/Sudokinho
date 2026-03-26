export function getBoardFromCells(cells, size) {
  const board = Array.from({ length: size }, () => Array(size).fill(0));
  for (let i = 0; i < cells.length; i++) {
    const value = parseInt(cells[i].value);
    const row = Math.floor(i / size);
    const col = i % size;
    board[row][col] = isNaN(value) ? 0 : value;
  }
  return board;
}
