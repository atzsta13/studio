'use client';

import { useInsider } from '@/components/layout/insider-provider';
import { useCallback, useState, useEffect } from 'react';

export function useTranslation() {
  const { config } = useInsider();
  const defaultLocale = config.i18n?.defaultLocale || 'en';
  const locales = config.i18n?.locales || ['en'];
  const [locale, setLocale] = useState<string>(defaultLocale);

  useEffect(() => {
    // Try to detect browser language, otherwise use default
    const browserLang = navigator.language.split('-')[0];
    if (locales.includes(browserLang)) {
      setLocale(browserLang);
    }
  }, [locales]);

  const t = useCallback((key: string): string => {
    if (!config.i18n) return key;
    const translations = config.i18n.translations[locale] || config.i18n.translations[defaultLocale] || {};
    return translations[key] || key;
  }, [config, locale, defaultLocale]);

  return { t, locale, setLocale, locales };
}
