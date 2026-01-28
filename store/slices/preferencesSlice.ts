// src/store/slices/preferencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// --- Types ---
export interface UserPreferences {
  // Theme preferences
  theme: 'light' | 'dark' | 'system';
  // Language preferences
  language: string; // e.g., 'en', 'ar'
  // Currency preferences
  currency: string; // e.g., 'SAR', 'USD', 'EUR'
  // Measurement units
  units: 'metric' | 'imperial';
  // Notification preferences
  notifications: {
    email: boolean;
    push: boolean;
    sms?: boolean; // Optional, depending on availability
  };
  // Product display preferences
  productView: {
    layout: 'grid' | 'list';
    itemsPerPage: number;
  };
  // Privacy settings
  privacy: {
    showEmailPublicly: boolean;
    allowNotifications: boolean;
    allowMarketing: boolean;
  };
  // Accessibility settings
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'normal' | 'large';
  };
  // Recently viewed products count to keep
  recentlyViewedLimit: number;
  // Default address ID (if managed here)
  defaultAddressId?: number | string;
  // Wishlist visibility (public/private)
  wishlistVisibility: 'public' | 'private';
  // Any other user-specific settings
  [key: string]: any;
}

export interface PreferencesState {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  initialized: boolean; // Whether preferences have been loaded from storage/API
}

// --- Initial State ---
const initialState: PreferencesState = {
  preferences: {
    theme: 'system',
    language: 'en',
    currency: 'SAR',
    units: 'metric',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    productView: {
      layout: 'grid',
      itemsPerPage: 20,
    },
    privacy: {
      showEmailPublicly: false,
      allowNotifications: true,
      allowMarketing: false,
    },
    accessibility: {
      reduceMotion: false,
      highContrast: false,
      fontSize: 'normal',
    },
    recentlyViewedLimit: 20,
    wishlistVisibility: 'private',
  },
  loading: false,
  error: null,
  initialized: false,
};

// --- Slice ---
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    // Initialize preferences from storage or API
    initializePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.initialized = true;
    },

    // Set a single preference
    setPreference: (state, action: PayloadAction<{ key: keyof UserPreferences; value: any }>) => {
      const { key, value } = action.payload;
      (state.preferences as any)[key] = value;
    },

    // Set multiple preferences at once
    setPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Set theme preference
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.preferences.theme = action.payload;
    },

    // Set language preference
    setLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload;
    },

    // Set currency preference
    setCurrency: (state, action: PayloadAction<string>) => {
      state.preferences.currency = action.payload;
    },

    // Set units preference
    setUnits: (state, action: PayloadAction<'metric' | 'imperial'>) => {
      state.preferences.units = action.payload;
    },

    // Update notification preferences
    setNotificationPreferences: (state, action: PayloadAction<Partial<UserPreferences['notifications']>>) => {
      state.preferences.notifications = { ...state.preferences.notifications, ...action.payload };
    },

    // Update product view preferences
    setProductViewPreferences: (state, action: PayloadAction<Partial<UserPreferences['productView']>>) => {
      state.preferences.productView = { ...state.preferences.productView, ...action.payload };
    },

    // Update privacy preferences
    setPrivacyPreferences: (state, action: PayloadAction<Partial<UserPreferences['privacy']>>) => {
      state.preferences.privacy = { ...state.preferences.privacy, ...action.payload };
    },

    // Update accessibility preferences
    setAccessibilityPreferences: (state, action: PayloadAction<Partial<UserPreferences['accessibility']>>) => {
      state.preferences.accessibility = { ...state.preferences.accessibility, ...action.payload };
    },

    // Set recently viewed limit
    setRecentlyViewedLimit: (state, action: PayloadAction<number>) => {
      state.preferences.recentlyViewedLimit = action.payload;
    },

    // Set wishlist visibility
    setWishlistVisibility: (state, action: PayloadAction<'public' | 'private'>) => {
      state.preferences.wishlistVisibility = action.payload;
    },

    // Set default address ID
    setDefaultAddressId: (state, action: PayloadAction<number | string | undefined>) => {
      state.preferences.defaultAddressId = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// --- Actions ---
export const {
  initializePreferences,
  setPreference,
  setPreferences,
  setTheme,
  setLanguage,
  setCurrency,
  setUnits,
  setNotificationPreferences,
  setProductViewPreferences,
  setPrivacyPreferences,
  setAccessibilityPreferences,
  setRecentlyViewedLimit,
  setWishlistVisibility,
  setDefaultAddressId,
  setLoading,
  setError,
} = preferencesSlice.actions;

// --- Selectors ---
export const selectPreferences = (state: RootState) => state.preferences.preferences;
export const selectPreferencesLoading = (state: RootState) => state.preferences.loading;
export const selectPreferencesError = (state: RootState) => state.preferences.error;
export const selectPreferencesInitialized = (state: RootState) => state.preferences.initialized;

// --- Specific Preference Selectors ---
export const selectTheme = (state: RootState) => state.preferences.preferences.theme;
export const selectLanguage = (state: RootState) => state.preferences.preferences.language;
export const selectCurrency = (state: RootState) => state.preferences.preferences.currency;
export const selectUnits = (state: RootState) => state.preferences.preferences.units;
export const selectNotificationPreferences = (state: RootState) => state.preferences.preferences.notifications;
export const selectProductViewPreferences = (state: RootState) => state.preferences.preferences.productView;
export const selectPrivacyPreferences = (state: RootState) => state.preferences.preferences.privacy;
export const selectAccessibilityPreferences = (state: RootState) => state.preferences.preferences.accessibility;
export const selectRecentlyViewedLimit = (state: RootState) => state.preferences.preferences.recentlyViewedLimit;
export const selectWishlistVisibility = (state: RootState) => state.preferences.preferences.wishlistVisibility;
export const selectDefaultAddressId = (state: RootState) => state.preferences.preferences.defaultAddressId;

// --- Reducer ---
export default preferencesSlice.reducer;