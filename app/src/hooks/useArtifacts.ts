'use client';

import { useState, useCallback } from 'react';
import type { Artifact } from '@/types';

export function useArtifacts() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  const addArtifact = useCallback((artifact: Artifact) => {
    setArtifacts(prev => {
      // Replace if same filename exists, otherwise append
      const idx = prev.findIndex(a => a.filename === artifact.filename);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = artifact;
        return next;
      }
      return [...prev, artifact];
    });
  }, []);

  const downloadAll = useCallback(async () => {
    if (artifacts.length === 0) return;

    // Dynamic import jszip only when needed
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const artifact of artifacts) {
      zip.file(artifact.filename, artifact.content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bmad-artifacts.zip';
    a.click();
    URL.revokeObjectURL(url);
  }, [artifacts]);

  const downloadSingle = useCallback((artifact: Artifact) => {
    const blob = new Blob([artifact.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { artifacts, addArtifact, downloadAll, downloadSingle };
}
