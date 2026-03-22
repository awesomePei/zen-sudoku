## 1. Server Infrastructure Setup

- [x] 1.1 Create `server/` directory structure with `index.ts`, `db.ts`, `puzzle-service.ts`
- [x] 1.2 Initialize Express app with JSON middleware and CORS configured
- [x] 1.3 Add npm scripts: `dev:server` (run server), `dev:full` (run both server and frontend concurrently)
- [x] 1.4 Create `.env` template with PORT, DB_PATH, and NODE_ENV variables
- [x] 1.5 Verify server starts on port 3001 and logs "Server running" message

## 2. Database Setup

- [x] 2.1 Create `server/db.ts` with SQLite initialization using better-sqlite3
- [x] 2.2 Create database schema: `games` table with columns: id, puzzleId, difficulty, playerBoard, finalScore, timeSpent, dateStarted, dateCompleted, invalidMoveCount, hintsUsed, sessionId, createdAt
- [x] 2.3 Create database schema: `puzzles` table with columns: id, difficulty, fullBoard, solution, createdAt
- [x] 2.4 Implement auto-schema initialization on server startup if tables missing
- [x] 2.5 Export query helper functions: `insertGame()`, `getStats()`, `getGameHistory()`

## 3. Puzzle Generation API

- [x] 3.1 Create `server/puzzle-service.ts` and migrate/port `generateFullBoard()` and `generatePuzzle()` functions from `src/utils/sudoku.ts`
- [x] 3.2 Port `isValid()`, `isBoardValid()` helper functions to puzzle-service
- [x] 3.3 Implement `GET /api/puzzle?difficulty=<Easy|Medium|Hard|Expert>` endpoint
- [x] 3.4 Response format: `{ puzzle: number[][], solution: number[][], puzzleId: string, difficulty: string }`
- [x] 3.5 Test puzzle generation endpoint with curl/Postman for each difficulty level

## 4. Move Validation API

- [x] 4.1 Implement `POST /api/validate` endpoint that accepts `{ row: number, col: number, num: number }`
- [x] 4.2 Validate request format (required fields, coordinate ranges [0-8], number range [1-9])
- [x] 4.3 Return `{ valid: boolean }` on success or HTTP 400 with error on invalid request
- [x] 4.4 Implement row, column, and 3x3 box conflict checking logic
- [x] 4.5 Add request timeout (100ms target response time measurement)
- [x] 4.6 Test validation endpoint with valid and invalid moves

## 5. Answer Submission API

- [x] 5.1 Implement `POST /api/submit` endpoint that accepts `{ puzzleId: string, finalBoard: number[][], timeSpent: number, sessionId: string }`
- [x] 5.2 Validate request format (required fields, 9x9 board dimensions, puzzleId exists in db)
- [x] 5.3 Retrieve stored solution from database using puzzleId
- [x] 5.4 Verify board is complete (no null cells) before scoring
- [x] 5.5 Implement score calculation: baseScore(difficulty) + timeBonus(timeSpent)
- [x] 5.6 Store game record in database with correct/incorrect result
- [x] 5.7 Verify clues are unchanged (anti-cheat check)
- [x] 5.8 Return `{ correct: boolean, score: number }` response
- [x] 5.9 Test submission with correct and incorrect boards

## 6. Statistics API

- [x] 6.1 Implement `GET /api/stats?sessionId=<id>` endpoint
- [x] 6.2 Query database for games matching sessionId
- [x] 6.3 Calculate: gamesPlayed, gamesWon, completionRate, averageScore, averageTime
- [x] 6.4 Group stats by difficulty level
- [x] 6.5 Return `{ gamesPlayed, gamesWon, completionRate, averageScore, byDifficulty: {...} }` format
- [x] 6.6 Test stats endpoint after submitting test games

## 7. Frontend Integration

- [ ] 7.1 Configure Vite proxy in `vite.config.ts` to forward `/api/*` to `http://localhost:3001` during dev
- [ ] 7.2 Add `sessionId` generation in [src/App.tsx](src/App.tsx) and store in localStorage (if not exists)
- [ ] 7.3 Replace `generatePuzzle()` call with `GET /api/puzzle` in game initialization
- [ ] 7.4 Replace local `isValid()` calls with `POST /api/validate` during gameplay
- [ ] 7.5 Replace board submission logic with `POST /api/submit` call
- [ ] 7.6 Add loading states for API calls (show spinner, disable inputs during request)
- [ ] 7.7 Add error handling: if API fails, show error message and retry option
- [ ] 7.8 Implement optimistic updates: assume valid move on client while API responds
- [ ] 7.9 Test frontend → server integration with all three API endpoints

## 8. Development Workflow

- [x] 8.1 Update `package.json` scripts: `dev` runs `dev:full` by default (or create separate `dev:full` command using `concurrently`)
- [x] 8.2 Install `concurrently` package if not present to run server and Vite together
- [ ] 8.3 Test running `npm run dev` starts both server and frontend
- [ ] 8.4 Verify API calls work through Vite proxy during dev
- [ ] 8.5 Test graceful shutdown behavior (Ctrl+C stops both processes cleanly)

## 9. Testing & Verification

- [ ] 9.1 Test puzzle generation: verify different difficulties have appropriate cell removal counts
- [ ] 9.2 Test validation: verify row, column, and 3x3 box conflicts are detected
- [ ] 9.3 Test submission: verify correct/incorrect answers score properly
- [ ] 9.4 Test database persistence: verify games are stored and retrievable after server restart
- [ ] 9.5 Test stats API: verify calculations are correct across multiple games
- [ ] 9.6 Test error handling: verify appropriate HTTP status codes for invalid requests
- [ ] 9.7 Test concurrent server and frontend dev environment
- [ ] 9.8 Play a full game end-to-end: generate puzzle → make moves → submit answer → verify score stored

