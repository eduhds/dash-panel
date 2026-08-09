import { describe, expect, it } from 'vitest';

import { languages, matchLanguage } from '@/i18n/languages';

describe('languages', () => {
  it('has all 5 languages defined', () => {
    expect(languages).toHaveLength(5);
    const codes = languages.map(l => l.code);
    expect(codes).toContain('eo');
    expect(codes).toContain('pt-BR');
    expect(codes).toContain('en');
    expect(codes).toContain('es');
    expect(codes).toContain('zh');
  });

  it('each language has code, label, and flag', () => {
    for (const lang of languages) {
      expect(lang.code).toBeTruthy();
      expect(lang.label).toBeTruthy();
      expect(lang.flag).toBeTruthy();
    }
  });
});

describe('matchLanguage', () => {
  it('returns Esperanto for exact eo code', () => {
    const result = matchLanguage('eo');
    expect(result.code).toBe('eo');
    expect(result.label).toBe('Esperanto');
  });

  it('returns pt-BR for exact pt-BR code', () => {
    const result = matchLanguage('pt-BR');
    expect(result.code).toBe('pt-BR');
  });

  it('returns pt-BR for generic pt code', () => {
    const result = matchLanguage('pt');
    expect(result.code).toBe('pt-BR');
  });

  it('returns English for exact en code', () => {
    const result = matchLanguage('en');
    expect(result.code).toBe('en');
  });

  it('returns English for en-US code', () => {
    const result = matchLanguage('en-US');
    expect(result.code).toBe('en');
  });

  it('returns English for en-GB code', () => {
    const result = matchLanguage('en-GB');
    expect(result.code).toBe('en');
  });

  it('returns Spanish for es code', () => {
    const result = matchLanguage('es');
    expect(result.code).toBe('es');
  });

  it('returns Chinese for zh code', () => {
    const result = matchLanguage('zh');
    expect(result.code).toBe('zh');
  });

  it('returns Chinese for zh-CN code', () => {
    const result = matchLanguage('zh-CN');
    expect(result.code).toBe('zh');
  });

  it('falls back to Esperanto for unknown language code', () => {
    const result = matchLanguage('fr');
    expect(result.code).toBe('eo');
  });

  it('falls back to Esperanto for empty string', () => {
    const result = matchLanguage('');
    expect(result.code).toBe('eo');
  });
});
