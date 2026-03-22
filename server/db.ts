import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || './data/sudoku.db';

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDatabase();

  // Create games table
  database.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      puzzleId TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
      playerBoard TEXT NOT NULL,
      finalScore INTEGER NOT NULL DEFAULT 0,
      timeSpent INTEGER NOT NULL,
      dateStarted TEXT NOT NULL,
      dateCompleted TEXT NOT NULL,
      invalidMoveCount INTEGER NOT NULL DEFAULT 0,
      hintsUsed INTEGER NOT NULL DEFAULT 0,
      sessionId TEXT NOT NULL,
      isCorrect BOOLEAN NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create puzzles table for caching solutions
  database.exec(`
    CREATE TABLE IF NOT EXISTS puzzles (
      id TEXT PRIMARY KEY,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
      fullBoard TEXT NOT NULL,
      solution TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for efficient queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_games_sessionId ON games(sessionId);
    CREATE INDEX IF NOT EXISTS idx_games_difficulty ON games(difficulty);
    CREATE INDEX IF NOT EXISTS idx_games_createdAt ON games(createdAt);
  `);
}

export function insertGame(gameData: {
  puzzleId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  playerBoard: number[][];
  finalScore: number;
  timeSpent: number;
  dateStarted: string;
  dateCompleted: string;
  invalidMoveCount: number;
  hintsUsed: number;
  sessionId: string;
  isCorrect: boolean;
}): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO games (puzzleId, difficulty, playerBoard, finalScore, timeSpent, dateStarted, dateCompleted, invalidMoveCount, hintsUsed, sessionId, isCorrect)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    gameData.puzzleId,
    gameData.difficulty,
    JSON.stringify(gameData.playerBoard),
    gameData.finalScore,
    gameData.timeSpent,
    gameData.dateStarted,
    gameData.dateCompleted,
    gameData.invalidMoveCount,
    gameData.hintsUsed,
    gameData.sessionId,
    gameData.isCorrect ? 1 : 0
  );

  return result.lastInsertRowid as number;
}

export function getStats(sessionId: string, difficulty?: string): any {
  const db = getDatabase();
  
  let query = 'SELECT * FROM games WHERE sessionId = ?';
  const params: any[] = [sessionId];

  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  const games = db.prepare(query).all(...params) as any[];

  const gamesPlayed = games.length;
  const gamesWon = games.filter(g => g.isCorrect).length;
  const completionRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;
  const averageScore = gamesPlayed > 0 ? Math.round(games.reduce((sum, g) => sum + g.finalScore, 0) / gamesPlayed) : 0;
  const averageTime = gamesPlayed > 0 ? Math.round(games.reduce((sum, g) => sum + g.timeSpent, 0) / gamesPlayed) : 0;

  // Group by difficulty
  const byDifficulty: Record<string, any> = {};
  ['Easy', 'Medium', 'Hard', 'Expert'].forEach(diff => {
    const diffGames = games.filter(g => g.difficulty === diff);
    if (diffGames.length > 0) {
      byDifficulty[diff] = {
        played: diffGames.length,
        won: diffGames.filter(g => g.isCorrect).length,
        averageScore: Math.round(diffGames.reduce((sum, g) => sum + g.finalScore, 0) / diffGames.length),
        averageTime: Math.round(diffGames.reduce((sum, g) => sum + g.timeSpent, 0) / diffGames.length),
      };
    }
  });

  return {
    gamesPlayed,
    gamesWon,
    completionRate: Math.round(completionRate),
    averageScore,
    averageTime,
    byDifficulty,
  };
}

export function getGameHistory(sessionId: string, limit: number = 20): any[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM games 
    WHERE sessionId = ?
    ORDER BY createdAt DESC
    LIMIT ?
  `);
  
  return stmt.all(sessionId, limit) as any[];
}

export function savePuzzle(puzzleId: string, difficulty: string, fullBoard: number[][], solution: number[][]): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO puzzles (id, difficulty, fullBoard, solution)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(puzzleId, difficulty, JSON.stringify(fullBoard), JSON.stringify(solution));
}

export function getPuzzle(puzzleId: string): any {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM puzzles WHERE id = ?');
  const puzzle = stmt.get(puzzleId) as any;

  if (puzzle) {
    return {
      ...puzzle,
      fullBoard: JSON.parse(puzzle.fullBoard),
      solution: JSON.parse(puzzle.solution),
    };
  }

  return null;
}
