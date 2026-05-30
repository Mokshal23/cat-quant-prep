'use client';
import { useState, useEffect } from 'react';
import { useChapter } from '@/lib/useChapter';
import QuizEngine from '@/components/QuizEngine';
import Link from 'next/link';

// No useSearchParams — reads LOD directly from window.location to avoid
// Next.js 15 Turbopack BAILOUT_TO_CLIENT_SIDE_RENDERING crash
export default function QuizPageClient({ chapterId }: { chapterId: string }) {
  const [lod, setLod] = useState<string>('1');
  const { chapter, loading, error } = useChapter(chapterId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLod(params.get('lod') ?? '1');
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading questions...</p>
    </div>
  );

  if (error || !chapter) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-red-400 text-sm">Failed to load chapter. <Link href="/chapters" className="text-indigo-400 underline">Go back</Link></p>
    </div>
  );

  return <QuizEngine chapter={chapter} lodParam={lod} />;
}
