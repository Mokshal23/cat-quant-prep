'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Chapter, Question } from '@/lib/types';
import { recordAttempt, toggleBookmark, getProgress, setLastSession } from '@/lib/store';
import { Timer, CheckCircle, XCircle, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, RotateCcw, Home, Eye } from 'lucide-react';
import { formatTime } from '@/lib/data';

interface Props { chapter: Chapter; lodParam: string }

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const LOD_TIME_LIMITS: Record<number, number> = { 1: 90, 2: 150, 3: 210 };

export default function QuizEngine({ chapter, lodParam }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [titaInput, setTitaInput] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionResults, setSessionResults] = useState<{ correct: number; wrong: number; skipped: number }>({ correct: 0, wrong: 0, skipped: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [allAttemptedIds, setAllAttemptedIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef<number>(Date.now());

  // Init questions
  useEffect(() => {
    let qs: Question[] = [];
    if (lodParam === 'all') {
      qs = shuffle(chapter.questions);
    } else {
      const lod = parseInt(lodParam) as 1 | 2 | 3;
      qs = shuffle(chapter.questions.filter(q => q.lod === lod));
    }
    setQuestions(qs);
    setCurrentIdx(0);
    setIsRevealed(false);
    setSelectedOption(null);
    setTitaInput('');
    setElapsed(0);
    questionStartRef.current = Date.now();
  }, [chapter.id, lodParam]);

  // Per-question timer
  useEffect(() => {
    setElapsed(0);
    questionStartRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - questionStartRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx, questions.length]);

  // Check bookmarks
  useEffect(() => {
    if (!questions[currentIdx]) return;
    const p = getProgress();
    setBookmarked(p.bookmarks.includes(questions[currentIdx].id));
  }, [currentIdx, questions]);

  // Save last session
  useEffect(() => {
    if (questions.length > 0) {
      const lod = parseInt(lodParam) || 1;
      setLastSession(chapter.id, lod, currentIdx);
    }
  }, [currentIdx, chapter.id, lodParam, questions.length]);

  const current = questions[currentIdx];
  if (!current) return <div className="flex justify-center py-20 text-gray-400">Loading questions...</div>;

  const lod = current.lod;
  const timeLimit = LOD_TIME_LIMITS[lod];
  const timeWarning = elapsed > timeLimit * 0.75;

  const lodColors = { 1: 'text-green-400', 2: 'text-amber-400', 3: 'text-red-400' } as const;
  const lodBg = { 1: 'bg-green-900/30 border-green-700/40', 2: 'bg-amber-900/30 border-amber-700/40', 3: 'bg-red-900/30 border-red-700/40' } as const;

  const optionKeys = ['a', 'b', 'c', 'd'].filter(k => current.options[k]);

  const handleReveal = useCallback(() => {
    if (isRevealed) return;
    const timeTaken = Math.floor((Date.now() - questionStartRef.current) / 1000);
    if (timerRef.current) clearInterval(timerRef.current);

    let userAnswer = '';
    let correct = false;

    if (current.type === 'mcq') {
      userAnswer = selectedOption ?? '';
      correct = !!selectedOption && selectedOption === current.answer;
    } else {
      userAnswer = titaInput.trim();
      correct = !!userAnswer && userAnswer.replace(/\s/g,'') === (current.answer ?? '').replace(/\s/g,'');
    }

    setIsRevealed(true);
    setIsCorrect(correct);

    if (current.answer !== null) {
      const record = {
        questionId: current.id,
        chapterId: chapter.id,
        topic: chapter.topic,
        lod: current.lod,
        type: current.type,
        userAnswer,
        correctAnswer: current.answer ?? '',
        isCorrect: correct,
        timeTaken,
        timestamp: Date.now(),
        bookmarked: false,
      };
      recordAttempt(record);
      setAllAttemptedIds(prev => new Set(prev).add(current.id));
      setSessionResults(prev => ({
        ...prev,
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (!correct && userAnswer ? 1 : 0),
        skipped: prev.skipped + (!userAnswer ? 1 : 0),
      }));
    }
  }, [isRevealed, selectedOption, titaInput, current, chapter]);

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      setIsFinished(true);
      return;
    }
    setCurrentIdx(i => i + 1);
    setSelectedOption(null);
    setTitaInput('');
    setIsRevealed(false);
    setIsCorrect(null);
    setElapsed(0);
  }, [currentIdx, questions.length]);

  const handlePrev = () => {
    if (currentIdx === 0) return;
    setCurrentIdx(i => i - 1);
    setSelectedOption(null);
    setTitaInput('');
    setIsRevealed(false);
    setIsCorrect(null);
  };

  const handleBookmark = () => {
    const wasBookmarked = toggleBookmark(current.id);
    setBookmarked(wasBookmarked);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setTitaInput('');
    setIsRevealed(false);
    setIsCorrect(null);
    setIsFinished(false);
    setSessionResults({ correct: 0, wrong: 0, skipped: 0 });
    setAllAttemptedIds(new Set());
  };

  // Finished screen
  if (isFinished) {
    const total = questions.length;
    const accuracy = total > 0 ? Math.round((sessionResults.correct / total) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-4xl">🎯</div>
        <h1 className="text-2xl font-bold text-white">Session Complete!</h1>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Correct', value: sessionResults.correct, color: 'text-green-400' },
            { label: 'Wrong', value: sessionResults.wrong, color: 'text-red-400' },
            { label: 'Skipped', value: sessionResults.skipped, color: 'text-gray-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white mb-1">{accuracy}%</div>
          <div className="text-sm text-gray-400">Accuracy ({sessionResults.correct}/{total})</div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={handleRestart} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <RotateCcw size={15}/> Try Again
          </button>
          <Link href={`/chapters/${chapter.id}`} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Home size={15}/> Chapter
          </Link>
          <Link href="/analytics" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Analytics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress bar + meta */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Link href={`/chapters/${chapter.id}`} className="hover:text-white">
            <ChevronLeft size={16} className="inline"/>Back
          </Link>
          <span>·</span>
          <span>{chapter.title}</span>
        </div>
        <span>{currentIdx + 1} / {questions.length}</span>
      </div>

      <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}/>
      </div>

      {/* Session score */}
      <div className="flex gap-4 text-xs">
        <span className="text-green-400">✓ {sessionResults.correct}</span>
        <span className="text-red-400">✗ {sessionResults.wrong}</span>
        <span className="text-gray-500">— {sessionResults.skipped}</span>
        <span className="ml-auto text-gray-400">{questions.length - currentIdx - 1} remaining</span>
      </div>

      {/* Question card */}
      <div className={`border rounded-2xl p-5 space-y-4 ${lodBg[lod as keyof typeof lodBg]}`}>
        {/* Card header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold ${lodColors[lod as keyof typeof lodColors]}`}>
              LOD {lod}
            </span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-500 uppercase">{current.type}</span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-500">Q{current.num}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleBookmark} className="text-gray-400 hover:text-amber-400 transition-colors">
              {bookmarked ? <BookmarkCheck size={16} className="text-amber-400"/> : <Bookmark size={16}/>}
            </button>
            <div className={`flex items-center gap-1 text-xs font-mono ${timeWarning ? 'timer-warning text-red-400' : 'text-gray-400'}`}>
              <Timer size={12}/>{formatTime(elapsed)}
            </div>
          </div>
        </div>

        {/* Question text */}
        <div className="q-text text-gray-200 text-sm leading-relaxed">{current.text}</div>

        {/* MCQ options */}
        {current.type === 'mcq' && (
          <div className="space-y-2">
            {optionKeys.map(key => {
              let style = 'bg-gray-800/60 border-gray-700 hover:border-gray-500 text-gray-200';
              if (isRevealed) {
                if (key === current.answer) style = 'bg-green-900/50 border-green-500 text-green-200';
                else if (key === selectedOption && key !== current.answer) style = 'bg-red-900/50 border-red-500 text-red-200';
                else style = 'bg-gray-800/30 border-gray-800 text-gray-500';
              } else if (selectedOption === key) {
                style = 'bg-indigo-900/50 border-indigo-500 text-indigo-200';
              }
              return (
                <button key={key} disabled={isRevealed}
                  onClick={() => !isRevealed && setSelectedOption(key)}
                  className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition-all ${style} ${!isRevealed ? 'cursor-pointer' : 'cursor-default'}`}>
                  <span className="font-semibold mr-2">({key})</span>{current.options[key]}
                </button>
              );
            })}
          </div>
        )}

        {/* TITA input */}
        {current.type === 'tita' && (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Enter your answer (Type in the Answer)</label>
            <input
              type="text"
              value={titaInput}
              onChange={e => !isRevealed && setTitaInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isRevealed && handleReveal()}
              disabled={isRevealed}
              placeholder="Type your answer here..."
              className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors
                ${isRevealed
                  ? (isCorrect ? 'border-green-600' : 'border-red-600')
                  : 'border-gray-600 focus:border-indigo-500'}`}
            />
            {isRevealed && !isCorrect && current.answer && (
              <div className="mt-2 text-sm text-green-400">
                ✓ Correct answer: <span className="font-bold">{current.answer}</span>
              </div>
            )}
          </div>
        )}

        {/* Reveal / Result */}
        {isRevealed && (
          <div className={`rounded-xl p-4 border text-sm ${isCorrect ? 'bg-green-900/20 border-green-700/40' : 'bg-red-900/20 border-red-700/40'}`}>
            <div className={`flex items-center gap-2 font-semibold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? <CheckCircle size={16}/> : <XCircle size={16}/>}
              {isCorrect ? 'Correct!' : `Wrong — Answer: (${current.answer})`}
            </div>
            {current.solution && (
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{current.solution}</div>
            )}
            {!current.solution && (
              <div className="text-gray-500 italic text-xs">Detailed solution not available for this question.</div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          {!isRevealed ? (
            <button onClick={handleReveal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 justify-center">
              <Eye size={15}/> Check Answer
            </button>
          ) : (
            <button onClick={handleNext}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 justify-center">
              Next <ChevronRight size={15}/>
            </button>
          )}
          {currentIdx > 0 && (
            <button onClick={handlePrev} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-xl text-sm transition-colors">
              <ChevronLeft size={15}/>
            </button>
          )}
        </div>
      </div>

      {/* CAT benchmark */}
      <div className="text-xs text-center text-gray-600">
        CAT avg: {timeLimit}s per question · Your time: {elapsed}s
        {elapsed > timeLimit && <span className="text-amber-500 ml-2">⚠ Over time</span>}
      </div>
    </div>
  );
}
