'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress, getMistakes } from '@/lib/store';
import { AttemptRecord } from '@/lib/types';
import { AlertCircle, ExternalLink, Filter } from 'lucide-react';
import { formatTime } from '@/lib/data';

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<AttemptRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const p = getProgress();
    const m = getMistakes(p);
    setMistakes(m.sort((a, b) => b.timestamp - a.timestamp));
    setTopics([...new Set(m.map(x => x.topic))]);
  }, []);

  const filtered = filter === 'all' ? mistakes : mistakes.filter(m => m.topic === filter);

  const lodColor = (lod: number) => lod === 1 ? 'text-green-400 bg-green-900/30' : lod === 2 ? 'text-amber-400 bg-amber-900/30' : 'text-red-400 bg-red-900/30';

  if (mistakes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-white mb-2">No Mistakes Yet</h1>
        <p className="text-gray-400 text-sm">Complete some quizzes and wrong answers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertCircle size={22} className="text-red-400" /> Mistake Log
        </h1>
        <span className="text-sm text-gray-400">{filtered.length} wrong answers</span>
      </div>

      {/* Filter by topic */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-gray-500" />
        {['all', ...topics].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t === 'all' ? 'All Topics' : t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${lodColor(m.lod)}`}>LOD {m.lod}</span>
                <span className="text-xs text-gray-500">{m.topic}</span>
                <span className="text-xs text-gray-600">{m.type.toUpperCase()}</span>
                <span className="text-xs text-gray-600">⏱ {formatTime(m.timeTaken)}</span>
              </div>
              <Link href={`/chapters/${m.chapterId}/quiz?lod=${m.lod}`}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 whitespace-nowrap">
                Re-attempt <ExternalLink size={11} />
              </Link>
            </div>

            <div className="text-sm text-gray-200 bg-gray-800/50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
              {m.questionId.split('-').pop()} — {m.userAnswer ? `You answered: "${m.userAnswer}"` : 'Skipped'}
            </div>

            <div className="flex gap-4 text-xs">
              <span className="text-green-400">✓ Correct: <strong>{m.correctAnswer || 'N/A'}</strong></span>
              {m.userAnswer && <span className="text-red-400">✗ Yours: <strong>{m.userAnswer}</strong></span>}
            </div>

            <div className="text-xs text-gray-600">{new Date(m.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
