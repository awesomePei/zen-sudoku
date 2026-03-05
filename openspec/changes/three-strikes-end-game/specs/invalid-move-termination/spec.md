## ADDED Requirements

### Requirement: Invalid Move Counter Initialization
The system SHALL initialize an invalid move counter to zero at the start of each new game.

#### Scenario: New game starts
- **WHEN** a player starts a new game
- **THEN** the invalid move counter is set to 0

#### Scenario: Game restart after loss
- **WHEN** a player restarts after losing to the three-strike limit
- **THEN** the invalid move counter is reset to 0

### Requirement: Invalid Move Detection and Tracking
The system SHALL increment the invalid move counter by one each time the player attempts to place an incorrect number on the board.

#### Scenario: Player makes an invalid move
- **WHEN** a player tries to place a number in a cell where that number violates Sudoku rules (duplicate in row/column/box or wrong value)
- **THEN** the invalid move is rejected, the counter increments by 1, and the player receives error feedback

#### Scenario: Player makes a valid move
- **WHEN** a player places a valid number in an empty cell
- **THEN** the invalid move counter does not change

#### Scenario: Multiple invalid moves in sequence
- **WHEN** a player makes 2 invalid moves in a row
- **THEN** the counter shows 2 and the player can continue playing

### Requirement: Invalid Move Counter Display
The system SHALL display the current invalid move count to the player in a visible location during gameplay, clearly showing how many strikes remain before game loss.

#### Scenario: Counter shown during game
- **WHEN** a player is actively playing
- **THEN** the invalid move counter is visible (e.g., "Invalid Moves: 1/3" or "Strikes: 1 of 3")

#### Scenario: Counter updates in real time
- **WHEN** a player makes an invalid move
- **THEN** the displayed counter updates immediately to reflect the new count

### Requirement: Game End on Third Invalid Move
The system SHALL automatically end the game and transition to a loss state when the player makes the third invalid move.

#### Scenario: Third invalid move triggers loss
- **WHEN** the invalid move counter reaches 3
- **THEN** the game immediately ends, further moves are blocked, and a loss screen appears

#### Scenario: Game state becomes "lost"
- **WHEN** the three-strike limit is reached
- **THEN** the game state transitions to "lost" and the board becomes read-only

#### Scenario: No moves allowed after loss
- **WHEN** a player attempts to place a number after the game is lost
- **THEN** the move is rejected and the system prevents further input

### Requirement: Loss Screen Display
The system SHALL display a clear loss screen when the player reaches the three-strike limit, informing them of the loss and providing options to restart or navigate away.

#### Scenario: Loss screen appears after third strike
- **WHEN** the invalid move counter reaches 3
- **THEN** a loss screen appears with the message "Game Over - You Lost" or similar

#### Scenario: Restart game option
- **WHEN** the player is on the loss screen
- **THEN** the player can click a "Restart" or "Play Again" button to begin a new game with the counter reset to 0

#### Scenario: Navigate away option
- **WHEN** the player is on the loss screen
- **THEN** the player can click a "Back to Home" or "Menu" button to return to the main screen

### Requirement: Invalid Move Feedback
The system SHALL provide clear, immediate feedback to the player when an invalid move is attempted, explaining why the move was rejected.

#### Scenario: Error message on invalid move
- **WHEN** a player attempts an invalid move
- **THEN** the system displays an error message (e.g., "This number is already in this row" or "Invalid move")

#### Scenario: Feedback persists until next action
- **WHEN** an error message is displayed
- **THEN** the message remains visible until the player makes another action or a timeout occurs

### Requirement: Strike Counter State Persistence During Game
The system SHALL maintain the invalid move counter throughout the current game session, even if the player switches focus away from the game.

#### Scenario: Counter preserved during game
- **WHEN** a player is in the middle of a game with 2 invalid moves recorded
- **THEN** switching focus and returning to the game shows the counter still at 2

#### Scenario: Counter resets only on new game
- **WHEN** a player completes a game (win or loss) and starts a new game
- **THEN** the counter resets to 0 for the new game only
