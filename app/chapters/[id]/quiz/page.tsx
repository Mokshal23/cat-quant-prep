import { getManifest } from '@/lib/data';
import QuizClientLoader from './QuizClientLoader';

export function generateStaticParams() {
  return getManifest().chapters.map(c => ({ id: c.id }));
}

// Thin server shell — just passes the id to the client loader
export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizClientLoader chapterId={id} />;
}
