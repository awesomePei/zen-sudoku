## Context

The zen-sudoku project is a React/TypeScript frontend-only application with game logic running entirely in the browser. Puzzle generation is CPU-intensive (backtracking solver), and all validation happens client-side. Express and better-sqlite3 are already installed but unused. The project uses Vite for build/dev, Tailwind CSS for styling, and tsx for TypeScript execution.

Current architecture:
- **Frontend**: React 19 with TypeScript, Vite dev server on port 5173
- **Game Logic**: `src/utils/sudoku.ts` contains `generatePuzzle()`, `isValid()`, `isBoardValid()`
- **State**: Managed in [src/App.tsx](src/App.tsx) using React hooks
- **Dev Environment**: npm scripts, environment variables for Gemini API

## Goals / Non-Goals

**Goals:**
- Implement a Node.js/Express API server for puzzle generation and validation
- Move CPU-intensive computations (puzzle generation, backtracking) to server
- Persist game results (score, difficulty, time spent, completion status) to SQLite
- Validate player moves in real-time via API
- Validate final answer submissions against solutions (anti-cheat)
- Enable game statistics tracking without user authentication
- Maintain responsive frontend UX with optimistic updates during API calls
- Use existing dependencies (Express, better-sqlite3) without adding new packages
- Support development workflow: run both server and frontend concurrently

**Non-Goals:**
- User authentication or accounts (single-player, anonymous sessions)
- Multiplayer or real-time gameplay
- Advanced analytics or elaborate leaderboards
- GraphQL (RESTful is sufficient)
- WebSocket connections (stateless HTTP is suitable)
- Production deployment infrastructure (local development focus)
- Mobile app or alternative clients

## Decisions

### Decision 1: RESTful API over GraphQL or WebSocket
**Choice**: RESTful endpoints (GET /api/puzzle, POST /api/validate, POST /api/submit)

**Rationale**: 
- Simple, stateless operations match HTTP semantics perfectly
- Easier to test and debug vs GraphQL
- No need for persistent connections (WebSockets not required)
- Aligns with existing frontend patterns

**Alternatives Considered**:
- GraphQL: Overkill for this domain; adds complexity without benefit
- WebSocket: Unnecessary for turn-based puzzle game; adds connection overhead

### Decision 2: Sync to filesystem vs in-memory vs database
**Choice**: SQLite database (better-sqlite3 already installed)

**Rationale**:
- No external DB dependency required
- Supports structured queries for statistics
- Persists across server restarts
- No additional deployment complexity

**Alternatives Considered**:
- In-memory objects: Would lose data on restart; inadequate for history tracking
- Filesystem JSON: Prone to corruption; inefficient querying

### Decision 3: Server code organization
**Choice**: Create `server/` directory alongside `src/`, with clean separation: `server/index.ts` (Express app), `server/db.ts` (SQLite layer), `server/puzzle-service.ts` (business logic)

**Rationale**: 
- Clear code organization mirrors frontend structure
- Easy to change API routes or service logic independently
- Business logic (`puzzle-service.ts`) can be unit tested separately
- Database layer (`db.ts`) isolated from API logic

### Decision 4: Puzzle generation strategy
**Choice**: Generate puzzles on-demand per request; optionally cache full solutions in DB for validation

**Rationale**:
- No need for pre-generation; generateFullBoard + generatePuzzle is fast enough for HTTP response time
- Avoids cache invalidation complexity
- Still offloads CPU from browser to server

### Decision 5: Validation strategy
**Choice**: Real-time validation of each move via POST /api/validate; final submission validated against stored solution on POST /api/submit

**Rationale**:
- Real-time feedback provides better UX
- Final validation against server-side solution prevents client-side tampering
- Separates concerns: move-by-move feedback vs integrity check

### Decision 6: Session tracking without authentication
**Choice**: Use localStorage sessionId on client; server tracks game history anonymously by session ID

**Rationale**:
- No password/credential overhead
- Sufficient for stat persistence per browser
- Can expand to user accounts later without API changes

### Decision 7: Frontend API integration
**Choice**: Add Vite proxy in dev (http://localhost:3001/api → /api/); keep async/await calls in [App.tsx](src/App.tsx) with error handling

**Rationale**:
- Proxy simplifies dev workflow (no CORS during dev, single URL namespace)
- Optimistic updates keep UI responsive during API calls
- Error states fall back gracefully

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Network latency on validate calls** → Each move triggers HTTP round-trip, could feel slow on slow networks | Cache API responses locally; implement debouncing (50-100ms) for rapid keystrokes; prefetch next server-gen puzzle while playing |
| **Server down → frontend breaks** | Implement client-side fallback validation using existing sudoku.ts functions if API fails; show error message asking to retry |
| **Puzzle generation server-side is slower than client** | Offload solving to server asyncly; client can generate optimistic local puzzle while server returns real one. Trade: UI complexity for performance. |
| **Data loss if SQLite DB corrupted** | Keep server simple: auto-init schema on startup if missing. No complex migrations needed initially. |
| **Maintenance burden** → Two processes to manage during dev | Create npm script (`npm run dev:full`) that runs both server and Vite concurrently using `concurrently` package (already installed implicitly via tsx stack); single command spin-up. |

## Migration Plan

1. **Phase 1: Create server infrastructure** (minimal skeleton)
   - Create `server/` directory structure
   - Initialize Express app on port 3001 with CORS middleware
   - Create SQLite database with schema
   - Add npm scripts to run server

2. **Phase 2: Implement puzzle API endpoint**
   - Move `generateFullBoard()`, `generatePuzzle()` logic to `server/puzzle-service.ts`
   - Implement `GET /api/puzzle?difficulty=Easy` endpoint
   - Test with curl or Postman

3. **Phase 3: Implement validation endpoints**
   - Implement `POST /api/validate` (move-by-move)
   - Implement `POST /api/submit` (final answer + score calculation)

4. **Phase 4: Update frontend integration**
   - Hook [App.tsx](src/App.tsx) to call `GET /api/puzzle` on game start
   - Replace `isValid()` calls with `POST /api/validate`
   - Replace local board submission with `POST /api/submit`
   - Add loading states, error handling, optimistic updates

5. **Phase 5: Testing and refinement**
   - Test concurrent server + frontend dev environment
   - Test error scenarios (server down, network latency)
   - Verify SQLite persistence works across game sessions

## Open Questions

- Should we pre-generate a cache of puzzles by difficulty to speed up responses? (Deferred: implement on-demand first; optimize later if response time is noticeable)
- How many game attempts before we implement a more sophisticated analytics dashboard? (Deferred: basic counts sufficient for MVP)
- Do we need to expose additional endpoints like GET /api/stats for frontend leaderboard UI? (Scope for follow-up change; initial focus on core game loop)
