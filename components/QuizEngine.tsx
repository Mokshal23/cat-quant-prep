'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Chapter, Question } from '@/lib/types';
import { recordAttempt, toggleBookmark, getProgress, setLastSession } from '@/lib/store';
import { Timer, CheckCircle, XCircle, Bookmark, BookmarkCheck,
         ChevronLeft, ChevronRight, RotateCcw, Home, Eye, AlertCircle } from 'lucide-react';
import { formatTime } from '@/lib/data';

interface Props { chapter: Chapter; lodParam: string }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

const LOD_TIME: Record<number, number> = { 1: 90, 2: 150, 3: 210 };

export default function QuizEngine({ chapter, lodParam }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [tita, setTita] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    let qs: Question[] = [];
    if (lodParam === 'all') {
      qs = shuffle(chapter.questions.filter(q => q.answer));
    } else {
      const lod = parseInt(lodParam) as 1|2|3;
      qs = shuffle(chapter.questions.filter(q => q.lod === lod));
      // If filter returns 0, fall back to all questions of any lod
      if (qs.length === 0) qs = shuffle(chapter.questions.filter(q => q.lod === lod));
    }
    setQuestions(qs);
    setIdx(0); setSelected(null); setTita('');
    setRevealed(false); setIsCorrect(null); setElapsed(0);
    setScore({ correct: 0, wrong: 0, skipped: 0 }); setFinished(false);
    startRef.current = Date.now();
  }, [chapter.id, lodParam]);

  useEffect(() => {
    setElapsed(0); startRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-startRef.current)/1000)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [idx, questions.length]);

  useEffect(() => {
    if (!questions[idx]) return;
    const p = getProgress();
    setBookmarked(p.bookmarks.includes(questions[idx].id));
  }, [idx, questions]);

  useEffect(() => {
    if (questions.length > 0) setLastSession(chapter.id, parseInt(lodParam)||1, idx);
  }, [idx, chapter.id, lodParam, questions.length]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (questions.length === 0 && chapter.questions.length > 0) {
    const lod = parseInt(lodParam);
    const available = [1,2,3].filter(l => chapter.questions.some(q => q.lod === l));
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-5">
        <AlertCircle size={36} className="text-amber-400 mx-auto"/>
        <h2 className="text-xl font-bold text-white">
          {isNaN(lod) ? 'No questions found' : `LOD ${lod} has no questions for this chapter`}
        </h2>
        <p className="text-gray-400 text-sm">Try a different difficulty level:</p>
        <div className="flex gap-3 justify-center">
          {available.map(l => (
            <Link key={l} href={`/chapters/${chapter.id}/quiz?lod=${l}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              LOD {l}
            </Link>
          ))}
          <Link href={`/chapters/${chapter.id}`}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  const current = questions[idx];

  const handleReveal = useCallback(() => {
    if (revealed || !current) return;
    const timeTaken = Math.floor((Date.now()-startRef.current)/1000);
    if (timerRef.current) clearInterval(timerRef.current);
    const userAns = current.type==='mcq' ? (selected??'') : tita.trim();
    const correct = current.type==='mcq'
      ? !!selected && selected===current.answer
      : !!userAns && userAns.replace(/\s/g,'')===(current.answer??'').replace(/\s/g,'');
    setRevealed(true); setIsCorrect(correct);
    if (current.answer !== null) {
      recordAttempt({ questionId:current.id, chapterId:chapter.id, topic:chapter.topic,
        lod:current.lod, type:current.type, userAnswer:userAns,
        correctAnswer:current.answer??'', isCorrect:correct, timeTaken,
        timestamp:Date.now(), bookmarked:false });
      setScore(s => ({ correct:s.correct+(correct?1:0), wrong:s.wrong+(!correct&&!!userAns?1:0), skipped:s.skipped+(!userAns?1:0) }));
    }
  }, [revealed, selected, tita, current, chapter]);

  const handleNext = useCallback(() => {
    if (idx+1 >= questions.length) { setFinished(true); return; }
    setIdx(i=>i+1); setSelected(null); setTita('');
    setRevealed(false); setIsCorrect(null); setElapsed(0);
  }, [idx, questions.length]);

  const handlePrev = () => {
    if (idx===0) return;
    setIdx(i=>i-1); setSelected(null); setTita('');
    setRevealed(false); setIsCorrect(null);
  };

  if (finished) {
    const total = questions.length;
    const acc = total>0 ? Math.round((score.correct/total)*100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-4xl">🎯</div>
        <h1 className="text-2xl font-bold text-white">Session Complete!</h1>
        <div className="grid grid-cols-3 gap-4">
          {[{l:'Correct',v:score.correct,c:'text-green-400'},{l:'Wrong',v:score.wrong,c:'text-red-400'},{l:'Skipped',v:score.skipped,c:'text-gray-400'}].map(({l,v,c})=>(
            <div key={l} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className={`text-2xl font-bold ${c}`}>{v}</div>
              <div className="text-xs text-gray-400 mt-1">{l}</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-3xl font-bold text-white mb-1">{acc}%</div>
          <div className="text-sm text-gray-400">Accuracy ({score.correct}/{total})</div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={()=>{setIdx(0);setSelected(null);setTita('');setRevealed(false);setIsCorrect(null);setFinished(false);setScore({correct:0,wrong:0,skipped:0});}}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
            <RotateCcw size={15}/> Try Again
          </button>
          <Link href={`/chapters/${chapter.id}`} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
            <Home size={15}/> Chapter
          </Link>
          <Link href="/analytics" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
            Analytics
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return <div className="flex justify-center py-20 text-gray-400">Loading questions...</div>;

  const lod = current.lod;
  const timeLimit = LOD_TIME[lod];
  const timeWarning = elapsed > timeLimit*0.75;
  const lodBg = {1:'border-green-700/40 bg-green-950/10',2:'border-amber-700/40 bg-amber-950/10',3:'border-red-700/40 bg-red-950/10'} as const;
  const lodColor = {1:'text-green-400',2:'text-amber-400',3:'text-red-400'} as const;
  const optKeys = ['a','b','c','d'].filter(k=>current.options[k]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <Link href={`/chapters/${chapter.id}`} className="hover:text-white flex items-center gap-1">
          <ChevronLeft size={16}/>Back
        </Link>
        <span className="text-gray-500">{chapter.title}</span>
        <span>{idx+1} / {questions.length}</span>
      </div>

      <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className="bg-indigo-500 h-full rounded-full transition-all" style={{width:`${((idx+1)/questions.length)*100}%`}}/>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="text-green-400">✓ {score.correct}</span>
        <span className="text-red-400">✗ {score.wrong}</span>
        <span className="text-gray-500">— {score.skipped}</span>
        <span className="ml-auto text-gray-500">{questions.length-idx-1} left</span>
      </div>

      <div className={`border-2 rounded-2xl p-5 space-y-4 ${lodBg[lod as keyof typeof lodBg]}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-xs font-bold ${lodColor[lod as keyof typeof lodColor]}`}>LOD {lod}</span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-500 uppercase">{current.type}</span>
            <span className="text-xs text-gray-500">· Q{current.num}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setBookmarked(toggleBookmark(current.id))} className="text-gray-400 hover:text-amber-400 transition-colors">
              {bookmarked ? <BookmarkCheck size={16} className="text-amber-400"/> : <Bookmark size={16}/>}
            </button>
            <div className={`flex items-center gap-1 text-xs font-mono ${timeWarning?'timer-warning text-red-400':'text-gray-400'}`}>
              <Timer size={12}/>{formatTime(elapsed)}
            </div>
          </div>
        </div>

        <div className="q-text text-gray-200 text-sm leading-relaxed">{current.text}</div>

        {current.type==='mcq' && (
          <div className="space-y-2">
            {optKeys.map(key => {
              let style='bg-gray-800/60 border-gray-700 hover:border-gray-500 text-gray-200';
              if(revealed){
                if(key===current.answer) style='bg-green-900/50 border-green-500 text-green-200';
                else if(key===selected) style='bg-red-900/50 border-red-500 text-red-200 opacity-60';
                else style='bg-gray-800/20 border-gray-800 text-gray-600';
              } else if(selected===key) style='bg-indigo-900/50 border-indigo-500 text-indigo-200';
              return (
                <button key={key} disabled={revealed} onClick={()=>!revealed&&setSelected(key)}
                  className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition-all ${style}`}>
                  <span className="font-semibold mr-2">({key})</span>{current.options[key]}
                </button>
              );
            })}
          </div>
        )}

        {current.type==='tita' && (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Type in the Answer (TITA)</label>
            <input type="text" value={tita} onChange={e=>!revealed&&setTita(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!revealed&&handleReveal()}
              disabled={revealed} placeholder="Enter your answer..."
              className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors
                ${revealed?(isCorrect?'border-green-600':'border-red-600'):'border-gray-600 focus:border-indigo-500'}`}/>
            {revealed && !isCorrect && current.answer && (
              <div className="mt-2 text-sm text-green-400">✓ Correct: <span className="font-bold">{current.answer}</span></div>
            )}
          </div>
        )}

        {revealed && (
          <div className={`rounded-xl p-4 border text-sm ${isCorrect?'bg-green-900/20 border-green-700/40':'bg-red-900/20 border-red-700/40'}`}>
            <div className={`flex items-center gap-2 font-semibold mb-2 ${isCorrect?'text-green-400':'text-red-400'}`}>
              {isCorrect?<CheckCircle size={16}/>:<XCircle size={16}/>}
              {isCorrect?'Correct!':current.type==='mcq'?`Wrong — Answer: (${current.answer})`:`Wrong — Answer: ${current.answer}`}
            </div>
            {current.solution
              ? <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{current.solution}</div>
              : <div className="text-gray-500 italic text-xs">Detailed solution not available for this question.</div>}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          {!revealed
            ? <button onClick={handleReveal}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Eye size={15}/> Check Answer
              </button>
            : <button onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Next <ChevronRight size={15}/>
              </button>
          }
          {idx>0 && (
            <button onClick={handlePrev} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-xl text-sm transition-colors">
              <ChevronLeft size={15}/>
            </button>
          )}
          {!revealed && (
            <button onClick={handleNext} className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2.5 rounded-xl text-sm transition-colors">
              Skip
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-center text-gray-600">
        CAT target: {timeLimit}s · Your time: {elapsed}s
        {elapsed>timeLimit && <span className="text-amber-500 ml-2">⚠ Over time</span>}
      </div>
    </div>
  );
}
