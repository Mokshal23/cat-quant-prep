'use client';
import { useChapter } from '@/lib/useChapter';
import ChapterClient from './ChapterClient';
import Link from 'next/link';

export default function ChapterPageClient({ chapterId }: { chapterId: string }) {
  const { chapter, loading, error } = useChapter(chapterId);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading chapter...</p>
    </div>
  );

  if (error || !chapter) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-red-400">Failed to load chapter data.</p>
      <Link href="/chapters" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to chapters</Link>
    </div>
  );

  return <ChapterClient chapter={chapter} />;
}
