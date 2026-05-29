import { getManifest } from '@/lib/data';
import ChapterClient from './ChapterClient';
import { notFound } from 'next/navigation';

// pre-load all chapter data at build time
async function loadChapter(id: string) {
  const dataMap: Record<string, any> = {
    ch01: (await import('@/data/ch01.json')).default,
    ch02: (await import('@/data/ch02.json')).default,
    ch03: (await import('@/data/ch03.json')).default,
    ch04: (await import('@/data/ch04.json')).default,
    ch05: (await import('@/data/ch05.json')).default,
    ch06: (await import('@/data/ch06.json')).default,
    ch07: (await import('@/data/ch07.json')).default,
    ch08: (await import('@/data/ch08.json')).default,
    ch09: (await import('@/data/ch09.json')).default,
    ch10: (await import('@/data/ch10.json')).default,
    ch11: (await import('@/data/ch11.json')).default,
  };
  return dataMap[id] ?? null;
}

export function generateStaticParams() {
  const manifest = getManifest();
  return manifest.chapters.map(c => ({ id: c.id }));
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = await loadChapter(id);
  if (!chapter) return notFound();
  return <ChapterClient chapter={chapter} />;
}
