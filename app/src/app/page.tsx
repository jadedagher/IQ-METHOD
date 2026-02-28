'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkflowSelector } from '@/components/WorkflowSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { WorkflowType } from '@/types';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { locale, t } = useLanguage();

  const handleSelect = async (workflow: WorkflowType) => {
    setLoading(true);
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow, locale }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || t('error.sessionCreate'));
        return;
      }

      const { sessionId } = await res.json();
      router.push(`/${workflow}?session=${sessionId}`);
    } catch {
      alert(t('error.sessionCreateRetry'));
    } finally {
      setLoading(false);
    }
  };

  return <WorkflowSelector onSelect={handleSelect} loading={loading} />;
}
