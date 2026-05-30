'use client';
import { useState, useEffect } from 'react';
import { Chapter } from './types';

export function useChapter(chapterId: string) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    setError(null);
    fetch(`/data/${chapterId}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load ${chapterId}`);
        return r.json();
      })
      .then((data: Chapter) => {
        setChapter(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [chapterId]);

  return { chapter, loading, error };
}
