// src/features/settings/settingsSlice.ts
import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

// --- Types ---
export interface Language {
  id: number;
  name: string;
  code: string;
  locale: string;
  image: string;
  is_default: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  decimal_place: number;
  value: number;
}

export interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  url: string;
  logo: string;
  icon: string;
}

export interface SocialMedia {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  working_hours: string;
  social_media: SocialMedia;
}

export interface FeatureFlags {
  guest_checkout: boolean;
  wishlist_enabled: boolean;
  reviews_enabled: boolean;
  coupons_enabled: boolean;
}

export interface SiteSettings {
  store: StoreSettings;
  currency: Currency;
  languages: Language[];
  contact: ContactSettings;
  features: FeatureFlags;
  updated_at: string;
}

export interface GeoZone {
  id: number;
  name: string;
  description: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost?: number;
  tax_class_id?: number;
  geo_zone_id?: number;
  minimum_order?: number;
  status: boolean;
}

export interface ShippingSettings {
  methods: ShippingMethod[];
  geo_zones: GeoZone[];
  default_method: string;
  handling_fee: number;
  tax_included: boolean;
  updated_at: string;
}

export interface Policy {
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  updated_at: string;
}

export interface PageContent {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

export interface Pages {
  about: PageContent;
  contact: PageContent;
  privacy: PageContent;
  terms: PageContent;
  return: PageContent;
}

// --- RTK Query API Slice Injection ---
export const settingsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get General Site Settings ---
    getSiteSettings: builder.query<SiteSettings, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
      keepUnusedDataFor: 86400, // Keep for 24 hours as settings rarely change
    }),
    
    // --- Get Shipping Methods ---
    getShippingMethods: builder.query<ShippingSettings, void>({
      query: () => '/settings/shipping',
      providesTags: ['Shipping'],
      keepUnusedDataFor: 3600, // Keep for 1 hour
    }),
    
    // --- Get Return Policy ---
    getReturnPolicy: builder.query<Policy, void>({
      query: () => '/settings/return-policy',
      providesTags: ['Policy'],
      keepUnusedDataFor: 86400,
    }),
    
    // --- Get Privacy Policy ---
    getPrivacyPolicy: builder.query<Policy, void>({
      query: () => '/settings/privacy',
      providesTags: ['Policy'],
      keepUnusedDataFor: 86400,
    }),
    
    // --- Get Static Pages ---
    getPages: builder.query<Pages, void>({
      query: () => '/settings/pages',
      providesTags: ['Page'],
      keepUnusedDataFor: 86400,
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetSiteSettingsQuery,
  useGetShippingMethodsQuery,
  useGetReturnPolicyQuery,
  useGetPrivacyPolicyQuery,
  useGetPagesQuery,
} = settingsSlice;

// --- Memoized Selectors ---
// Selector for site settings
export const selectSiteSettings = createSelector(
  [settingsSlice.endpoints.getSiteSettings.select()],
  (result) => result.data || {} as SiteSettings
);

// Selector for shipping methods
export const selectShippingMethods = createSelector(
  [settingsSlice.endpoints.getShippingMethods.select()],
  (result) => result.data?.methods || []
);

// Selector for return policy
export const selectReturnPolicy = createSelector(
  [settingsSlice.endpoints.getReturnPolicy.select()],
  (result) => result.data || {} as Policy
);

// Selector for privacy policy
export const selectPrivacyPolicy = createSelector(
  [settingsSlice.endpoints.getPrivacyPolicy.select()],
  (result) => result.data || {} as Policy
);

// Selector for static pages
export const selectPages = createSelector(
  [settingsSlice.endpoints.getPages.select()],
  (result) => result.data || {} as Pages
);

// Selector for site name
export const selectSiteName = createSelector(
  [selectSiteSettings],
  (settings) => settings.store?.name || 'My Store'
);

// Selector for site logo
export const selectSiteLogo = createSelector(
  [selectSiteSettings],
  (settings) => settings.store?.logo || ''
);

// Selector for available languages
export const selectAvailableLanguages = createSelector(
  [selectSiteSettings],
  (settings) => settings.languages || []
);

// Selector for default language
export const selectDefaultLanguage = createSelector(
  [selectAvailableLanguages],
  (languages) => languages.find(lang => lang.is_default) || null
);

// Selector for current currency
export const selectCurrency = createSelector(
  [selectSiteSettings],
  (settings) => settings.currency || {} as Currency
);

// Selector for currency symbol
export const selectCurrencySymbol = createSelector(
  [selectCurrency],
  (currency) => currency.symbol || 'ر.س'
);

// Selector for contact info
export const selectContactInfo = createSelector(
  [selectSiteSettings],
  (settings) => settings.contact || {} as ContactSettings
);

// Selector for feature flags
export const selectFeatureFlags = createSelector(
  [selectSiteSettings],
  (settings) => settings.features || {} as FeatureFlags
);

// Selector for wishlist enabled status
export const selectWishlistEnabled = createSelector(
  [selectFeatureFlags],
  (features) => features.wishlist_enabled || true
);

// Selector for guest checkout enabled status
export const selectGuestCheckoutEnabled = createSelector(
  [selectFeatureFlags],
  (features) => features.guest_checkout || true
);

export default settingsSlice;