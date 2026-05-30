'use client';
import { useState, useEffect } from 'react';
import { useChapter } from '@/lib/useChapter';
import QuizEngine from '@/components/QuizEngine';
import Link from 'next/link';

export default function QuizPageClient({ chapterId }: { chapterId: string }) {
  const [lod, setLod] = useState<string>('1');
  const [mounted, setMounted] = useState(false);
  const { chapter, loading, error } = useChapter(chapterId);

  useEffect(() => {
    setMounted(true);
    try {
      const params = new URLSearchParams(window.location.search);
      setLod(params.get('lod') ?? '1');
    } catch (e) {
      console.error('Failed to read URL params:', e);
    }
  }, []);

  // Show nothing until mounted (avoids hydration mismatch)
  if (!mounted || loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading questions...</p>
    </div>
  );

  if (error || !chapter) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-red-400 text-sm">
        {error || 'Chapter not found.'}{' '}
        <Link href="/chapters" className="text-indigo-400 underline">Go back</Link>
      </p>
    </div>
  );

  return <QuizEngine chapter={chapter} lodParam={lod} />;
}
