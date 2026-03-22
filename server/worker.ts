/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generatePuzzle, isValid as isValidMove, isBoardComplete } from './puzzle-service';

interface Env {
  GAMES: KVNamespace;
}

type Variables = Record<string, never>;

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Enable CORS
app.use('*', cors({
  origin: ['https://zen-sudoku.pages.dev', 'https://zen-sudoku-y91.pages.dev', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));

// Helper functions for KV storage
async function getPuzzleFromKV(env: Env, puzzleId: string) {
  const data = await env.GAMES.get(`puzzle:${puzzleId}`);
  return data ? JSON.parse(data) : null;
}

async function savePuzzleToKV(env: Env, puzzleId: string, puzzle: any) {
  await env.GAMES.put(`puzzle:${puzzleId}`, JSON.stringify(puzzle), { expirationTtl: 604800 }); // 7 days
}

async function saveGameToKV(env: Env, gameId: string, game: any) {
  await env.GAMES.put(`game:${gameId}`, JSON.stringify(game));
}

/**
 * GET /api/puzzle
 * Generate a new Sudoku puzzle
 */
app.get('/api/puzzle', async (c) => {
  try {
    const { difficulty = 'Easy' } = c.req.query();
    
    if (!['Easy', 'Medium', 'Hard', 'Expert'].includes(difficulty)) {
      return c.json({ error: 'Invalid difficulty' }, 400);
    }

    const puzzle = generatePuzzle(difficulty as 'Easy' | 'Medium' | 'Hard' | 'Expert');
    
    // Save puzzle for later validation
    await savePuzzleToKV(c.env, puzzle.puzzleId, puzzle);
    
    return c.json(puzzle);
  } catch (error) {
    console.error('Puzzle generation error:', error);
    return c.json({ error: 'Failed to generate puzzle' }, 500);
  }
});

/**
 * POST /api/validate
 * Validate a move
 */
app.post('/api/validate', async (c) => {
  try {
    const { row, col, num, board } = await c.req.json();

    // Validate request
    if (typeof row !== 'number' || typeof col !== 'number' || typeof num !== 'number') {
      return c.json({ error: 'Invalid request format' }, 400);
    }

    if (row < 0 || row > 8 || col < 0 || col > 8 || num < 1 || num > 9) {
      return c.json({ error: 'Invalid coordinates or number' }, 400);
    }

    // Validate move against board
    const tempBoard = board || Array(9).fill(null).map(() => Array(9).fill(null));
    const valid = isValidMove(tempBoard, row, col, num);

    return c.json({ valid });
  } catch (error) {
    console.error('Validation error:', error);
    return c.json({ error: 'Validation failed' }, 500);
  }
});

/**
 * POST /api/submit
 * Submit and score a completed puzzle
 */
app.post('/api/submit', async (c) => {
  try {
    const { puzzleId, finalBoard, timeSpent, sessionId, invalidMoveCount = 0, hintsUsed = 0 } = await c.req.json();

    // Validate request
    if (!puzzleId || !finalBoard || typeof timeSpent !== 'number' || !sessionId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate board
    if (!Array.isArray(finalBoard) || finalBoard.length !== 9) {
      return c.json({ error: 'Invalid board dimensions' }, 400);
    }

    // Get puzzle from KV
    const puzzleData = await getPuzzleFromKV(c.env, puzzleId);
    if (!puzzleData) {
      return c.json({ error: 'Puzzle not found' }, 400);
    }

    // Check if board is complete
    if (!isBoardComplete(finalBoard)) {
      return c.json({ error: 'Board is not complete' }, 400);
    }

    // Check correctness
    let correct = true;
    for (let r = 0; r < 9; r++) {
      for (let col = 0; col < 9; col++) {
        if (finalBoard[r][col] !== puzzleData.solution[r][col]) {
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
      const baseScore = baseScores[puzzleData.difficulty as keyof typeof baseScores] || 100;
      const timeBonus = Math.max(0, (600 - timeSpent) / 6);
      score = Math.round(baseScore + timeBonus);
    }

    // Store game record
    const gameId = `${sessionId}:${Date.now()}`;
    const gameRecord = {
      puzzleId,
      difficulty: puzzleData.difficulty,
      score,
      timeSpent,
      invalidMoveCount,
      hintsUsed,
      correct,
      completedAt: new Date().toISOString(),
    };

    await saveGameToKV(c.env, gameId, gameRecord);

    // Update session stats
    const statsKey = `stats:${sessionId}`;
    const existingStats = await c.env.GAMES.get(statsKey);
    const stats = existingStats ? JSON.parse(existingStats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      totalTime: 0,
      byDifficulty: {},
    };

    stats.gamesPlayed++;
    if (correct) stats.gamesWon++;
    stats.totalScore += score;
    stats.totalTime += timeSpent;

    if (!stats.byDifficulty[puzzleData.difficulty]) {
      stats.byDifficulty[puzzleData.difficulty] = { played: 0, won: 0, totalScore: 0 };
    }
    stats.byDifficulty[puzzleData.difficulty].played++;
    if (correct) stats.byDifficulty[puzzleData.difficulty].won++;
    stats.byDifficulty[puzzleData.difficulty].totalScore += score;

    await c.env.GAMES.put(statsKey, JSON.stringify(stats));

    return c.json({ correct, score });
  } catch (error) {
    console.error('Submit error:', error);
    return c.json({ error: 'Failed to submit game' }, 500);
  }
});

/**
 * GET /api/stats
 * Get game statistics for a session
 */
app.get('/api/stats', async (c) => {
  try {
    const sessionId = c.req.query('sessionId');

    if (!sessionId) {
      return c.json({ error: 'Missing sessionId' }, 400);
    }

    const statsKey = `stats:${sessionId}`;
    const statsData = await c.env.GAMES.get(statsKey);

    if (!statsData) {
      return c.json({
        gamesPlayed: 0,
        gamesWon: 0,
        completionRate: 0,
        averageScore: 0,
        averageTime: 0,
        byDifficulty: {},
      });
    }

    const stats = JSON.parse(statsData);
    const completionRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    const averageScore = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;
    const averageTime = stats.gamesPlayed > 0 ? Math.round(stats.totalTime / stats.gamesPlayed) : 0;

    return c.json({
      gamesPlayed: stats.gamesPlayed,
      gamesWon: stats.gamesWon,
      completionRate,
      averageScore,
      averageTime,
      byDifficulty: stats.byDifficulty,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

/**
 * GET /api/history
 * Get game history for a session
 */
app.get('/api/history', async (c) => {
  try {
    const sessionId = c.req.query('sessionId');
    const limit = parseInt(c.req.query('limit') || '20');

    if (!sessionId) {
      return c.json({ error: 'Missing sessionId' }, 400);
    }

    // Note: KV doesn't support range queries, so we'd need to store game IDs in a list
    // For now, return empty array. In production, use Durable Objects or D1
    return c.json({ games: [] });
  } catch (error) {
    console.error('History error:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

export default app;
