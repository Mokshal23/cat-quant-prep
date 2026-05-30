import { getManifest } from '@/lib/data';
import ChapterClientLoader from './ChapterClientLoader';

export function generateStaticParams() {
  return getManifest().chapters.map(c => ({ id: c.id }));
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChapterClientLoader chapterId={id} />;
}
