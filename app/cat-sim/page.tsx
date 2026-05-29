'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Question } from '@/lib/types';
import { recordAttempt } from '@/lib/store';
import { Eye, ChevronRight, Zap, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

// Import all chapters statically
import ch01 from '@/data/ch01.json';
import ch02 from '@/data/ch02.json';
import ch03 from '@/data/ch03.json';
import ch04 from '@/data/ch04.json';
import ch05 from '@/data/ch05.json';
import ch06 from '@/data/ch06.json';
import ch07 from '@/data/ch07.json';
import ch08 from '@/data/ch08.json';
import ch09 from '@/data/ch09.json';
import ch10 from '@/data/ch10.json';
import ch11 from '@/data/ch11.json';

const ALL_CHAPTERS = [ch01,ch02,ch03,ch04,ch05,ch06,ch07,ch08,ch09,ch10,ch11] as any[];
const SIM_TOTAL_TIME = 40 * 60;
const SIM_QUESTIONS = 34;

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

type SimState = 'setup' | 'running' | 'finished';
type TaggedQ = Question & { chapterId: string; topic: string };

export default function CatSimPage() {
  const [simState, setSimState] = useState<SimState>('setup');
  const [questions, setQuestions] = useState<TaggedQ[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [titaInput, setTitaInput] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(SIM_TOTAL_TIME);
  const [results, setResults] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const questionStartRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSim = useCallback(() => {
    const allQs: TaggedQ[] = [];
    for (const ch of ALL_CHAPTERS) {
      const lod2 = (ch.questions as Question[]).filter(q => q.lod === 2 && q.answer);
      const lod3 = (ch.questions as Question[]).filter(q => q.lod === 3 && q.answer);
      const tagged = [...shuffle(lod2).slice(0,2), ...shuffle(lod3).slice(0,1)]
        .map(q => ({ ...q, chapterId: ch.id, topic: ch.topic }));
      allQs.push(...tagged);
    }
    setQuestions(shuffle(allQs).slice(0, SIM_QUESTIONS));
    setCurrentIdx(0); setSelectedOption(null); setTitaInput('');
    setIsRevealed(false); setIsCorrect(null); setTimeLeft(SIM_TOTAL_TIME);
    setResults({ correct: 0, wrong: 0, skipped: 0 });
    setSimState('running');
    questionStartRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (simState !== 'running') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); setSimState('finished'); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [simState]);

  const current = questions[currentIdx];

  const handleReveal = () => {
    if (isRevealed || !current) return;
    const timeTaken = Math.floor((Date.now() - questionStartRef.current) / 1000);
    const userAnswer = current.type === 'mcq' ? (selectedOption ?? '') : titaInput.trim();
    const correct = current.type === 'mcq'
      ? !!selectedOption && selectedOption === current.answer
      : !!userAnswer && userAnswer === (current.answer ?? '');
    setIsRevealed(true); setIsCorrect(correct);
    if (current.answer) {
      recordAttempt({ questionId: current.id, chapterId: current.chapterId, topic: current.topic,
        lod: current.lod, type: current.type, userAnswer, correctAnswer: current.answer ?? '',
        isCorrect: correct, timeTaken, timestamp: Date.now(), bookmarked: false });
      setResults(r => ({ correct: r.correct+(correct?1:0), wrong: r.wrong+(!correct&&!!userAnswer?1:0), skipped: r.skipped+(!userAnswer?1:0) }));
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) { setSimState('finished'); return; }
    setCurrentIdx(i => i+1); setSelectedOption(null); setTitaInput('');
    setIsRevealed(false); setIsCorrect(null);
    questionStartRef.current = Date.now();
  };

  const mm = String(Math.floor(timeLeft/60)).padStart(2,'0');
  const ss = String(timeLeft%60).padStart(2,'0');
  const timerWarning = timeLeft < 300;
  const optionKeys = current ? ['a','b','c','d'].filter(k => current.options[k]) : [];

  if (simState === 'setup') return (
    <div className="max-w-lg mx-auto text-center space-y-6 py-10">
      <Zap size={40} className="text-indigo-400 mx-auto"/>
      <h1 className="text-2xl font-bold text-white">CAT Sim Mode</h1>
      <p className="text-gray-400">Simulate a real CAT Quant section: {SIM_QUESTIONS} questions in 40 minutes. Mixed topics, LOD 2 & 3 bias.</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left space-y-3">
        {[['Questions',`${SIM_QUESTIONS} (mixed topics)`],['Time','40 minutes total'],['Difficulty','LOD 2 + LOD 3 weighted'],['Scoring','+1 correct, −0.33 wrong (CAT)']].map(([k,v]) => (
          <div key={k} className="flex justify-between text-sm"><span className="text-gray-400">{k}</span><span className="text-white">{v}</span></div>
        ))}
      </div>
      <button onClick={startSim} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold w-full">Start CAT Sim</button>
      <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm block">← Back to home</Link>
    </div>
  );

  if (simState === 'finished') {
    const total = questions.length;
    const catScore = results.correct - results.wrong * 0.33;
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-10">
        <div className="text-4xl">🎯</div>
        <h1 className="text-2xl font-bold text-white">CAT Sim Complete!</h1>
        <div className="grid grid-cols-3 gap-4">
          {[{label:'Correct',value:results.correct,color:'text-green-400'},{label:'Wrong',value:results.wrong,color:'text-red-400'},{label:'Skipped',value:results.skipped,color:'text-gray-400'}].map(({label,value,color})=>(
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4"><div className={`text-2xl font-bold ${color}`}>{value}</div><div className="text-xs text-gray-400 mt-1">{label}</div></div>
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-400">Accuracy</span><span className="text-white font-bold">{Math.round((results.correct/total)*100)}%</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">CAT Score (raw)</span><span className={`font-bold ${catScore>=25?'text-green-400':catScore>=15?'text-amber-400':'text-red-400'}`}>{catScore.toFixed(2)} / {total}</span></div>
          <p className="text-xs text-gray-500 pt-1">Percentile estimate: {catScore>=30?'99+':catScore>=25?'98-99':catScore>=20?'95-98':catScore>=15?'90-95':'< 90'}ile range</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={startSim} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium"><RotateCcw size={15}/> Try Again</button>
          <Link href="/analytics" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium">Analytics</Link>
        </div>
      </div>
    );
  }

  if (!current) return null;
  const lodBg = {1:'border-green-700/40',2:'border-amber-700/40',3:'border-red-700/40'} as const;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3"><Zap size={16} className="text-indigo-400"/><span className="text-sm font-medium text-white">CAT Sim</span><span className="text-xs text-gray-500">{currentIdx+1}/{questions.length}</span></div>
        <div className={`font-mono font-bold text-lg ${timerWarning?'text-red-400 timer-warning':'text-white'}`}>{mm}:{ss}</div>
        <div className="text-xs text-gray-400"><span className="text-green-400">{results.correct}✓</span> <span className="text-red-400">{results.wrong}✗</span></div>
      </div>
      <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className="bg-indigo-500 h-full rounded-full" style={{width:`${((currentIdx+1)/questions.length)*100}%`}}/></div>
      <div className={`bg-gray-900 border-2 rounded-2xl p-5 space-y-4 ${lodBg[current.lod as keyof typeof lodBg]}`}>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className={`font-bold ${current.lod===3?'text-red-400':'text-amber-400'}`}>LOD {current.lod}</span>
          <span>·</span><span>{current.topic}</span><span>·</span><span>{current.type.toUpperCase()}</span>
        </div>
        <div className="q-text text-gray-200 text-sm leading-relaxed">{current.text}</div>
        {current.type==='mcq' && (
          <div className="space-y-2">
            {optionKeys.map(key => {
              let style='bg-gray-800/60 border-gray-700 hover:border-gray-500 text-gray-200';
              if(isRevealed){if(key===current.answer)style='bg-green-900/50 border-green-500 text-green-200';else if(key===selectedOption)style='bg-red-900/50 border-red-500 text-red-200 opacity-70';else style='bg-gray-800/30 border-gray-800 text-gray-600';}
              else if(selectedOption===key)style='bg-indigo-900/50 border-indigo-500 text-indigo-200';
              return <button key={key} disabled={isRevealed} onClick={()=>!isRevealed&&setSelectedOption(key)} className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition-all ${style}`}><span className="font-semibold mr-2">({key})</span>{current.options[key]}</button>;
            })}
          </div>
        )}
        {current.type==='tita' && <input type="text" value={titaInput} onChange={e=>!isRevealed&&setTitaInput(e.target.value)} disabled={isRevealed} placeholder="Enter your answer..." className="w-full bg-gray-800 border border-gray-600 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none"/>}
        {isRevealed && (
          <div className={`rounded-xl p-4 text-sm ${isCorrect?'bg-green-900/20 border border-green-700/40':'bg-red-900/20 border border-red-700/40'}`}>
            <div className={`flex items-center gap-2 font-semibold mb-1 ${isCorrect?'text-green-400':'text-red-400'}`}>
              {isCorrect?<CheckCircle size={16}/>:<XCircle size={16}/>}{isCorrect?'Correct!':`Wrong — Answer: (${current.answer})`}
            </div>
            {current.solution && <div className="text-gray-300 text-xs leading-relaxed mt-2">{current.solution.slice(0,300)}</div>}
          </div>
        )}
        <div className="flex gap-3">
          {!isRevealed
            ? <button onClick={handleReveal} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium"><Eye size={15}/> Check Answer</button>
            : <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium">Next <ChevronRight size={15}/></button>
          }
          {!isRevealed && <button onClick={handleNext} className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2.5 rounded-xl text-sm">Skip</button>}
        </div>
      </div>
    </div>
  );
}
