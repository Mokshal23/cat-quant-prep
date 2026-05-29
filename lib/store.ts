'use client';
import { UserProgress, AttemptRecord, DailyStats } from './types';

const STORAGE_KEY = 'catprep_progress_v1';

const defaultProgress = (): UserProgress => ({
  attempts: [],
  bookmarks: [],
  dailyStats: [],
  lastSession: null,
  streakDays: 0,
  lastActiveDate: '',
});

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as UserProgress;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: UserProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function recordAttempt(attempt: AttemptRecord) {
  const p = getProgress();
  // Remove duplicate (same questionId from same session)
  p.attempts = [...p.attempts.filter(a => a.questionId !== attempt.questionId), attempt];

  // Update daily stats
  const today = new Date().toISOString().slice(0, 10);
  let day = p.dailyStats.find(d => d.date === today);
  if (!day) { day = { date: today, attempted: 0, correct: 0, totalTime: 0 }; p.dailyStats.push(day); }
  day.attempted += 1;
  if (attempt.isCorrect) day.correct += 1;
  day.totalTime += attempt.timeTaken;

  // Streak
  if (p.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.streakDays = p.lastActiveDate === yesterday ? p.streakDays + 1 : 1;
    p.lastActiveDate = today;
  }

  saveProgress(p);
}

export function toggleBookmark(questionId: string) {
  const p = getProgress();
  if (p.bookmarks.includes(questionId)) {
    p.bookmarks = p.bookmarks.filter(b => b !== questionId);
  } else {
    p.bookmarks.push(questionId);
  }
  saveProgress(p);
  return p.bookmarks.includes(questionId);
}

export function setLastSession(chapterId: string, lod: number, questionIndex: number) {
  const p = getProgress();
  p.lastSession = { chapterId, lod, questionIndex };
  saveProgress(p);
}

// ── Analytics helpers ────────────────────────────────────────────────────────
export function getTopicAccuracy(progress: UserProgress) {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const a of progress.attempts) {
    if (!map[a.topic]) map[a.topic] = { correct: 0, total: 0 };
    map[a.topic].total += 1;
    if (a.isCorrect) map[a.topic].correct += 1;
  }
  return map;
}

export function getLodAccuracy(progress: UserProgress) {
  const map: Record<number, { correct: number; total: number }> = { 1: {correct:0,total:0}, 2: {correct:0,total:0}, 3: {correct:0,total:0} };
  for (const a of progress.attempts) {
    map[a.lod].total += 1;
    if (a.isCorrect) map[a.lod].correct += 1;
  }
  return map;
}

export function getWeakTopics(progress: UserProgress, topN = 3): string[] {
  const acc = getTopicAccuracy(progress);
  return Object.entries(acc)
    .filter(([_, v]) => v.total >= 3)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .slice(0, topN)
    .map(([topic]) => topic);
}

export function getMistakes(progress: UserProgress): AttemptRecord[] {
  return progress.attempts.filter(a => !a.isCorrect);
}
