'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { getProgress } from '@/lib/store';
import { pct as pctFn } from '@/lib/data';
import { Play, BookOpen, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface Props { chapter: Chapter }

const lodLabel = (lod: number) => lod === 1 ? 'LOD 1 — Easy' : lod === 2 ? 'LOD 2 — Medium' : 'LOD 3 — Hard';
const lodColors = { 1: 'bg-green-900/40 border-green-700/40 hover:border-green-500', 2: 'bg-amber-900/40 border-amber-700/40 hover:border-amber-500', 3: 'bg-red-900/40 border-red-700/40 hover:border-red-500' };
const lodBadge = { 1: 'bg-green-900 text-green-300', 2: 'bg-amber-900 text-amber-300', 3: 'bg-red-900 text-red-300' };

export default function ChapterClient({ chapter }: Props) {
  const [tab, setTab] = useState<'notes' | 'quiz'>('notes');
  const [showAllFormulas, setShowAllFormulas] = useState(false);
  const [progress, setProgress] = useState<ReturnType<typeof getProgress> | null>(null);

  useEffect(() => { setProgress(getProgress()); }, []);

  const chAttempts = progress?.attempts.filter(a => a.chapterId === chapter.id) ?? [];
  const chCorrect = chAttempts.filter(a => a.isCorrect).length;
  const accuracy = progress ? pctFn(chCorrect, chAttempts.length) : 0;

  const availableLods = [1, 2, 3].filter(lod =>
    chapter.questions.some(q => q.lod === lod)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            <Link href="/chapters" className="hover:text-gray-300">Chapters</Link> › Chapter {chapter.num}
          </div>
          <h1 className="text-2xl font-bold text-white">{chapter.title}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
            <span>Block {chapter.block} · {chapter.blockName}</span>
            <span>·</span>
            <span>{chapter.questionCount} questions</span>
            {chAttempts.length > 0 && <>
              <span>·</span>
              <span className={`font-semibold ${accuracy >= 70 ? 'text-green-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {accuracy}% accuracy
              </span>
            </>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('notes')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'notes' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            <BookOpen size={14} className="inline mr-1.5"/>Notes
          </button>
          <button onClick={() => setTab('quiz')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'quiz' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            <Play size={14} className="inline mr-1.5"/>Quiz
          </button>
        </div>
      </div>

      {/* Notes tab */}
      {tab === 'notes' && (
        <div className="space-y-6">
          {/* Overview */}
          {chapter.notes.intro && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-indigo-400 mb-3 uppercase tracking-wide">Overview</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{chapter.notes.intro}</p>
            </div>
          )}

          {/* Key Concepts */}
          {chapter.notes.concepts.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wide">Key Concepts</h2>
              <div className="space-y-3">
                {chapter.notes.concepts.slice(1).map((concept, i) => (
                  <div key={i} className="text-sm text-gray-300 leading-relaxed border-l-2 border-gray-700 pl-3">
                    {concept.slice(0, 400)}{concept.length > 400 ? '...' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas */}
          {chapter.notes.formulas.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">Formulas & Key Results</h2>
                {chapter.notes.formulas.length > 5 && (
                  <button onClick={() => setShowAllFormulas(!showAllFormulas)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                    {showAllFormulas ? <><ChevronUp size={12}/>Show less</> : <><ChevronDown size={12}/>Show all {chapter.notes.formulas.length}</>}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {(showAllFormulas ? chapter.notes.formulas : chapter.notes.formulas.slice(0, 8)).map((f, i) => (
                  <div key={i} className="bg-gray-800/60 rounded-lg px-3 py-2 font-mono text-sm text-amber-200 border border-gray-700/50">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-3">Ready to practise this chapter?</p>
            <button onClick={() => setTab('quiz')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Start Quiz →
            </button>
          </div>
        </div>
      )}

      {/* Quiz tab */}
      {tab === 'quiz' && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-200">Choose a Level</h2>
          {availableLods.map(lod => {
            const count = chapter.lodCounts[`lod${lod}` as keyof typeof chapter.lodCounts];
            const lodAttempts = chAttempts.filter(a => a.lod === lod);
            const lodCorrect = lodAttempts.filter(a => a.isCorrect).length;
            const lodAcc = pctFn(lodCorrect, lodAttempts.length);
            return (
              <Link key={lod} href={`/chapters/${chapter.id}/quiz?lod=${lod}`}
                className={`flex items-center justify-between border rounded-xl p-5 transition-all ${lodColors[lod as keyof typeof lodColors]}`}>
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${lodBadge[lod as keyof typeof lodBadge]}`}>{lodLabel(lod)}</span>
                  <div className="text-white font-medium mt-2">{count} questions</div>
                  {lodAttempts.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">{lodAttempts.length} attempted · {lodAcc}% accuracy</div>
                  )}
                </div>
                <Play size={20} className="text-gray-400"/>
              </Link>
            );
          })}

          <Link href={`/chapters/${chapter.id}/quiz?lod=all`}
            className="flex items-center justify-between bg-indigo-900/30 border border-indigo-700/40 hover:border-indigo-500 rounded-xl p-5 transition-all">
            <div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-900 text-indigo-300">All Levels Mixed</span>
              <div className="text-white font-medium mt-2">{chapter.questionCount} questions</div>
            </div>
            <Zap size={20} className="text-indigo-400"/>
          </Link>
        </div>
      )}
    </div>
  );
}
