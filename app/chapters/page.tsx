import Link from 'next/link';
import { getManifest } from '@/lib/data';

const manifest = getManifest();

const blockColors: Record<string, string> = {
  I: 'border-blue-700/50 bg-blue-950/20',
  II: 'border-purple-700/50 bg-purple-950/20',
  III: 'border-orange-700/50 bg-orange-950/20',
  IV: 'border-teal-700/50 bg-teal-950/20',
};
const blockBadge: Record<string, string> = {
  I: 'bg-blue-900 text-blue-300', II: 'bg-purple-900 text-purple-300',
  III: 'bg-orange-900 text-orange-300', IV: 'bg-teal-900 text-teal-300',
};

export default function ChaptersPage() {
  const blocks = [...new Set(manifest.chapters.map(c => c.block))];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">All Chapters</h1>
      {blocks.map(block => {
        const blockChapters = manifest.chapters.filter(c => c.block === block);
        const blockName = blockChapters[0].blockName;
        return (
          <div key={block}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-2 py-1 rounded ${blockBadge[block]}`}>Block {block}</span>
              <h2 className="text-base font-semibold text-gray-300">{blockName}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {blockChapters.map(ch => (
                <Link key={ch.id} href={`/chapters/${ch.id}`}
                  className={`border rounded-xl p-5 hover:brightness-125 transition-all ${blockColors[block]}`}>
                  <div className="text-xs text-gray-400 mb-1">Chapter {ch.num}</div>
                  <div className="font-semibold text-white mb-3">{ch.title}</div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-green-400">L1: {ch.lodCounts.lod1}</span>
                    <span className="text-amber-400">L2: {ch.lodCounts.lod2}</span>
                    <span className="text-red-400">L3: {ch.lodCounts.lod3}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{ch.questionCount} total questions</div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
