## ADDED Requirements

### Requirement: Validate and score final answers
The server SHALL validate the completed board against the solution and calculate the score.

#### Scenario: Correct completed board
- **WHEN** client sends POST /api/submit with a completed board that matches the solution
- **THEN** server responds with { correct: true, score: <points>, timeSpent: <seconds> }

#### Scenario: Incorrect completed board
- **WHEN** client sends POST /api/submit with a completed board that does not match the solution
- **THEN** server responds with { correct: false, score: 0 }

### Requirement: Calculate score based on difficulty and time
The server SHALL award more points for higher difficulty and faster solve times.

#### Scenario: Score calculation
- **WHEN** a puzzle is submitted correctly
- **THEN** score is calculated as: baseScore(difficulty) + timeBonus(timeSpent)
- **AND** base scores are: Easy=100, Medium=200, Hard=300, Expert=500
- **AND** time bonus is: max(0, 600 - timeSpent) / 6 for completions under 10 minutes

#### Scenario: Score on incomplete board
- **WHEN** client submits an incomplete board (has empty cells)
- **THEN** server responds with { correct: false, score: 0 }

### Requirement: Validate submission request format
The server SHALL reject malformed submission requests with appropriate error responses.

#### Scenario: Missing puzzle ID
- **WHEN** client sends POST /api/submit without puzzleId
- **THEN** server responds with HTTP 400 and { error: "Missing puzzleId" }

#### Scenario: Missing board data
- **WHEN** client sends POST /api/submit without finalBoard
- **THEN** server responds with HTTP 400 and { error: "Missing finalBoard" }

#### Scenario: Invalid board dimensions
- **WHEN** client sends POST /api/submit with a board that is not 9×9
- **THEN** server responds with HTTP 400 and { error: "Invalid board dimensions" }

### Requirement: Prevent answer tampering
The server SHALL verify that submitted board matches the puzzle structure (clues unchanged).

#### Scenario: Clues preserved in submission
- **WHEN** client submits a board
- **THEN** server verifies that all original clues from the puzzle are intact and unchanged
- **AND** responds with error if clues were modified

#### Scenario: Solution comparison
- **WHEN** a board is submitted for validation
- **THEN** server compares against the server-side stored solution (not client-provided)
