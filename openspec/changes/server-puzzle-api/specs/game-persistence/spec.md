## ADDED Requirements

### Requirement: Persist game results to SQLite
The server SHALL store completed game records with outcome, difficulty, score, and timestamp.

#### Scenario: Game saved after correct submission
- **WHEN** client submits a correct answer
- **THEN** server stores game record with: puzzleId, difficulty, score, timeSpent, dateCompleted, isCorrect=true

#### Scenario: Game saved after incorrect submission
- **WHEN** client submits an incorrect answer
- **THEN** server stores game record with: puzzleId, difficulty, score=0, timeSpent, dateCompleted, isCorrect=false

### Requirement: Retrieve game statistics
The server SHALL retrieve aggregate statistics from stored games.

#### Scenario: Get player statistics
- **WHEN** client requests GET /api/stats
- **THEN** server responds with { gamesPlayed, gamesWon, completionRate, averageScore, averageTime }

#### Scenario: Filter statistics by difficulty
- **WHEN** client requests GET /api/stats?difficulty=Hard
- **THEN** server returns statistics filtered to only Hard puzzles

### Requirement: Store game history
The server SHALL maintain a searchable history of all played games with full details.

#### Scenario: Store all game details
- **WHEN** a game is completed and submitted
- **THEN** server stores: { puzzleId, difficulty, playerBoard, finalScore, timeSpent, dateStarted, dateCompleted, invalidMoveCount, hintsUsed }

#### Scenario: Retrieve game history
- **WHEN** client requests game history
- **THEN** server can retrieve all past game records ordered by date

### Requirement: Database schema initialization
The server SHALL automatically initialize SQLite schema on startup if database does not exist.

#### Scenario: First run - schema created
- **WHEN** server starts and SQLite database is missing
- **THEN** server creates `games` table with columns: id (PRIMARY KEY), puzzleId, difficulty, playerBoard, finalScore, timeSpent, dateStarted, dateCompleted, invalidMoveCount, hintsUsed, sessionId

#### Scenario: Schema already exists
- **WHEN** server starts and tables already exist
- **THEN** server proceeds normally without errors

### Requirement: Session tracking without authentication
The server SHALL track game history per browser session using sessionId.

#### Scenario: Anonymous session tracking
- **WHEN** client submits a game without userId
- **THEN** server stores sessionId (generated on client and sent with each request) to group games
- **AND** client can retrieve stats for current sessionId via GET /api/stats

#### Scenario: Session persistence
- **WHEN** player refreshes page and returns
- **THEN** client retrieves sessionId from localStorage
- **AND** server recognizes the same session
