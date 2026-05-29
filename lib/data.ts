import { Chapter, Manifest } from './types';

// These imports are used at build time in Next.js
import manifest from '../data/manifest.json';

export function getManifest(): Manifest {
  return manifest as Manifest;
}

export async function getChapter(id: string): Promise<Chapter> {
  const data = await import(`../data/${id}.json`);
  return data.default as Chapter;
}

export function lodLabel(lod: number): string {
  return lod === 1 ? 'LOD 1 — Easy' : lod === 2 ? 'LOD 2 — Medium' : 'LOD 3 — Hard';
}

export function lodColor(lod: number): string {
  return lod === 1 ? 'green' : lod === 2 ? 'amber' : 'red';
}

export function blockColor(block: string): string {
  const colors: Record<string, string> = {
    I: 'blue', II: 'purple', III: 'orange', IV: 'teal', V: 'pink', VI: 'indigo',
  };
  return colors[block] ?? 'gray';
}

export function pct(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
