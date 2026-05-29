import { getManifest } from '@/lib/data';
import QuizClient from './QuizClient';
import { notFound } from 'next/navigation';

const dataMap: Record<string, () => Promise<any>> = {
  ch01: () => import('@/data/ch01.json').then(m => m.default),
  ch02: () => import('@/data/ch02.json').then(m => m.default),
  ch03: () => import('@/data/ch03.json').then(m => m.default),
  ch04: () => import('@/data/ch04.json').then(m => m.default),
  ch05: () => import('@/data/ch05.json').then(m => m.default),
  ch06: () => import('@/data/ch06.json').then(m => m.default),
  ch07: () => import('@/data/ch07.json').then(m => m.default),
  ch08: () => import('@/data/ch08.json').then(m => m.default),
  ch09: () => import('@/data/ch09.json').then(m => m.default),
  ch10: () => import('@/data/ch10.json').then(m => m.default),
  ch11: () => import('@/data/ch11.json').then(m => m.default),
};

export function generateStaticParams() {
  return getManifest().chapters.map(c => ({ id: c.id }));
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loader = dataMap[id];
  if (!loader) return notFound();
  const chapter = await loader();
  return <QuizClient chapter={chapter} />;
}
