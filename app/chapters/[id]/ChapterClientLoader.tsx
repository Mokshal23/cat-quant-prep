'use client';
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
import ChapterClient from './ChapterClient';

const CHAPTERS: Record<string, any> = {
  ch01, ch02, ch03, ch04, ch05, ch06,
  ch07, ch08, ch09, ch10, ch11,
};

export default function ChapterClientLoader({ chapterId }: { chapterId: string }) {
  const chapter = CHAPTERS[chapterId];
  if (!chapter) return (
    <div className="flex justify-center py-20 text-gray-400">Chapter not found.</div>
  );
  return <ChapterClient chapter={chapter} />;
}
