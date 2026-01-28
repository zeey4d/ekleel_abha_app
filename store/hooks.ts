// src/store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export specific hooks for common state access patterns
export const useUIState = () => useAppSelector(state => state.ui);
export const useFiltersState = () => useAppSelector(state => state.filters);
export const useComparisonState = () => useAppSelector(state => state.comparison);
export const useRecentlyViewedState = () => useAppSelector(state => state.recentlyViewed);
export const usePreferencesState = () => useAppSelector(state => state.preferences);

// Export specific hooks for UI state
export const useModalState = () => useAppSelector(state => state.ui.modal);
export const useDrawerState = () => useAppSelector(state => state.ui.drawer);
export const useNotifications = () => useAppSelector(state => state.ui.notifications);
export const useSidebarOpen = () => useAppSelector(state => state.ui.sidebarOpen);
export const useMobileMenuOpen = () => useAppSelector(state => state.ui.mobileMenuOpen);
export const useSearchOpen = () => useAppSelector(state => state.ui.searchOpen);
export const useCartOpen = () => useAppSelector(state => state.ui.cartOpen);
export const useWishlistOpen = () => useAppSelector(state => state.ui.wishlistOpen);
export const useTheme = () => useAppSelector(state => state.ui.theme);
export const useLanguage = () => useAppSelector(state => state.ui.language);
export const useCurrency = () => useAppSelector(state => state.ui.currency);

// Export specific hooks for filters state
export const useActiveFilters = () => useAppSelector(state => state.filters.activeFilters);
export const useFilterCategories = () => useAppSelector(state => state.filters.categories);
export const useFilterBrands = () => useAppSelector(state => state.filters.brands);
export const usePriceRange = () => useAppSelector(state => state.filters.priceRange);
export const useInStockOnly = () => useAppSelector(state => state.filters.inStockOnly);
export const useOnSaleOnly = () => useAppSelector(state => state.filters.onSaleOnly);
export const useSortBy = () => useAppSelector(state => state.filters.sortBy);
export const useSearchQuery = () => useAppSelector(state => state.filters.searchQuery);

// Export specific hooks for comparison state
export const useComparisonItems = () => useAppSelector(state => state.comparison.items);
export const useComparisonCount = () => useAppSelector(state => state.comparison.items.length);
export const useMaxComparisonItems = () => useAppSelector(state => state.comparison.maxItems);
export const useIsComparisonFull = () => useAppSelector(state => state.comparison.items.length >= state.comparison.maxItems);

// Export specific hooks for recently viewed state
export const useRecentlyViewedItems = () => useAppSelector(state => state.recentlyViewed.items);
export const useRecentlyViewedCount = () => useAppSelector(state => state.recentlyViewed.items.length);
export const useRecentlyViewedLimit = () => useAppSelector(state => state.recentlyViewed.limit);

// Export specific hooks for preferences state
export const useUserPreferences = () => useAppSelector(state => state.preferences.preferences);
export const useUserTheme = () => useAppSelector(state => state.preferences.preferences.theme);
export const useUserLanguage = () => useAppSelector(state => state.preferences.preferences.language);
export const useUserCurrency = () => useAppSelector(state => state.preferences.preferences.currency);
export const useUserUnits = () => useAppSelector(state => state.preferences.preferences.units);
export const useNotificationPreferences = () => useAppSelector(state => state.preferences.preferences.notifications);
export const useProductViewPreferences = () => useAppSelector(state => state.preferences.preferences.productView);
export const usePrivacyPreferences = () => useAppSelector(state => state.preferences.preferences.privacy);
export const useAccessibilityPreferences = () => useAppSelector(state => state.preferences.preferences.accessibility);
export const useRecentlyViewedLimitPreference = () => useAppSelector(state => state.preferences.preferences.recentlyViewedLimit);
export const useWishlistVisibility = () => useAppSelector(state => state.preferences.preferences.wishlistVisibility);
export const useDefaultAddressId = () => useAppSelector(state => state.preferences.preferences.defaultAddressId);