'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress } from '@/lib/store';
import { getManifest } from '@/lib/data';
import { Bookmark, ExternalLink } from 'lucide-react';

const manifest = getManifest();

export default function BookmarksPage() {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  useEffect(() => {
    const p = getProgress();
    setBookmarkIds(p.bookmarks);
  }, []);

  // Parse chapter from question ID: "ch01-lod2-q003"
  const grouped = bookmarkIds.reduce<Record<string, string[]>>((acc, id) => {
    const chId = id.split('-')[0];
    if (!acc[chId]) acc[chId] = [];
    acc[chId].push(id);
    return acc;
  }, {});

  const lodColor = (lod: number) =>
    lod === 1 ? 'text-green-400' : lod === 2 ? 'text-amber-400' : 'text-red-400';

  if (bookmarkIds.length === 0) {
    return (
      <div className="text-center py-20">
        <Bookmark size={36} className="text-gray-600 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">No Bookmarks Yet</h1>
        <p className="text-gray-400 text-sm">Tap the bookmark icon on any question to save it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark size={22} className="text-amber-400" /> Bookmarks
        </h1>
        <span className="text-sm text-gray-400">{bookmarkIds.length} saved</span>
      </div>

      {Object.entries(grouped).map(([chId, ids]) => {
        const chMeta = manifest.chapters.find(c => c.id === chId);
        if (!chMeta) return null;
        return (
          <div key={chId} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <span className="font-semibold text-white text-sm">{chMeta.title}</span>
              <Link href={`/chapters/${chId}`} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
                View chapter <ExternalLink size={11} />
              </Link>
            </div>
            <div className="divide-y divide-gray-800">
              {ids.map(id => {
                // Parse: ch01-lod2-q003
                const parts = id.split('-');
                const lod = parseInt(parts[1].replace('lod', ''));
                const qNum = parseInt(parts[2].replace('q', ''));
                return (
                  <div key={id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${lodColor(lod)}`}>LOD {lod}</span>
                      <span className="text-sm text-gray-300">Question {qNum}</span>
                    </div>
                    <Link href={`/chapters/${chId}/quiz?lod=${lod}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Practise <ExternalLink size={11} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
