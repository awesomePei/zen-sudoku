
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type Board = (number | null)[][];

export const BLANK_BOARD: Board = Array(9).fill(null).map(() => Array(9).fill(null));

/**
 * Checks if placing 'num' at board[row][col] is valid.
 */
export function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x <= 8; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x <= 8; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 subgrid
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

/**
 * Solves the Sudoku board using backtracking.
 */
export function solveSudoku(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Generates a full valid Sudoku board.
 */
export function generateFullBoard(): Board {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
  
  // Fill diagonal 3x3 boxes first (they are independent)
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
  
  solveSudoku(board);
  return board;
}

function fillBox(board: Board, row: number, col: number) {
  let num;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isUnusedInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
}

function isUnusedInBox(board: Board, rowStart: number, colStart: number, num: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}

/**
 * Creates a puzzle by removing numbers from a full board.
 */
export function generatePuzzle(fullBoard: Board, difficulty: Difficulty): Board {
  const puzzle: Board = fullBoard.map(row => [...row]);
  let attempts = 0;
  
  const counts = {
    'Easy': 35,
    'Medium': 45,
    'Hard': 55,
    'Expert': 60
  };
  
  const toRemove = counts[difficulty];
  
  while (attempts < toRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      attempts++;
    }
  }
  
  return puzzle;
}

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

export function isBoardValid(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== null) {
        // Temporarily clear to check validity
        board[r][c] = null;
        if (!isValid(board, r, c, val)) {
          board[r][c] = val;
          return false;
        }
        board[r][c] = val;
      }
    }
  }
  return true;
}
