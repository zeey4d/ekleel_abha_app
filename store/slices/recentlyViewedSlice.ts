// src/store/slices/recentlyViewedSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// --- Types ---
export interface RecentlyViewedProduct {
  id: number | string;
  name: string;
  price: number;
  final_price: number;
  image: string | null;
  thumb_image?: string | null; // Optional thumbnail
  date_viewed: string; // ISO string timestamp
  name_ar?: string;
  name_en?: string;
  // Add other relevant product properties you want to store
  [key: string]: any;
}

export interface RecentlyViewedState {
  items: RecentlyViewedProduct[];
  limit: number; // Maximum number of items to keep
  loading: boolean;
  error: string | null;
}

// --- Initial State ---
const initialState: RecentlyViewedState = {
  items: [],
  limit: 20, // Default limit
  loading: false,
  error: null,
};

// --- Slice ---
const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    // Add a product to recently viewed
    addRecentlyViewed: (state, action: PayloadAction<Omit<RecentlyViewedProduct, 'date_viewed'>>) => {
      const existingIndex: number = state.items.findIndex((item: RecentlyViewedProduct) => item.id === action.payload.id);

      const now: string = new Date().toISOString();
      const newItem: RecentlyViewedProduct = {
        id: action.payload.id,
        name: action.payload.name,
        price: action.payload.price,
        final_price: action.payload.final_price,
        image: action.payload.image,
        date_viewed: now,
        // Add other properties if they exist in action.payload
        ...(action.payload as any),
      };

      if (existingIndex !== -1) {
        // Move existing item to the front with updated timestamp
        state.items.splice(existingIndex, 1);
        state.items.unshift(newItem);
      } else {
        // Add new item to the front
        state.items.unshift(newItem);
      }

      // Enforce the limit
      if (state.items.length > state.limit) {
        state.items = state.items.slice(0, state.limit);
      }
    },

    // Remove a product from recently viewed
    removeRecentlyViewed: (state, action: PayloadAction<number | string>) => {
      state.items = state.items.filter((item: RecentlyViewedProduct) => item.id !== action.payload);
    },

    // Clear all recently viewed items
    clearRecentlyViewed: (state) => {
      state.items = [];
    },

    // Set the limit for number of items to keep
    setRecentlyViewedLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      // Enforce the new limit
      if (state.items.length > state.limit) {
        state.items = state.items.slice(0, state.limit);
      }
    },

    // Set recently viewed items (e.g., from local storage on app load)
    setRecentlyViewedItems: (state, action: PayloadAction<RecentlyViewedProduct[]>) => {
      state.items = action.payload.slice(0, state.limit); // Ensure we don't exceed the limit
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
  addRecentlyViewed,
  removeRecentlyViewed,
  clearRecentlyViewed,
  setRecentlyViewedLimit,
  setRecentlyViewedItems,
  setLoading,
  setError,
} = recentlyViewedSlice.actions;

// --- Selectors ---
export const selectRecentlyViewedItems = (state: RootState) => state.recentlyViewed.items;
export const selectRecentlyViewedCount = (state: RootState) => state.recentlyViewed.items.length;
export const selectRecentlyViewedLimit = (state: RootState) => state.recentlyViewed.limit;
export const selectRecentlyViewedLoading = (state: RootState) => state.recentlyViewed.loading;
export const selectRecentlyViewedError = (state: RootState) => state.recentlyViewed.error;

// --- Memoized Selectors ---
// Check if a specific product is in the recently viewed list
export const selectIsProductRecentlyViewed = (productId: number | string) => createSelector(
  [selectRecentlyViewedItems],
  (items: RecentlyViewedProduct[]) => items.some((item: RecentlyViewedProduct) => item.id === productId)
);

// Get the most recently viewed products up to a specified number
export const selectMostRecentViewed = (count: number) => createSelector(
  [selectRecentlyViewedItems],
  (items: RecentlyViewedProduct[]) => items.slice(0, count)
);

// Get recently viewed products sorted by date (most recent first) - this is already the internal order
export const selectRecentlyViewedSorted = createSelector(
  [selectRecentlyViewedItems],
  (items: RecentlyViewedProduct[]) => [...items].sort((a: RecentlyViewedProduct, b: RecentlyViewedProduct) =>
    new Date(b.date_viewed).getTime() - new Date(a.date_viewed).getTime()
  )
);

// Check if the recently viewed list is at its limit
export const selectIsRecentlyViewedListFull = createSelector(
  [selectRecentlyViewedCount, selectRecentlyViewedLimit],
  (count: number, limit: number) => count >= limit
);

// --- Reducer ---
export default recentlyViewedSlice.reducer;