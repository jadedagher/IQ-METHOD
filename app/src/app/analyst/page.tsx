'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function AnalystContent() {
  const params = useSearchParams();
  const sessionId = params.get('session');
  const { t } = useLanguage();

  if (!sessionId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="mb-4 text-gray-400">{t('error.noSession')}</p>
          <a href="/" className="text-emerald-400 underline hover:text-emerald-300">
            {t('error.startNew')}
          </a>
        </div>
      </div>
    );
  }

  return <ChatInterface sessionId={sessionId} workflow="analyst" />;
}

function AnalystFallback() {
  const { t } = useLanguage();
  return (
    <div className="flex h-screen items-center justify-center bg-gray-950">
      <p className="text-gray-500">{t('loading')}</p>
    </div>
  );
}

export default function AnalystPage() {
  return (
    <Suspense fallback={<AnalystFallback />}>
      <AnalystContent />
    </Suspense>
  );
}
