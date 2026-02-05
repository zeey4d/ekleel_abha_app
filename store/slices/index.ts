// src/store/slices/index.ts
import { combineReducers } from '@reduxjs/toolkit';
import uiSlice, { UIState } from './uiSlice';
import filtersSlice, { FilterState } from './filtersSlice';
import comparisonSlice, { ComparisonState } from './comparisonSlice';
import recentlyViewedSlice, { RecentlyViewedState } from './recentlyViewedSlice';
import preferencesSlice, { PreferencesState } from './preferencesSlice';
import searchUiSlice from '../features/search/searchUiSlice';

// Combine all slice reducers
// Combine all slice reducers
export const sliceReducers = {
  ui: uiSlice,
  filters: filtersSlice,
  comparison: comparisonSlice,
  recentlyViewed: recentlyViewedSlice,
  preferences: preferencesSlice,
  searchUi: searchUiSlice,
};

export const slicesReducer = combineReducers(sliceReducers);

// Export individual state types
export type {
  UIState,
  FilterState,
  ComparisonState,
  RecentlyViewedState,
  PreferencesState,
};

// Export combined state type
export type SlicesState = {
  ui: UIState;
  filters: FilterState;
  comparison: ComparisonState;
  recentlyViewed: RecentlyViewedState;
  preferences: PreferencesState;
};

// Export actions from all slices
export {
  // UI Actions
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  setLoading as setUILoading,
  setBulkLoading as setBulkUILoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setSidebarOpen,
  setMobileMenuOpen,
  setSearchOpen,
  setCartOpen,
  setWishlistOpen,
  setTheme as setUITheme,
  setLanguage as setUILanguage,
  setCurrency as setUICurrency,
} from './uiSlice';

export {
  // Filter Actions
  addFilter,
  removeFilter,
  clearFilters,
  clearFiltersByType,
  setCategories,
  setBrands,
  setAttributes,
  setPriceRange,
  toggleSection,
  setExpandedSections,
  setShowMobileFilters,
  setSortBy,
  applySortBy,
  setSearchQuery,
  setInStockOnly,
  setOnSaleOnly,
  setLoading as setFiltersLoading,
  setError as setFiltersError,
} from './filtersSlice';

export {
  // Comparison Actions
  addToComparison,
  removeFromComparison,
  clearComparison,
  setComparisonItems,
  setLoading as setComparisonLoading,
  setError as setComparisonError,
} from './comparisonSlice';

export {
  // Recently Viewed Actions
  addRecentlyViewed,
  removeRecentlyViewed,
  clearRecentlyViewed,
  setRecentlyViewedLimit,
  setRecentlyViewedItems,
  setLoading as setRecentlyViewedLoading,
  setError as setRecentlyViewedError,
} from './recentlyViewedSlice';

export {
  // Preferences Actions
  initializePreferences,
  setPreference,
  setPreferences,
  setTheme as setPreferencesTheme,
  setLanguage as setPreferencesLanguage,
  setCurrency as setPreferencesCurrency,
  setUnits,
  setNotificationPreferences,
  setProductViewPreferences,
  setPrivacyPreferences,
  setAccessibilityPreferences,
  setRecentlyViewedLimit as setPreferencesRecentlyViewedLimit,
  setWishlistVisibility,
  setDefaultAddressId,
  setLoading as setPreferencesLoading,
  setError as setPreferencesError,
} from './preferencesSlice';

// Export selectors from all slices
export {
  // UI Selectors
  selectModal,
  selectDrawer,
  selectLoading as selectUILoading,
  selectNotifications,
  selectSidebarOpen,
  selectMobileMenuOpen,
  selectSearchOpen,
  selectCartOpen,
  selectWishlistOpen,
  selectTheme as selectUITheme,
  selectLanguage as selectUILanguage,
  selectCurrency as selectUICurrency,
  selectIsLoading as selectUIIsLoading,
  selectNotificationById,
} from './uiSlice';

export {
  // Filter Selectors
  selectActiveFilters,
  selectCategories,
  selectBrands,
  selectPriceRange,
  selectAvailableRatings,
  selectAttributes,
  selectInStockOnly,
  selectOnSaleOnly,
  selectExpandedSections,
  selectShowMobileFilters,
  selectSortBy,
  selectAppliedSortBy,
  selectSearchQuery,
  selectLoadingState as selectFiltersLoadingState,
  selectErrorState as selectFiltersErrorState,
  selectIsFilterActive,
  selectFilterLabel,
} from './filtersSlice';

export {
  // Comparison Selectors
  selectComparisonItems,
  selectComparisonCount,
  selectMaxComparisonItems,
  selectComparisonLoading,
  selectComparisonError,
  selectIsProductInComparison,
  selectComparisonProperties,
  selectIsComparisonFull,
} from './comparisonSlice';

export {
  // Recently Viewed Selectors
  selectRecentlyViewedItems,
  selectRecentlyViewedCount,
  selectRecentlyViewedLimit,
  selectRecentlyViewedLoading,
  selectRecentlyViewedError,
  selectIsProductRecentlyViewed,
  selectMostRecentViewed,
  selectRecentlyViewedSorted,
  selectIsRecentlyViewedListFull,
} from './recentlyViewedSlice';

export {
  // Preferences Selectors
  selectPreferences,
  selectPreferencesLoading,
  selectPreferencesError,
  selectPreferencesInitialized,
  selectTheme as selectPreferencesTheme,
  selectLanguage as selectPreferencesLanguage,
  selectCurrency as selectPreferencesCurrency,
  selectUnits as selectPreferencesUnits,
  selectNotificationPreferences,
  selectProductViewPreferences,
  selectPrivacyPreferences,
  selectAccessibilityPreferences,
  selectRecentlyViewedLimit as selectPreferencesRecentlyViewedLimit,
  selectWishlistVisibility,
  selectDefaultAddressId,
} from './preferencesSlice';