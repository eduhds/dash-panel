import { type ReactNode } from 'react';

import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

import en from '@/i18n/locales/en.json';
import eo from '@/i18n/locales/eo.json';
import es from '@/i18n/locales/es.json';
import ptBR from '@/i18n/locales/pt-BR.json';
import zh from '@/i18n/locales/zh.json';

const testI18n = i18n.createInstance();

void testI18n.init({
  resources: {
    eo: { translation: eo },
    'pt-BR': { translation: ptBR },
    pt: { translation: ptBR },
    en: { translation: en },
    es: { translation: es },
    zh: { translation: zh }
  },
  fallbackLng: 'eo',
  lng: 'pt-BR',
  interpolation: { escapeValue: false }
});

export function TestWrapper({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>;
}
