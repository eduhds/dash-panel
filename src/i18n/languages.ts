export interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

export const languages: LanguageOption[] = [
  { code: 'eo', label: 'Esperanto', flag: '🌐' },
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' }
];

export function matchLanguage(language: string): LanguageOption {
  const langCode = language.split('-')[0];
  return languages.find(l => l.code.split('-')[0] === langCode) ?? languages[0];
}
