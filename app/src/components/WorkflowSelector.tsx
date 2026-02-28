'use client';

import type { WorkflowType } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface WorkflowSelectorProps {
  onSelect: (workflow: WorkflowType) => void;
  loading: boolean;
}

export function WorkflowSelector({ onSelect, loading }: WorkflowSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-white">
          {t('landing.title')}
        </h1>
        <p className="text-lg text-gray-400">
          {t('landing.subtitle')}
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        {/* Mary — Analyst */}
        <button
          onClick={() => onSelect('analyst')}
          disabled={loading}
          className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 text-left transition-all hover:border-emerald-600 hover:bg-gray-900/80 disabled:opacity-50"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-2xl transition-colors group-hover:bg-emerald-600/20">
            BA
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">{t('workflow.analyst.title')}</h2>
          <p className="mb-4 text-sm text-gray-400">
            {t('workflow.analyst.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            {(['badge1', 'badge2', 'badge3', 'badge4'] as const).map((b) => (
              <span key={b} className="rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-400">
                {t(`workflow.analyst.${b}`)}
              </span>
            ))}
          </div>
        </button>

        {/* John — PM */}
        <button
          onClick={() => onSelect('pm')}
          disabled={loading}
          className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 text-left transition-all hover:border-emerald-600 hover:bg-gray-900/80 disabled:opacity-50"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-2xl transition-colors group-hover:bg-emerald-600/20">
            PM
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">{t('workflow.pm.title')}</h2>
          <p className="mb-4 text-sm text-gray-400">
            {t('workflow.pm.description')}
          </p>
          <div className="flex flex-wrap gap-2">
            {(['badge1', 'badge2', 'badge3', 'badge4'] as const).map((b) => (
              <span key={b} className="rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-400">
                {t(`workflow.pm.${b}`)}
              </span>
            ))}
          </div>
        </button>
      </div>

      {loading && (
        <div className="mt-8 flex items-center gap-3 text-gray-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {t('landing.creatingSession')}
        </div>
      )}
    </div>
  );
}
