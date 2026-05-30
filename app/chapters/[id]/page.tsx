import { getManifest } from '@/lib/data';
import ChapterPageClient from './ChapterPageClient';

export function generateStaticParams() {
  return getManifest().chapters.map(c => ({ id: c.id }));
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChapterPageClient chapterId={id} />;
}
