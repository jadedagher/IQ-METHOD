'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
      className="rounded-lg border border-gray-700 px-2.5 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-200"
      aria-label="Switch language"
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
