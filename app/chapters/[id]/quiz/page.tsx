import { getManifest } from '@/lib/data';
import QuizPageClient from './QuizPageClient';

export function generateStaticParams() {
  return getManifest().chapters.map(c => ({ id: c.id }));
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizPageClient chapterId={id} />;
}
