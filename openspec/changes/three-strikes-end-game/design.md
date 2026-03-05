## Context

The Zen Sudoku game currently validates moves and shows errors, but has no consequence for invalid moves. Players can make unlimited incorrect attempts without penalty. This design adds a three-move-limit system to create stakes and strategic thinking requirements. The current game state is held in React components, and the board logic is in the sudoku utility module.

## Goals / Non-Goals

**Goals:**
- Track the number of invalid moves (incorrect number placements) during a game
- Automatically end the game and show a loss state when the player makes 3 invalid moves
- Display a visual counter showing current invalid moves (e.g., "3/3" or "Invalid moves: 1 of 3")
- Provide clear feedback when a move is invalid and update the counter immediately
- Allow players to restart a lost game

**Non-Goals:**
- Modify the win condition or detection logic
- Add difficulty levels with different strike counts
- Create leaderboards or scoring based on moves remaining
- Persist game state across sessions
- Add undo or move history features

## Decisions

1. **Invalid Move Tracking Location: Game State**
   - Rationale: The `invalidMoveCount` should live in the main game state (App.tsx or custom hook) alongside the current board state, so any validation can immediately trigger a state update.
   - Alternative considered: Keep it in the sudoku utility - rejected because the utility is stateless and the UI needs reactive updates.

2. **Validation Integration: Existing Move Validation**
   - Rationale: Integrate strike counting into the existing move validation logic. When the board validation detects an invalid move, increment the counter in the component state rather than the utility.
   - Alternative considered: Create a separate validation layer - rejected as unnecessary duplication since the existing validation is already accurate.

3. **Game End Condition Check**
   - Rationale: Check `invalidMoveCount === 3` after each move update. If true, transition game state to "lost" and disable further input.
   - Alternative considered: Implement in utility - rejected because game state decisions belong in the React layer.

4. **UI Feedback: Strike Counter Display**
   - Rationale: Display a simple counter (e.g., "Invalid Moves: 1/3") in a prominent but non-intrusive location (top of game board or status bar).
   - Alternative considered: Use visual metaphors like hearts or X marks - simpler numeric display chosen for clarity and consistency.

5. **End State Behavior**
   - Rationale: When 3 strikes reached, show a "Game Over - You Lost" screen that blocks further moves and offers "Restart" and "Home" buttons.
   - Alternative considered: Immediate restart - rejected because player needs to see the result of their final move.

## Risks / Trade-offs

- **Risk**: Players frustrated by the 3-strike limit in initial playtests
  - Mitigation: Limit is discoverable before play starts; can adjust if needed. Consider if easier puzzles should be recommended.

- **Risk**: Invalid move detection relies on existing validation logic
  - Mitigation: No change to validation itself - only counting. If validation has false positives/negatives, they'll affect strikes. This is not a new risk.

- **Risk**: No indication until 3rd strike that the game can end this way
  - Mitigation: Add a brief instructions or hint at game start explaining the three-strikes rule.

## Migration Plan

1. Update game state structure to include `invalidMoveCount` (initialized to 0)
2. Modify move validation to increment the counter on invalid attempt
3. Add check after each move for `invalidMoveCount === 3` (end game, set state to "lost")
4. Update UI to display the counter and show game-over screen
5. Test with existing puzzles to ensure strikes are correctly triggered
