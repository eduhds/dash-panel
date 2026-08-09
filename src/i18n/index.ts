import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from '@/i18n/locales/en.json';
import eo from '@/i18n/locales/eo.json';
import es from '@/i18n/locales/es.json';
import ptBR from '@/i18n/locales/pt-BR.json';
import pt from '@/i18n/locales/pt-BR.json';
import zh from '@/i18n/locales/zh.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      eo: { translation: eo },
      'pt-BR': { translation: ptBR },
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh }
    },
    fallbackLng: 'eo',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
