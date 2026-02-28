'use client';

import { useState } from 'react';
import type { Artifact } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FilePreview } from './FilePreview';

interface DownloadPanelProps {
  artifacts: Artifact[];
  onDownloadAll: () => void;
  onDownloadSingle: (artifact: Artifact) => void;
}

export function DownloadPanel({ artifacts, onDownloadAll, onDownloadSingle }: DownloadPanelProps) {
  const [previewArtifact, setPreviewArtifact] = useState<Artifact | null>(null);
  const { t } = useLanguage();

  if (artifacts.length === 0) return null;

  return (
    <>
      <div className="border-t border-gray-800 bg-gray-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">
            {t('download.title')} ({artifacts.length})
          </h3>
          {artifacts.length > 1 && (
            <button
              onClick={onDownloadAll}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('download.zip')}
            </button>
          )}
        </div>
        <ul className="space-y-1.5">
          {artifacts.map((artifact) => (
            <li
              key={artifact.filename}
              className="flex items-center justify-between rounded-lg bg-gray-900 px-3 py-2"
            >
              <button
                onClick={() => setPreviewArtifact(artifact)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-emerald-400"
              >
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-mono">{artifact.filename}</span>
              </button>
              <button
                onClick={() => onDownloadSingle(artifact)}
                className="rounded p-1 text-gray-500 hover:text-emerald-400"
                title={t('download.download')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {previewArtifact && (
        <FilePreview
          artifact={previewArtifact}
          onClose={() => setPreviewArtifact(null)}
          onDownload={onDownloadSingle}
        />
      )}
    </>
  );
}
