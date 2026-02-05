import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import translation files - Arabic
import homeAr from '../messages/ar/home.json';
import tabsAr from '../messages/ar/tabs.json';
import brandsAr from '../messages/ar/brands.json';
import brandDetailsAr from '../messages/ar/brand_details.json';
import brandsLetterAr from '../messages/ar/brands_letter.json';
import categoryDetailsAr from '../messages/ar/category_details.json';
import categoriesAr from '../messages/ar/categories.json';
import searchAr from '../messages/ar/search.json';
import accountAr from '../messages/ar/account.json';
import authAr from '../messages/ar/auth.json';
import commonAr from '../messages/ar/common.json';
import bestSellersAr from '../messages/ar/best_sellers.json';
import cartAr from '../messages/ar/cart.json';
import checkoutAr from '../messages/ar/checkout.json';
import dealsAr from '../messages/ar/deals.json';
import errorsAr from '../messages/ar/errors.json';
import infoAr from '../messages/ar/info.json';
import newArrivalsAr from '../messages/ar/new_arrivals.json';
import productDetailsAr from '../messages/ar/product_details.json';
import productsAr from '../messages/ar/products.json';
import productsErrorAr from '../messages/ar/products_error.json';
import sellerApplyAr from '../messages/ar/seller_apply.json';
import sellersAr from '../messages/ar/sellers.json';
import wishlistAr from '../messages/ar/wishlist.json';

// Import translation files - English
import homeEn from '../messages/en/home.json';
import tabsEn from '../messages/en/tabs.json';
import brandsEn from '../messages/en/brands.json';
import brandDetailsEn from '../messages/en/brand_details.json';
import brandsLetterEn from '../messages/en/brands_letter.json';
import categoryDetailsEn from '../messages/en/category_details.json';
import categoriesEn from '../messages/en/categories.json';
import searchEn from '../messages/en/search.json';
import accountEn from '../messages/en/account.json';
import authEn from '../messages/en/auth.json';
import commonEn from '../messages/en/common.json';
import bestSellersEn from '../messages/en/best_sellers.json';
import cartEn from '../messages/en/cart.json';
import checkoutEn from '../messages/en/checkout.json';
import dealsEn from '../messages/en/deals.json';
import errorsEn from '../messages/en/errors.json';
import infoEn from '../messages/en/info.json';
import newArrivalsEn from '../messages/en/new_arrivals.json';
import productDetailsEn from '../messages/en/product_details.json';
import productsEn from '../messages/en/products.json';
import productsErrorEn from '../messages/en/products_error.json';
import sellerApplyEn from '../messages/en/seller_apply.json';
import sellersEn from '../messages/en/sellers.json';
import wishlistEn from '../messages/en/wishlist.json';

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
    best_sellers: bestSellersAr,
    cart: cartAr,
    checkout: checkoutAr,
    deals: dealsAr,
    errors: errorsAr,
    info: infoAr,
    new_arrivals: newArrivalsAr,
    product_details: productDetailsAr,
    products: productsAr,
    products_error: productsErrorAr,
    seller_apply: sellerApplyAr,
    sellers: sellersAr,
    wishlist: wishlistAr,
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
    best_sellers: bestSellersEn,
    cart: cartEn,
    checkout: checkoutEn,
    deals: dealsEn,
    errors: errorsEn,
    info: infoEn,
    new_arrivals: newArrivalsEn,
    product_details: productDetailsEn,
    products: productsEn,
    products_error: productsErrorEn,
    seller_apply: sellerApplyEn,
    sellers: sellersEn,
    wishlist: wishlistEn,
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
