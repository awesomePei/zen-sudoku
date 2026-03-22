## Why

The current zen-sudoku implementation is entirely client-side, which creates CPU-intensive puzzle generation on player devices and makes it impossible to track game history or prevent cheating. A server API will offload computational work, enable persistent game statistics, and provide anti-cheat validation for submitted answers.

## What Changes

- Add a Node.js/Express server running alongside the React frontend
- Implement RESTful API endpoints for puzzle generation, move validation, and final answer submission
- Set up SQLite persistence to store game history and player statistics
- Update frontend to consume server API instead of client-side puzzle generation and validation
- Maintain seamless UX with optimistic updates and error recovery

## Capabilities

### New Capabilities
- `puzzle-generation`: Generate valid Sudoku puzzles on server by difficulty (Easy, Medium, Hard, Expert) with cached solutions
- `move-validation`: Validate individual moves in real-time as players enter numbers
- `answer-submission`: Validate completed board against solution and calculate score
- `game-persistence`: Store completed games with metadata (difficulty, score, time spent, completion status) in SQLite database
- `api-server-setup`: Configure Express server with middleware, CORS, and development proxy integration with Vite

### Modified Capabilities

- None

## Impact

- **Backend**: New `server/` directory with Express app, database layer, and Sudoku service business logic
- **Frontend**: [src/App.tsx](src/App.tsx) updated to call API endpoints instead of local `generatePuzzle()`, `isValid()`, and validation functions
- **Config**: Vite proxy configuration for `/api/*` routes during development; environment variables for API base URL
- **Dependencies**: Express and better-sqlite3 already installed; no new packages needed
- **Database**: Create SQLite schema for games and puzzles tables with schema migrations handled at startup
