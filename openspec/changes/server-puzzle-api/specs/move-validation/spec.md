## ADDED Requirements

### Requirement: Validate moves in real-time
The server SHALL validate whether a number placed at a given position is valid according to Sudoku rules.

#### Scenario: Valid move
- **WHEN** client sends POST /api/validate with { row: 0, col: 0, num: 5 } for an empty cell with no conflicts
- **THEN** server responds with { valid: true }

#### Scenario: Invalid move - row conflict
- **WHEN** client sends POST /api/validate with a number already present in the same row
- **THEN** server responds with { valid: false }

#### Scenario: Invalid move - column conflict
- **WHEN** client sends POST /api/validate with a number already present in the same column
- **THEN** server responds with { valid: false }

#### Scenario: Invalid move - 3x3 box conflict
- **WHEN** client sends POST /api/validate with a number already present in the same 3×3 subgrid
- **THEN** server responds with { valid: false }

### Requirement: Validate move request format
The server SHALL reject malformed move validation requests with appropriate error responses.

#### Scenario: Missing required fields
- **WHEN** client sends POST /api/validate without row, col, or num fields
- **THEN** server responds with HTTP 400 and { error: "Missing required fields" }

#### Scenario: Invalid coordinates
- **WHEN** client sends POST /api/validate with row or col outside range [0-8]
- **THEN** server responds with HTTP 400 and { error: "Invalid coordinates" }

#### Scenario: Invalid number
- **WHEN** client sends POST /api/validate with num outside range [1-9]
- **THEN** server responds with HTTP 400 and { error: "Invalid number" }

### Requirement: Real-time validation response time
The server SHALL respond to move validation requests within 100ms.

#### Scenario: Fast validation response
- **WHEN** client sends POST /api/validate
- **THEN** server responds within 100ms
