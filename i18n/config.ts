import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import translation files
import homeAr from '../messages/ar/home.json';
import homeEn from '../messages/en/home.json';
import tabsAr from '../messages/ar/tabs.json';
import tabsEn from '../messages/en/tabs.json';
import brandsAr from '../messages/ar/brands.json';
import brandsEn from '../messages/en/brands.json';
import brandDetailsAr from '../messages/ar/brand_details.json';
import brandDetailsEn from '../messages/en/brand_details.json';
import brandsLetterAr from '../messages/ar/brands_letter.json';
import brandsLetterEn from '../messages/en/brands_letter.json';
import categoryDetailsAr from '../messages/ar/category_details.json';
import categoryDetailsEn from '../messages/en/category_details.json';
import categoriesAr from '../messages/ar/categories.json';
import categoriesEn from '../messages/en/categories.json';
import searchAr from '../messages/ar/search.json';
import searchEn from '../messages/en/search.json';
import accountAr from '../messages/ar/account.json';
import accountEn from '../messages/en/account.json';
import authAr from '../messages/ar/auth.json';
import authEn from '../messages/en/auth.json';
import commonAr from '../messages/ar/common.json';
import commonEn from '../messages/en/common.json';

const resources = {
  ar: {
    home: homeAr,
    tabs: tabsAr,
    brands: brandsAr,
    brand_details: brandDetailsAr,
    brands_letter: brandsLetterAr,
    category_details: categoryDetailsAr,
    categories: categoriesAr,
    search: searchAr,
    account: accountAr,
    auth: authAr,
    common: commonAr,
  },
  en: {
    home: homeEn,
    tabs: tabsEn,
    brands: brandsEn,
    brand_details: brandDetailsEn,
    brands_letter: brandsLetterEn,
    category_details: categoryDetailsEn,
    categories: categoriesEn,
    search: searchEn,
    account: accountEn,
    auth: authEn,
    common: commonEn,
  },
};

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa'];

// Ensure RTL is allowed at startup
I18nManager.allowRTL(true);

// Get initial language based on I18nManager (which persists across restarts)
// This ensures that if we forceRTL(true) and restart, we start with 'ar' (or another RTL lang)
// preventing a mismatch between layout and language.
const isRTL = I18nManager.isRTL;
const initialLanguage = isRTL ? 'ar' : 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: initialLanguage, // Initialize with what matches the current layout direction
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'home',
    react: {
      useSuspense: false,
    }
  });

export default i18n;
export { RTL_LANGUAGES };
