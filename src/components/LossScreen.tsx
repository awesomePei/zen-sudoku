import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ChevronLeft } from 'lucide-react';

interface LossScreenProps {
  difficulty: string;
  onRestart: () => void;
  onHome: () => void;
}

export default function LossScreen({ difficulty, onRestart, onHome }: LossScreenProps) {
  return (
    <motion.div
      key="lost"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 space-y-6"
    >
      <div className="inline-flex p-6 bg-red-100 rounded-full text-red-600 mb-4">
        <span className="text-6xl">✕</span>
      </div>
      <h2 className="text-4xl font-bold text-gray-900">Game Over</h2>
      <p className="text-gray-500 max-w-xs mx-auto">
        You've reached the three-strike limit on {difficulty} difficulty. Keep practicing!
      </p>
      <div className="flex flex-col gap-3 max-w-xs mx-auto pt-6">
        <button
          onClick={onRestart}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          Try Again
        </button>
        <button
          onClick={onHome}
          className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronLeft size={20} />
          Main Menu
        </button>
      </div>
    </motion.div>
  );
}
