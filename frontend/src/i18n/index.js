import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Existing NER core languages
import en from '../locales/en/translation.json';
import kha from '../locales/kha/translation.json';
import as_lang from '../locales/as/translation.json';

// Extended NER regional languages
import hi from '../locales/hi/translation.json';
import bn from '../locales/bn/translation.json';
import lus from '../locales/lus/translation.json';
import mni from '../locales/mni/translation.json';
import brx from '../locales/brx/translation.json';
import nag from '../locales/nag/translation.json';
import grt from '../locales/grt/translation.json';

const savedLanguage = localStorage.getItem('ner_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en:  { translation: en },
      kha: { translation: kha },
      as:  { translation: as_lang },
      hi:  { translation: hi },
      bn:  { translation: bn },
      lus: { translation: lus },
      mni: { translation: mni },
      brx: { translation: brx },
      nag: { translation: nag },
      grt: { translation: grt },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('ner_lang', lng);
});

export default i18n;

// Language registry — displayed in the UI selector
export const SUPPORTED_LANGUAGES = [
  { code: 'en',  nativeName: 'English',       regionLabel: 'All NER States',    script: 'Latin'   },
  { code: 'hi',  nativeName: 'हिन्दी',          regionLabel: 'Hindi Belt / NER',  script: 'Devanagari' },
  { code: 'as',  nativeName: 'অসমীয়া',         regionLabel: 'Assam',             script: 'Bengali' },
  { code: 'bn',  nativeName: 'বাংলা',           regionLabel: 'Tripura / Bengal',  script: 'Bengali' },
  { code: 'kha', nativeName: 'Ka Ktien Khasi', regionLabel: 'Meghalaya (Khasi)', script: 'Latin'   },
  { code: 'grt', nativeName: 'Garo Birika',    regionLabel: 'Meghalaya (Garo)',  script: 'Latin'   },
  { code: 'lus', nativeName: 'Mizo ṭawng',     regionLabel: 'Mizoram',           script: 'Latin'   },
  { code: 'mni', nativeName: 'মৈতৈলোন্',        regionLabel: 'Manipur',           script: 'Bengali' },
  { code: 'brx', nativeName: 'बड़ो',            regionLabel: 'Assam (Bodoland)',  script: 'Devanagari' },
  { code: 'nag', nativeName: 'Nagamese',       regionLabel: 'Nagaland',          script: 'Latin'   },
];
