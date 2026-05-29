'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress } from '@/lib/store';
import { getManifest, pct } from '@/lib/data';
import { UserProgress } from '@/lib/types';
import { BookOpen, Zap, Target, Clock, Flame, TrendingUp, AlertCircle, Play } from 'lucide-react';

const manifest = getManifest();

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  useEffect(() => { setProgress(getProgress()); }, []);
  if (!progress) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  const totalAttempted = progress.attempts.length;
  const totalCorrect = progress.attempts.filter(a => a.isCorrect).length;
  const accuracy = pct(totalCorrect, totalAttempted);
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = progress.dailyStats.find(d => d.date === today);
  const chapterProgress = manifest.chapters.map(ch => {
    const chAttempts = progress.attempts.filter(a => a.chapterId === ch.id);
    const correct = chAttempts.filter(a => a.isCorrect).length;
    return { ...ch, attempted: chAttempts.length, correct };
  });
  const chaptersStarted = chapterProgress.filter(c => c.attempted > 0).length;
  const lastSession = progress.lastSession;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">CAT Quant Prep</h1>
          <p className="text-gray-400 text-sm mt-1">Arun Sharma · {manifest.totalQuestions} questions · {manifest.totalChapters} chapters</p>
        </div>
        <div className="flex gap-3">
          {lastSession && (
            <Link href={`/chapters/${lastSession.chapterId}/quiz?lod=${lastSession.lod}`}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Play size={15}/> Resume
            </Link>
          )}
          <Link href="/chapters" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <BookOpen size={15}/> Start Practising
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Attempted', value: totalAttempted, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Accuracy', value: `${accuracy}%`, color: 'text-green-400' },
          { icon: Flame, label: 'Streak', value: `${progress.streakDays} 🔥`, color: 'text-orange-400' },
          { icon: BookOpen, label: 'Chapters', value: `${chaptersStarted}/${manifest.totalChapters}`, color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <Icon size={18} className={`${color} mb-2`}/>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {todayStats && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-indigo-400"/><span className="text-sm font-semibold text-gray-300">Today</span></div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-xl font-bold text-white">{todayStats.attempted}</div><div className="text-xs text-gray-400">Attempted</div></div>
            <div><div className="text-xl font-bold text-green-400">{pct(todayStats.correct, todayStats.attempted)}%</div><div className="text-xs text-gray-400">Accuracy</div></div>
            <div><div className="text-xl font-bold text-blue-400">{todayStats.attempted > 0 ? Math.round(todayStats.totalTime / todayStats.attempted) : 0}s</div><div className="text-xs text-gray-400">Avg Time/Q</div></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/cat-sim" className="group bg-gradient-to-br from-indigo-900/60 to-indigo-800/30 border border-indigo-700/40 rounded-xl p-5 hover:border-indigo-500 transition-all">
          <Zap size={24} className="text-indigo-400 mb-3"/><div className="font-semibold text-white mb-1">CAT Sim Mode</div>
          <div className="text-xs text-gray-400">34 questions · 40 minutes · Mixed</div>
        </Link>
        <Link href="/mistakes" className="group bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-800/40 rounded-xl p-5 hover:border-red-600 transition-all">
          <AlertCircle size={24} className="text-red-400 mb-3"/><div className="font-semibold text-white mb-1">Mistake Log</div>
          <div className="text-xs text-gray-400">{progress.attempts.filter(a => !a.isCorrect).length} wrong answers</div>
        </Link>
        <Link href="/analytics" className="group bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-800/40 rounded-xl p-5 hover:border-green-600 transition-all">
          <TrendingUp size={24} className="text-green-400 mb-3"/><div className="font-semibold text-white mb-1">Analytics</div>
          <div className="text-xs text-gray-400">Heatmap · Time tracking · Trends</div>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-200">Chapter Progress</h2>
          <Link href="/chapters" className="text-indigo-400 hover:text-indigo-300 text-sm">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chapterProgress.slice(0, 8).map((ch) => {
            const pctDone = pct(ch.attempted, ch.questionCount);
            const acc = pct(ch.correct, ch.attempted);
            const barColors: Record<string, string> = { I:'bg-blue-500',II:'bg-purple-500',III:'bg-orange-500',IV:'bg-teal-500' };
            return (
              <Link key={ch.id} href={`/chapters/${ch.id}`} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{ch.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Block {ch.block} · {ch.questionCount}Q</div>
                  </div>
                  {ch.attempted > 0 && <span className={`text-xs font-bold ${acc >= 70 ? 'text-green-400' : acc >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{acc}%</span>}
                </div>
                <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`${barColors[ch.block] ?? 'bg-indigo-500'} h-full rounded-full`} style={{ width: `${pctDone}%` }}/>
                </div>
                <div className="text-xs text-gray-500 mt-1">{ch.attempted}/{ch.questionCount} attempted</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
