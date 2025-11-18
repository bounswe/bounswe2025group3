// Mock for react-i18next
// This mock returns translation keys as values for testing
// In real usage, these would be translated strings

import enTranslations from '../i18n/locales/en-US/translations.json';

// Helper function to get nested translation value
const getTranslation = (key: string): string => {
  const keys = key.split('.');
  let value: any = enTranslations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
};

export const useTranslation = () => {
  return {
    t: (key: string, options?: any) => {
      const translation = getTranslation(key);
      // Handle interpolation if needed
      if (options && typeof translation === 'string') {
        return Object.keys(options).reduce((str, optKey) => {
          return str.replace(new RegExp(`{{${optKey}}}`, 'g'), options[optKey]);
        }, translation);
      }
      return translation;
    },
    i18n: {
      language: 'en-US',
      changeLanguage: jest.fn(),
    },
    ready: true,
  };
};

export default {
  useTranslation,
};

