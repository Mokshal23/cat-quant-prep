'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useChapter } from '@/lib/useChapter';
import QuizEngine from '@/components/QuizEngine';
import Link from 'next/link';

function QuizLoader({ chapterId }: { chapterId: string }) {
  const searchParams = useSearchParams();
  const lod = searchParams.get('lod') ?? '1';
  const { chapter, loading, error } = useChapter(chapterId);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading questions...</p>
    </div>
  );

  if (error || !chapter) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-red-400">Failed to load chapter data.</p>
      <Link href="/chapters" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to chapters</Link>
    </div>
  );

  return <QuizEngine chapter={chapter} lodParam={lod} />;
}

export default function QuizPageClient({ chapterId }: { chapterId: string }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading quiz...</p>
      </div>
    }>
      <QuizLoader chapterId={chapterId} />
    </Suspense>
  );
}
