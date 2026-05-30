'use client';
import { useSearchParams, notFound } from 'next/navigation';
import { Suspense } from 'react';
import QuizEngine from '@/components/QuizEngine';

// Static imports — bundled at build time, no server→client serialization
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

const CHAPTERS: Record<string, any> = {
  ch01, ch02, ch03, ch04, ch05, ch06,
  ch07, ch08, ch09, ch10, ch11,
};

function QuizInner({ chapterId }: { chapterId: string }) {
  const searchParams = useSearchParams();
  const lod = searchParams.get('lod') ?? '1';
  const chapter = CHAPTERS[chapterId];
  if (!chapter) return (
    <div className="flex justify-center py-20 text-gray-400">Chapter not found.</div>
  );
  return <QuizEngine chapter={chapter} lodParam={lod} />;
}

export default function QuizClientLoader({ chapterId }: { chapterId: string }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20 text-gray-400">Loading quiz...</div>
    }>
      <QuizInner chapterId={chapterId} />
    </Suspense>
  );
}
