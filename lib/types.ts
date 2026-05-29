export interface Question {
  id: string;
  num: number;
  lod: 1 | 2 | 3;
  type: 'mcq' | 'tita';
  text: string;
  options: Record<string, string>;
  answer: string | null;
  solution: string | null;
}

export interface ChapterNotes {
  intro: string;
  concepts: string[];
  formulas: string[];
}

export interface Chapter {
  id: string;
  num: number;
  title: string;
  block: string;
  blockName: string;
  topic: string;
  notes: ChapterNotes;
  questions: Question[];
  questionCount: number;
  lodCounts: { lod1: number; lod2: number; lod3: number };
}

export interface ChapterMeta {
  id: string;
  num: number;
  title: string;
  block: string;
  blockName: string;
  topic: string;
  questionCount: number;
  answeredCount: number;
  solvedCount: number;
  lodCounts: { lod1: number; lod2: number; lod3: number };
}

export interface Manifest {
  totalChapters: number;
  totalQuestions: number;
  chapters: ChapterMeta[];
}

// ── Progress & Analytics ─────────────────────────────────────────────────────
export interface AttemptRecord {
  questionId: string;
  chapterId: string;
  topic: string;
  lod: number;
  type: 'mcq' | 'tita';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // seconds
  timestamp: number;
  bookmarked: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  attempted: number;
  correct: number;
  totalTime: number;
}

export interface UserProgress {
  attempts: AttemptRecord[];
  bookmarks: string[]; // question IDs
  dailyStats: DailyStats[];
  lastSession: {
    chapterId: string;
    lod: number;
    questionIndex: number;
  } | null;
  streakDays: number;
  lastActiveDate: string;
}
