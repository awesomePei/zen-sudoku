## Why

Sudoku games benefit from clear failure conditions that encourage careful play without frustrating users. Adding a three-invalid-move limit creates a natural game-over state that increases challenge and creates a sense of consequence, improving engagement while keeping the game accessible.

## What Changes

- The game now tracks invalid moves (attempts to place an incorrect number in a cell)
- After the player makes 3 invalid moves, the game automatically ends with a loss state
- A visual indicator displays the current invalid move count (e.g., "Invalid moves: 1/3")
- Players receive clear feedback when they lose, with options to restart or return to the home screen

## Capabilities

### New Capabilities
- `invalid-move-termination`: Track invalid moves and end the game when the player exceeds the three-move limit

### Modified Capabilities
- `game-board-validation`: The existing move validation will now trigger an "invalid move" counter instead of only showing an error message

## Impact

**Code changes:**
- Game state management will track current invalid move count
- Board validation logic will integrate with the invalid move counter
- Game end conditions will be expanded to include the three-strikes loss state
- UI will display invalid move counter and handle game-over state

**User-facing:**
- New game-over screen when three invalid moves are reached
- Visual feedback on invalid move count during gameplay
- Changed game dynamics with added challenge
