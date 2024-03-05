import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './lang/en';
import frTranslations from './lang/fr';
import esTranslations from './lang/es';
import hiTranslations from './lang/hi';
import nlTranslations from './lang/nl';
import zhTranslations from './lang/zh';

const isSBX = process.env.NODE_ENV === 'sbx';

export const namespaces = ['branch', 'error', 'footer', 'general', 'inspect', 'licence', 'navbar', 'onBoarding', 'settings', 'storage', 'sync', 'tokens', 'variables'];

export const resources = {
  en: enTranslations,
  fr: frTranslations,
  es: esTranslations,
  hi: hiTranslations,
  nl: nlTranslations,
  zh: zhTranslations,
};

/**
 * Add languages here
 */
export const languages = [{
  title: 'English',
  code: 'en',
},
{
  title: 'French',
  code: 'fr',
},
{
  title: 'Dutch',
  code: 'nl',
},
{
  title: 'Chinese',
  code: 'zh',
},
{
  title: 'Hindi',
  code: 'hi',
},
{
  title: 'Spanish',
  code: 'es',
}];

export const i18nInstance = i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources,
    defaultNS: 'general',
    ns: namespaces,
    // Only throw error in SBX
    parseMissingKeyHandler: isSBX ? (key) => { throw new Error(`Missing translation for ${key}`); } : undefined,
    lng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false,
    },
  });
