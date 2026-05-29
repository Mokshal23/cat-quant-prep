'use client';
import { useEffect, useState } from 'react';
import { getProgress, getTopicAccuracy, getLodAccuracy } from '@/lib/store';
import { pct, formatTime } from '@/lib/data';
import { UserProgress } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

export default function AnalyticsPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  useEffect(() => { setProgress(getProgress()); }, []);

  if (!progress) return <div className="flex justify-center py-20 text-gray-400">Loading...</div>;

  const topicAcc = getTopicAccuracy(progress);
  const lodAcc = getLodAccuracy(progress);
  const total = progress.attempts.length;
  const correct = progress.attempts.filter(a => a.isCorrect).length;
  const avgTime = total > 0 ? Math.round(progress.attempts.reduce((s, a) => s + a.timeTaken, 0) / total) : 0;

  const topicData = Object.entries(topicAcc).map(([topic, { correct, total }]) => ({
    topic, correct, total, accuracy: pct(correct, total),
  })).sort((a, b) => b.total - a.total);

  const lodData = [1, 2, 3].map(lod => ({
    lod: `LOD ${lod}`, ...lodAcc[lod], accuracy: pct(lodAcc[lod].correct, lodAcc[lod].total),
  }));

  // Daily trend (last 14 days)
  const last14 = [...Array(14)].map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10);
    const day = progress.dailyStats.find(s => s.date === d);
    return { date: d.slice(5), attempted: day?.attempted ?? 0, accuracy: day ? pct(day.correct, day.attempted) : 0, avgTime: day && day.attempted > 0 ? Math.round(day.totalTime / day.attempted) : 0 };
  });

  // Per-question time distribution
  const timeDistrib = [
    { range: '0-30s', count: progress.attempts.filter(a => a.timeTaken <= 30).length },
    { range: '30-60s', count: progress.attempts.filter(a => a.timeTaken > 30 && a.timeTaken <= 60).length },
    { range: '60-120s', count: progress.attempts.filter(a => a.timeTaken > 60 && a.timeTaken <= 120).length },
    { range: '120-180s', count: progress.attempts.filter(a => a.timeTaken > 120 && a.timeTaken <= 180).length },
    { range: '180s+', count: progress.attempts.filter(a => a.timeTaken > 180).length },
  ];

  const getBarColor = (accuracy: number) => accuracy >= 70 ? '#22c55e' : accuracy >= 50 ? '#f59e0b' : '#ef4444';

  if (total === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">📊</div>
        <h1 className="text-xl font-bold text-white mb-2">No Data Yet</h1>
        <p className="text-gray-400">Complete some quizzes to see your analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempted', value: total, color: 'text-blue-400' },
          { label: 'Overall Accuracy', value: `${pct(correct, total)}%`, color: pct(correct,total) >= 70 ? 'text-green-400' : 'text-amber-400' },
          { label: 'Avg Time / Q', value: formatTime(avgTime), color: 'text-purple-400' },
          { label: 'Streak', value: `${progress.streakDays} 🔥`, color: 'text-orange-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Daily trend */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Questions Attempted — Last 14 Days</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={last14} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="attempted" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy trend */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Daily Accuracy % — Last 14 Days</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={last14} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Topic accuracy heatmap */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Topic-wise Accuracy</h2>
        {topicData.length === 0 ? <p className="text-gray-500 text-sm">No data yet</p> : (
          <div className="space-y-3">
            {topicData.map(({ topic, correct, total, accuracy }) => (
              <div key={topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{topic}</span>
                  <span className="text-gray-400">{correct}/{total} · <span style={{ color: getBarColor(accuracy) }}>{accuracy}%</span></span>
                </div>
                <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${accuracy}%`, background: getBarColor(accuracy) }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOD breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Accuracy by Difficulty Level</h2>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={lodData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="lod" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
              {lodData.map((entry, i) => (
                <Cell key={i} fill={['#22c55e', '#f59e0b', '#ef4444'][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time distribution */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Time per Question Distribution</h2>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={timeDistrib} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-2">CAT target: solve LOD1 in ~90s, LOD2 in ~150s, LOD3 in ~210s</p>
      </div>
    </div>
  );
}
