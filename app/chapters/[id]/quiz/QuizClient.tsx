'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import QuizEngine from '@/components/QuizEngine';
import { Chapter } from '@/lib/types';

function QuizInner({ chapter }: { chapter: Chapter }) {
  const searchParams = useSearchParams();
  const lod = searchParams.get('lod') ?? '1';
  return <QuizEngine chapter={chapter} lodParam={lod} />;
}

export default function QuizClient({ chapter }: { chapter: Chapter }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-gray-400">Loading quiz...</div>}>
      <QuizInner chapter={chapter} />
    </Suspense>
  );
}
