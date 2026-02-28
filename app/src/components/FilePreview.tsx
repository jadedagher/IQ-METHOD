'use client';

import { useState } from 'react';
import type { Artifact } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MarkdownRenderer } from './MarkdownRenderer';

interface FilePreviewProps {
  artifact: Artifact;
  onClose: () => void;
  onDownload: (artifact: Artifact) => void;
}

export function FilePreview({ artifact, onClose, onDownload }: FilePreviewProps) {
  const [showRaw, setShowRaw] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-mono text-sm text-gray-200">{artifact.filename}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            >
              {showRaw ? t('preview.preview') : t('preview.raw')}
            </button>
            <button
              onClick={() => onDownload(artifact)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              {t('preview.download')}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {showRaw ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-950 p-4 font-mono text-sm text-gray-300">
              {artifact.content}
            </pre>
          ) : (
            <div className="prose-invert max-w-none text-gray-300">
              <MarkdownRenderer content={artifact.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
