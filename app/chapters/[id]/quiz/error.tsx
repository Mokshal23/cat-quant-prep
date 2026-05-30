'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function QuizError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Quiz page error:', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto text-center py-16 space-y-4">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-xl font-bold text-white">Quiz failed to load</h2>
      <p className="text-red-400 text-sm font-mono bg-gray-900 p-3 rounded-lg text-left break-all">
        {error?.message || 'Unknown error'}
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm">
          Try Again
        </button>
        <Link href="/chapters"
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg text-sm">
          Back to Chapters
        </Link>
      </div>
    </div>
  );
}
