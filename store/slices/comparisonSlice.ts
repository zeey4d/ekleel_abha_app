// src/store/slices/comparisonSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// --- Types ---
export interface ProductComparisonItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  // Add other product properties you want to compare
  [key: string]: any;
}

export interface ComparisonState {
  items: ProductComparisonItem[];
  maxItems: number; // e.g., 4 for a 4-way comparison
  loading: boolean;
  error: string | null;
}

// --- Initial State ---
const initialState: ComparisonState = {
  items: [],
  maxItems: 4,
  loading: false,
  error: null,
};

// --- Slice ---
const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    // Add a product to comparison
    addToComparison: (state, action: PayloadAction<ProductComparisonItem>) => {
      const existingItem: ProductComparisonItem | undefined = state.items.find((item: ProductComparisonItem) => item.id === action.payload.id);
      if (!existingItem) {
        if (state.items.length < state.maxItems) {
          state.items.push(action.payload);
        } else {
          // Optionally, show an error or replace the last item
          // For now, we'll ignore if max is reached
          console.warn(`Comparison list is full (max ${state.maxItems}). Cannot add more items.`);
        }
      }
    },

    // Remove a product from comparison
    removeFromComparison: (state, action: PayloadAction<number | string>) => {
      state.items = state.items.filter((item: ProductComparisonItem) => item.id !== action.payload);
    },

    // Clear all items from comparison
    clearComparison: (state) => {
      state.items = [];
    },

    // Set comparison items (e.g., from local storage on app load)
    setComparisonItems: (state, action: PayloadAction<ProductComparisonItem[]>) => {
      state.items = action.payload.slice(0, state.maxItems); // Ensure we don't exceed max
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
  addToComparison,
  removeFromComparison,
  clearComparison,
  setComparisonItems,
  setLoading,
  setError,
} = comparisonSlice.actions;

// --- Selectors ---
export const selectComparisonItems = (state: RootState) => state.comparison.items;
export const selectComparisonCount = (state: RootState) => state.comparison.items.length;
export const selectMaxComparisonItems = (state: RootState) => state.comparison.maxItems;
export const selectComparisonLoading = (state: RootState) => state.comparison.loading;
export const selectComparisonError = (state: RootState) => state.comparison.error;

// --- Memoized Selectors ---
// Check if a specific product is in the comparison list
export const selectIsProductInComparison = (productId: number | string) => createSelector(
  [selectComparisonItems],
  (items: ProductComparisonItem[]) => items.some((item: ProductComparisonItem) => item.id === productId)
);

// Get comparison properties for comparison table
export const selectComparisonProperties = createSelector(
  [selectComparisonItems],
  (items: ProductComparisonItem[]) => {
    if (items.length === 0) return { properties: [], data: [] };

    // Get all unique property keys from the items (excluding id, name, price, image if needed)
    const allKeys: Set<string> = new Set<string>();
    items.forEach((item: ProductComparisonItem) => {
      Object.keys(item).forEach((key: string) => {
        if (key !== 'id' && key !== 'name' && key !== 'price' && key !== 'image') {
          allKeys.add(key);
        }
      });
    });

    const properties: string[] = Array.from(allKeys);

    // Prepare data for the comparison table
    const data: Record<string, any>[] = items.map((item: ProductComparisonItem) => {
      const itemData: Record<string, any> = { id: item.id, name: item.name, price: item.price, image: item.image };
      properties.forEach((prop: string) => {
        itemData[prop] = item[prop];
      });
      return itemData;
    });

    return { properties, data };
  }
);

// Check if comparison list is full
export const selectIsComparisonFull = createSelector(
  [selectComparisonCount, selectMaxComparisonItems],
  (count: number, max: number) => count >= max
);

// --- Reducer ---
export default comparisonSlice.reducer;