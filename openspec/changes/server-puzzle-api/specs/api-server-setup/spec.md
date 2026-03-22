## ADDED Requirements

### Requirement: Express server initialization
The server SHALL initialize an Express app with proper middleware configuration.

#### Scenario: Server starts on correct port
- **WHEN** npm script runs `tsx server/index.ts`
- **THEN** server starts on port 3001
- **AND** logs "Server running on http://localhost:3001"

#### Scenario: Middleware configured
- **WHEN** server starts
- **THEN** JSON parser middleware is enabled
- **AND** CORS middleware allows requests from http://localhost:5173 (Vite dev server)

### Requirement: API Base Routes
The server SHALL expose all API routes under /api prefix with proper HTTP methods.

#### Scenario: GET /api/puzzle
- **WHEN** client sends GET request to /api/puzzle?difficulty=Easy
- **THEN** server responds with HTTP 200 and valid puzzle response

#### Scenario: POST /api/validate
- **WHEN** client sends POST request to /api/validate with move data
- **THEN** server responds with HTTP 200 and validation result

#### Scenario: POST /api/submit
- **WHEN** client sends POST request to /api/submit with completed board
- **THEN** server responds with HTTP 200 and scoring result

#### Scenario: GET /api/stats
- **WHEN** client sends GET request to /api/stats with sessionId parameter
- **THEN** server responds with HTTP 200 and statistics object

### Requirement: Error handling and status codes
The server SHALL return appropriate HTTP status codes for all scenarios.

#### Scenario: Bad request handling
- **WHEN** client sends malformed request (missing required field)
- **THEN** server responds with HTTP 400 and { error: "description" }

#### Scenario: Server error handling
- **WHEN** server encounters unexpected error
- **THEN** server responds with HTTP 500 and { error: "Internal server error" }
- **AND** error is logged to console with details

### Requirement: Environment configuration
The server SHALL read configuration from environment variables.

#### Scenario: Port configuration
- **WHEN** server starts
- **THEN** port is configurable via NODE_PORT environment variable
- **AND** defaults to 3001 if not set

#### Scenario: Database path configuration
- **WHEN** server starts
- **THEN** SQLite database path is configurable via DB_PATH environment variable
- **AND** defaults to `./data/sudoku.db` if not set

### Requirement: Development server integration
The server SHALL be runnable alongside the Vite frontend in development.

#### Scenario: Concurrent dev servers
- **WHEN** `npm run dev` is executed
- **THEN** both Vite frontend (port 5173) and Express server (port 3001) start
- **AND** Vite proxy forwards /api requests to server
- **AND** single command controls both processes

#### Scenario: Graceful server shutdown
- **WHEN** user presses Ctrl+C
- **THEN** both server and frontend cleanly shut down
- **AND** no orphaned processes remain
