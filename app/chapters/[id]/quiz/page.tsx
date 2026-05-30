import QuizPageClient from './QuizPageClient';

// Dynamic rendering — avoids SSG + useSearchParams conflicts
export const dynamic = 'force-dynamic';

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuizPageClient chapterId={id} />;
}
