// src/store/slices/filtersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// --- Types ---
export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterOption {
  id: string | number;
  name: string;
  count?: number; // Number of products matching this filter
}

export interface ActiveFilter {
  type: 'category' | 'brand' | 'price' | 'rating' | 'attribute' | 'in_stock' | 'on_sale';
  value: string | number | boolean | PriceRange;
  label: string;
}

export interface AttributeFilter {
  id: number;
  name: string;
  values: FilterOption[];
}

export interface FilterState {
  // Active filters applied by the user
  activeFilters: ActiveFilter[];

  // Available filter options fetched from the backend or derived
  categories: FilterOption[];
  brands: FilterOption[];
  priceRange: PriceRange;
  availableRatings: number[]; // e.g., [1, 2, 3, 4, 5]
  attributes: AttributeFilter[];
  inStockOnly: boolean;
  onSaleOnly: boolean;

  // UI state for filter components
  expandedSections: string[]; // e.g., ['categories', 'brands', 'price']
  showMobileFilters: boolean;
  sortBy: string; // e.g., 'name-asc', 'price-desc', 'newest'
  appliedSortBy: string; // The sort option that was last applied

  // Search-specific filters (if applicable in this slice)
  searchQuery: string;

  // Loading/error states for filter options (if fetched separately)
  loading: {
    categories: boolean;
    brands: boolean;
    attributes: boolean;
  };
  error: {
    categories: string | null;
    brands: string | null;
    attributes: string | null;
  };
}

// --- Initial State ---
const initialState: FilterState = {
  activeFilters: [],
  categories: [],
  brands: [],
  priceRange: { min: 0, max: 10000 }, // Example default range
  availableRatings: [1, 2, 3, 4, 5],
  attributes: [],
  inStockOnly: false,
  onSaleOnly: false,
  expandedSections: ['categories', 'brands'], // Default expanded sections
  showMobileFilters: false,
  sortBy: 'newest', // Default sort
  appliedSortBy: 'newest',
  searchQuery: '',
  loading: {
    categories: false,
    brands: false,
    attributes: false,
  },
  error: {
    categories: null,
    brands: null,
    attributes: null,
  },
};

// --- Slice ---
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // --- Active Filters Management ---
    addFilter: (state, action: PayloadAction<ActiveFilter>) => {
      const existingIndex = state.activeFilters.findIndex(
        f => f.type === action.payload.type && f.value === action.payload.value
      );
      if (existingIndex === -1) {
        state.activeFilters.push(action.payload);
      }
    },
    removeFilter: (state, action: PayloadAction<{ type: ActiveFilter['type']; value: ActiveFilter['value'] }>) => {
      state.activeFilters = state.activeFilters.filter(
        f => !(f.type === action.payload.type && f.value === action.payload.value)
      );
    },
    clearFilters: (state) => {
      state.activeFilters = [];
      state.inStockOnly = false;
      state.onSaleOnly = false;
      state.sortBy = 'newest';
    },
    clearFiltersByType: (state, action: PayloadAction<ActiveFilter['type']>) => {
      state.activeFilters = state.activeFilters.filter(f => f.type !== action.payload);
      if (action.payload === 'in_stock') state.inStockOnly = false;
      if (action.payload === 'on_sale') state.onSaleOnly = false;
    },

    // --- Filter Options Management (if fetched separately) ---
    setCategories: (state, action: PayloadAction<FilterOption[]>) => {
      state.categories = action.payload;
    },
    setBrands: (state, action: PayloadAction<FilterOption[]>) => {
      state.brands = action.payload;
    },
    setAttributes: (state, action: PayloadAction<AttributeFilter[]>) => {
      state.attributes = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<PriceRange>) => {
      state.priceRange = action.payload;
    },

    // --- UI State Management ---
    toggleSection: (state, action: PayloadAction<string>) => {
      if (state.expandedSections.includes(action.payload)) {
        state.expandedSections = state.expandedSections.filter(section => section !== action.payload);
      } else {
        state.expandedSections.push(action.payload);
      }
    },
    setExpandedSections: (state, action: PayloadAction<string[]>) => {
      state.expandedSections = action.payload;
    },
    setShowMobileFilters: (state, action: PayloadAction<boolean>) => {
      state.showMobileFilters = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    applySortBy: (state) => {
      state.appliedSortBy = state.sortBy;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // --- Specific Filter Toggles ---
    setInStockOnly: (state, action: PayloadAction<boolean>) => {
      state.inStockOnly = action.payload;
      // Add/remove the filter from activeFilters list
      const exists = state.activeFilters.some(f => f.type === 'in_stock');
      if (action.payload && !exists) {
        state.activeFilters.push({ type: 'in_stock', value: true, label: 'In Stock' });
      } else if (!action.payload && exists) {
        state.activeFilters = state.activeFilters.filter(f => f.type !== 'in_stock');
      }
    },
    setOnSaleOnly: (state, action: PayloadAction<boolean>) => {
      state.onSaleOnly = action.payload;
      // Add/remove the filter from activeFilters list
      const exists = state.activeFilters.some(f => f.type === 'on_sale');
      if (action.payload && !exists) {
        state.activeFilters.push({ type: 'on_sale', value: true, label: 'On Sale' });
      } else if (!action.payload && exists) {
        state.activeFilters = state.activeFilters.filter(f => f.type !== 'on_sale');
      }
    },

    // --- Loading and Error State Management ---
    setLoading: (state, action: PayloadAction<{ key: keyof FilterState['loading']; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    setError: (state, action: PayloadAction<{ key: keyof FilterState['error']; error: string | null }>) => {
      state.error[action.payload.key] = action.payload.error;
    },
  },
});

// --- Actions ---
export const {
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
  setLoading,
  setError,
} = filtersSlice.actions;

// --- Selectors ---
export const selectActiveFilters = (state: RootState) => state.filters.activeFilters;
export const selectCategories = (state: RootState) => state.filters.categories;
export const selectBrands = (state: RootState) => state.filters.brands;
export const selectPriceRange = (state: RootState) => state.filters.priceRange;
export const selectAvailableRatings = (state: RootState) => state.filters.availableRatings;
export const selectAttributes = (state: RootState) => state.filters.attributes;
export const selectInStockOnly = (state: RootState) => state.filters.inStockOnly;
export const selectOnSaleOnly = (state: RootState) => state.filters.onSaleOnly;
export const selectExpandedSections = (state: RootState) => state.filters.expandedSections;
export const selectShowMobileFilters = (state: RootState) => state.filters.showMobileFilters;
export const selectSortBy = (state: RootState) => state.filters.sortBy;
export const selectAppliedSortBy = (state: RootState) => state.filters.appliedSortBy;
export const selectSearchQuery = (state: RootState) => state.filters.searchQuery;
export const selectLoadingState = (state: RootState) => state.filters.loading;
export const selectErrorState = (state: RootState) => state.filters.error;

// --- Selector Factories ---
export const selectIsFilterActive = (type: ActiveFilter['type'], value: ActiveFilter['value']) => (state: RootState) =>
  state.filters.activeFilters.some((f: ActiveFilter) => f.type === type && f.value === value);

export const selectFilterLabel = (type: ActiveFilter['type'], value: ActiveFilter['value']) => (state: RootState) => {
  const filter = state.filters.activeFilters.find((f:ActiveFilter) => f.type === type && f.value === value);
  return filter ? filter.label : null;
};

// --- Reducer ---
export default filtersSlice.reducer;