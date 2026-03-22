import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, insertGame, getStats, getGameHistory, getPuzzle } from './db';
import { generatePuzzle, isValid as isValidMove, isBoardComplete, isBoardValid } from './puzzle-service';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.NODE_PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 
    'http://localhost:5175',
    'http://localhost:3000'],
  credentials: true,
}));

// Initialize database on startup
try {
  initializeDatabase();
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// API Routes

/**
 * GET /api/puzzle
 * Generate a new Sudoku puzzle
 * Query params: difficulty (Easy|Medium|Hard|Expert)
 */
app.get('/api/puzzle', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { difficulty = 'Easy' } = req.query;
    
    // Validate difficulty
    if (!['Easy', 'Medium', 'Hard', 'Expert'].includes(difficulty as string)) {
      return res.status(400).json({ error: 'Invalid difficulty. Must be Easy, Medium, Hard, or Expert' });
    }

    const puzzle = generatePuzzle(difficulty as 'Easy' | 'Medium' | 'Hard' | 'Expert');
    res.json(puzzle);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/validate
 * Validate a move
 * Body: { row: number, col: number, num: number }
 */
app.post('/api/validate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { row, col, num } = req.body;

    // Validate request format
    if (typeof row !== 'number' || typeof col !== 'number' || typeof num !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid required fields: row, col, num' });
    }

    // Validate coordinates
    if (row < 0 || row > 8 || col < 0 || col > 8) {
      return res.status(400).json({ error: 'Invalid coordinates. Row and col must be between 0 and 8.' });
    }

    // Validate number
    if (num < 1 || num > 9) {
      return res.status(400).json({ error: 'Invalid number. Must be between 1 and 9.' });
    }

    // Create a temporary board for validation (using an empty board for validation check)
    // In a real scenario, you might want to check against the current game board
    // For now, we just verify the move is structurally valid
    const tempBoard = Array(9).fill(null).map(() => Array(9).fill(null));
    
    // The isValidMove function checks constraints, so we just need to verify
    // that the move doesn't violate sudoku rules in isolation
    const valid = isValidMove(tempBoard, row, col, num);

    res.json({ valid });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/submit
 * Submit and score a completed puzzle
 * Body: { puzzleId: string, finalBoard: number[][], timeSpent: number, sessionId: string, invalidMoveCount?: number, hintsUsed?: number }
 */
app.post('/api/submit', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { puzzleId, finalBoard, timeSpent, sessionId, invalidMoveCount = 0, hintsUsed = 0 } = req.body;

    // Validate request format
    if (!puzzleId || !finalBoard || typeof timeSpent !== 'number' || !sessionId) {
      return res.status(400).json({ 
        error: 'Missing required fields: puzzleId, finalBoard, timeSpent, sessionId' 
      });
    }

    // Validate board dimensions
    if (!Array.isArray(finalBoard) || finalBoard.length !== 9 || !finalBoard.every(row => Array.isArray(row) && row.length === 9)) {
      return res.status(400).json({ error: 'Invalid board dimensions. Must be 9x9.' });
    }

    // Retrieve puzzle and solution from database
    const puzzleData = getPuzzle(puzzleId);
    if (!puzzleData) {
      return res.status(400).json({ error: 'Puzzle not found. Invalid puzzleId.' });
    }

    // Check if board is complete
    if (!isBoardComplete(finalBoard)) {
      return res.status(400).json({ error: 'Board is not complete. Cannot submit incomplete board.' });
    }

    // Compare board with solution
    let correct = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (finalBoard[r][c] !== puzzleData.solution[r][c]) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }

    // Calculate score
    let score = 0;
    if (correct) {
      const baseScores = {
        'Easy': 100,
        'Medium': 200,
        'Hard': 300,
        'Expert': 500,
      };
      const baseScore = baseScores[puzzleData.difficulty];
      
      // Time bonus: max(0, 600 - timeSpent) / 6 for completions under 10 minutes
      const timeBonus = Math.max(0, (600 - timeSpent) / 6);
      score = Math.round(baseScore + timeBonus);
    }

    // Store game record
    const now = new Date().toISOString();
    insertGame({
      puzzleId,
      difficulty: puzzleData.difficulty,
      playerBoard: finalBoard,
      finalScore: score,
      timeSpent,
      dateStarted: new Date(new Date(now).getTime() - timeSpent * 1000).toISOString(),
      dateCompleted: now,
      invalidMoveCount,
      hintsUsed,
      sessionId,
      isCorrect: correct,
    });

    res.json({ correct, score });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats
 * Get game statistics for a session
 * Query params: sessionId, difficulty (optional)
 */
app.get('/api/stats', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, difficulty } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing required query param: sessionId' });
    }

    const stats = getStats(sessionId as string, difficulty as string | undefined);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/history
 * Get game history for a session
 * Query params: sessionId, limit (optional, default 20)
 */
app.get('/api/history', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, limit = '20' } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing required query param: sessionId' });
    }

    const history = getGameHistory(sessionId as string, parseInt(limit as string) || 20);
    res.json({ games: history });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
