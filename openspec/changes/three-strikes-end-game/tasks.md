## 1. State Management Setup

- [x] 1.1 Add `invalidMoveCount` property to the game state (initialize to 0)
- [x] 1.2 Add `gameStatus` property to game state to track "active", "won", and "lost" states
- [x] 1.3 Create a custom hook or utility function to manage game state updates

## 2. Move Validation and Tracking

- [x] 2.1 Identify where move validation occurs in the board logic (`sudoku.ts` utility)
- [x] 2.2 Update the move validation to return whether the move was valid or invalid
- [x] 2.3 Create a handler in App.tsx that calls validation and increments `invalidMoveCount` on invalid moves
- [x] 2.4 Add logic to check if `invalidMoveCount === 3` after each move and set `gameStatus` to "lost"

## 3. Invalid Move Counter Display

- [x] 3.1 Create a new UI component for the invalid move counter (e.g., `InvalidMoveCounter.tsx`)
- [x] 3.2 Display the counter in the format "Invalid Moves: X/3" or similar
- [x] 3.3 Place the counter in a visible location (above or below the game board)
- [x] 3.4 Update the counter in real-time when moves are made

## 4. Loss Screen UI

- [x] 4.1 Create a new component for the loss screen (e.g., `LossScreen.tsx`)
- [x] 4.2 Display "Game Over - You Lost" message on the loss screen
- [x] 4.3 Add a "Restart Game" button that resets the game and counter
- [x] 4.4 Add a "Back to Home" button that returns to the main menu/home
- [x] 4.5 Show the loss screen only when `gameStatus` is "lost"

## 5. Game Logic Integration

- [x] 5.1 Disable board interaction when `gameStatus` is "lost"
- [x] 5.2 Ensure board is read-only after loss (prevent further moves)
- [x] 5.3 Add game status initialization when a new game starts
- [x] 5.4 Handle game restart by resetting both the board state and `invalidMoveCount`

## 6. Invalid Move Feedback

- [x] 6.1 Enhance error feedback message to indicate strike count (e.g., "Invalid move (1/3 strikes used)")
- [x] 6.2 Display error message when invalid move is detected
- [x] 6.3 Clear error message on next user action or after timeout

## 7. Conditional Rendering and Navigation

- [x] 7.1 Update App.tsx to render the appropriate screen based on `gameStatus` (game board or loss screen)
- [x] 7.2 Ensure navigation flow: Game → Loss Screen → Restart Game or Home
- [x] 7.3 Test that win condition still works independently of the three-strike system

## 8. Testing and Polish

- [x] 8.1 Test that invalid moves correctly increment the counter
- [x] 8.2 Test that the third invalid move triggers game loss
- [x] 8.3 Test that the counter resets on game restart
- [x] 8.4 Test that valid moves do not increment the counter
- [x] 8.5 Test that the board is unresponsive after loss
- [x] 8.6 Verify error messages are clear and helpful
- [x] 8.7 Manual playtesting: complete a game without losses
- [x] 8.8 Manual playtesting: trigger the three-strike loss condition
