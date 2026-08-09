import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import eo from './locales/eo.json';
import es from './locales/es.json';
import ptBR from './locales/pt-BR.json';
import pt from './locales/pt-BR.json';
import zh from './locales/zh.json';

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
