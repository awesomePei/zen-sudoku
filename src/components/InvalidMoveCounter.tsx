import React from 'react';

interface InvalidMoveCounterProps {
  count: number;
  maxCount?: number;
}

export default function InvalidMoveCounter({ count, maxCount = 3 }: InvalidMoveCounterProps) {
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex gap-1">
        {Array.from({ length: maxCount }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < count ? 'bg-red-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {count}/{maxCount}
      </span>
    </div>
  );
}
