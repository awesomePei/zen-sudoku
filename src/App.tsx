/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Trophy, 
  Settings2, 
  Eraser, 
  Lightbulb, 
  ChevronLeft,
  Play,
  Pause,
  Timer as TimerIcon
} from 'lucide-react';
import { 
  generateFullBoard, 
  generatePuzzle, 
  Difficulty, 
  Board, 
  isValid,
  isBoardComplete,
  isBoardValid
} from './utils/sudoku';
import InvalidMoveCounter from './components/InvalidMoveCounter';
import LossScreen from './components/LossScreen';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert'];

export default function App() {
  const [fullBoard, setFullBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [currentBoard, setCurrentBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu');
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);
  const [invalidMoveCount, setInvalidMoveCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize game
  const startNewGame = useCallback((diff: Difficulty) => {
    const full = generateFullBoard();
    const puzzle = generatePuzzle(full, diff);
    setFullBoard(full);
    setInitialBoard(puzzle);
    setCurrentBoard(puzzle.map(row => [...row]));
    setDifficulty(diff);
    setGameState('playing');
    setTimer(0);
    setMistakes(0);
    setHints(3);
    setInvalidMoveCount(0);
    setErrorMessage(null);
    setSelectedCell(null);
    setIsPaused(false);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && !isPaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || isPaused) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameState !== 'playing' || isPaused) return;
    const [row, col] = selectedCell;

    // Don't allow changing initial numbers
    if (initialBoard[row][col] !== null) return;

    const newBoard = currentBoard.map(r => [...r]);
    
    // Check if the move is valid using Sudoku rules
    const isValidMove = isValid(currentBoard, row, col, num);
    
    // If the move violates Sudoku rules, it's an invalid move
    if (!isValidMove) {
      // Invalid move - increment counter and provide feedback
      const newInvalidCount = invalidMoveCount + 1;
      setInvalidMoveCount(newInvalidCount);
      setErrorMessage(`Invalid move! Number already exists in this row, column, or box. (${newInvalidCount}/3 strikes)`);
      
      // Clear error message after 3 seconds
      setTimeout(() => setErrorMessage(null), 3000);
      
      // Check if this is the third invalid move
      if (newInvalidCount >= 3) {
        setGameState('lost');
      }
      return;
    }
    
    // Valid placement - check if it's the correct answer
    if (fullBoard[row][col] === num) {
      newBoard[row][col] = num;
      setCurrentBoard(newBoard);
      setErrorMessage(null);
      
      if (isBoardComplete(newBoard)) {
        setGameState('won');
      }
    } else {
      // Valid move structure but wrong number - still invalid attempt
      const newInvalidCount = invalidMoveCount + 1;
      setInvalidMoveCount(newInvalidCount);
      setErrorMessage(`Incorrect number! Try again. (${newInvalidCount}/3 strikes)`);
      
      // Clear error message after 3 seconds
      setTimeout(() => setErrorMessage(null), 3000);
      
      // Check if this is the third invalid move
      if (newInvalidCount >= 3) {
        setGameState('lost');
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell || gameState !== 'playing' || isPaused) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = null;
    setCurrentBoard(newBoard);
  };

  const handleHint = () => {
    if (!selectedCell || hints <= 0 || gameState !== 'playing' || isPaused) return;
    const [row, col] = selectedCell;
    if (currentBoard[row][col] !== null) return;

    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = fullBoard[row][col];
    setCurrentBoard(newBoard);
    setHints(prev => prev - 1);

    if (isBoardComplete(newBoard)) {
      setGameState('won');
    }
  };

  const isRelated = (r: number, c: number) => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    if (r === sr && c === sc) return false; // Self is handled separately
    
    // Same row, column, or 3x3 box
    const sameBox = Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3);
    return r === sr || c === sc || sameBox;
  };

  const isSameValue = (r: number, c: number) => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    const val = currentBoard[sr][sc];
    return val !== null && currentBoard[r][c] === val && (r !== sr || c !== sc);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-600">Zen Sudoku</h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-widest mt-1">
              {gameState === 'playing' ? difficulty : 'Choose Challenge'}
            </p>
          </div>
          {gameState === 'playing' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                <TimerIcon size={16} className="text-gray-400" />
                <span className="font-mono font-medium text-lg">{formatTime(timer)}</span>
              </div>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-gray-100"
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {gameState === 'menu' ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => startNewGame(diff)}
                    className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
                  >
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-gray-800">{diff}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {diff === 'Easy' && 'Perfect for a quick mental warm-up.'}
                        {diff === 'Medium' && 'A balanced challenge for regular players.'}
                        {diff === 'Hard' && 'Requires advanced techniques and focus.'}
                        {diff === 'Expert' && 'Only for the true Sudoku masters.'}
                      </p>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={24} className="text-indigo-500" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : gameState === 'lost' ? (
            <LossScreen 
              difficulty={difficulty}
              onRestart={() => startNewGame(difficulty)}
              onHome={() => setGameState('menu')}
            />
          ) : gameState === 'playing' ? (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Stats Bar */}
              <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                <div className="flex items-center gap-4">
                  <InvalidMoveCounter count={invalidMoveCount} maxCount={3} />
                  <span>Hints: {hints}</span>
                </div>
                <button 
                  onClick={() => setGameState('menu')}
                  className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  <ChevronLeft size={16} /> New Game
                </button>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium text-center"
                >
                  {errorMessage}
                </motion.div>
              )}

              {/* Sudoku Grid */}
              <div className="relative aspect-square w-full max-w-[500px] mx-auto bg-white rounded-2xl shadow-xl border-2 border-gray-800 overflow-hidden">
                {isPaused && (
                  <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
                    <button 
                      onClick={() => setIsPaused(false)}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                      Resume
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-9 h-full">
                  {currentBoard.map((row, rIndex) => (
                    row.map((cell, cIndex) => {
                      const isSelected = selectedCell?.[0] === rIndex && selectedCell?.[1] === cIndex;
                      const related = isRelated(rIndex, cIndex);
                      const sameVal = isSameValue(rIndex, cIndex);
                      const isInitial = initialBoard[rIndex][cIndex] !== null;
                      
                      return (
                        <div
                          key={`${rIndex}-${cIndex}`}
                          onClick={() => handleCellClick(rIndex, cIndex)}
                          className={`
                            relative flex items-center justify-center text-2xl md:text-3xl cursor-pointer transition-all
                            border-r border-b border-gray-200
                            ${(cIndex + 1) % 3 === 0 && cIndex !== 8 ? 'border-r-2 border-r-gray-800' : ''}
                            ${(rIndex + 1) % 3 === 0 && rIndex !== 8 ? 'border-b-2 border-b-gray-800' : ''}
                            ${isSelected ? 'bg-indigo-600 text-white z-10 scale-105 shadow-lg rounded-sm' : 
                              sameVal ? 'bg-indigo-100' :
                              related ? 'bg-indigo-50/50' : 'bg-white'}
                            ${!isSelected && isInitial ? 'font-bold text-gray-900' : 'font-light text-indigo-600'}
                          `}
                        >
                          {cell}
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-4 max-w-[500px] mx-auto">
                <button 
                  onClick={() => startNewGame(difficulty)}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <RotateCcw size={20} className="text-gray-600" />
                  <span className="text-xs font-bold text-gray-500 uppercase">Reset</span>
                </button>
                <button 
                  onClick={handleErase}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <Eraser size={20} className="text-gray-600" />
                  <span className="text-xs font-bold text-gray-500 uppercase">Erase</span>
                </button>
                <button 
                  onClick={handleHint}
                  disabled={hints <= 0}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  <div className="relative">
                    <Lightbulb size={20} className="text-gray-600" />
                    {hints > 0 && (
                      <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {hints}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Hint</span>
                </button>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-9 gap-2 max-w-[500px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="aspect-square flex items-center justify-center text-2xl font-medium bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="won"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <div className="inline-flex p-6 bg-indigo-100 rounded-full text-indigo-600 mb-4">
                <Trophy size={64} />
              </div>
              <h2 className="text-4xl font-bold">Magnificent!</h2>
              <p className="text-gray-500 max-w-xs mx-auto">
                You've mastered the {difficulty} level in {formatTime(timer)}. Your focus is truly impressive.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto pt-6">
                <button 
                  onClick={() => startNewGame(difficulty)}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Play Again
                </button>
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Main Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-top border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Zen Sudoku &bull; Crafted for Focus
          </p>
        </footer>
      </div>
    </div>
  );
}
