// src/features/wishlist/wishlistSlice.ts
import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';
import { productsSlice } from '../products/productsSlice';

// --- Types ---
export interface WishlistProduct {
  id: string | number;
  name: string;
  model: string;
  image: string | null;
  price: number;
  final_price: number;
  is_on_sale: boolean;
  in_stock: boolean;
  added_at: string;
  [key: string]: any; // Additional product properties
}

export interface WishlistResponse {
  data: WishlistProduct[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AddToWishlistPayload {
  product_id: string | number;
}

export interface WishlistState extends EntityState<WishlistProduct, string | number> {
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  } | null;
}

// --- Entity Adapter for Wishlist Products ---
const wishlistAdapter = createEntityAdapter<WishlistProduct, string | number>({
  selectId: (product: WishlistProduct) => product.id,
});

const initialWishlistState: WishlistState = wishlistAdapter.getInitialState({
  loading: false,
  error: null,
  meta: null,
});

// --- RTK Query API Slice Injection ---
export const wishlistSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get User's Wishlist ---
    getWishlist: builder.query<WishlistState, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 15 } = {}) => `/wishlist?page=${page}&limit=${limit}`,
      transformResponse: (responseData: WishlistResponse): WishlistState => {
        // Normalize the array response and include meta data
        const state = wishlistAdapter.setAll(initialWishlistState, responseData.data);
        return {
          ...state,
          meta: responseData.meta,
        };
      },
      providesTags: (result, error, arg) =>
        result
          ? [...result.ids.map((id) => ({ type: 'Wishlist' as const, id })), { type: 'Wishlist' as const, id: 'LIST' }]
          : [{ type: 'Wishlist' as const, id: 'LIST' }],
    }),

    // --- Add Product to Wishlist ---
    addToWishlist: builder.mutation<WishlistProduct, AddToWishlistPayload>({
      query: ({ product_id }) => ({
        url: '/wishlist',
        method: 'POST',
        body: { product_id },
      }),
      transformResponse: (response: { message: string, data: WishlistProduct }) => response.data,
      // Optimistic update for wishlist
      async onQueryStarted({ product_id }, { dispatch, getState, queryFulfilled }) {
        // 1. Start optimistic update for getWishlist
        const patchResultList = dispatch(
          wishlistSlice.util.updateQueryData('getWishlist', { page: 1, limit: 15 }, (draft: WishlistState) => {
            // Check if product is already in wishlist
            if (!draft.entities[product_id]) {
              // Add placeholder with minimal info
              wishlistAdapter.addOne(draft, {
                id: product_id,
                name: '',
                model: '',
                image: null,
                price: 0,
                final_price: 0,
                is_on_sale: false,
                in_stock: false,
                added_at: new Date().toISOString()
              });
            }
          })
        );

        // 2. Also update the product's wishlist status if it's cached
        const getProductEndpoint = productsSlice.endpoints.getProductById;
        if (getProductEndpoint) {
          const patchResultProduct = dispatch(
            productsSlice.util.updateQueryData('getProductById', product_id, (draft: any) => {
              draft.in_wishlist = true;
            })
          );

          try {
            await queryFulfilled;
          } catch (err: any) {
            // If 409 (Already in wishlist), we technically succeeded in intent (item is in wishlist).
            // We undo the list update to avoid showing incomplete placeholder data, 
            // but we keep the product 'in_wishlist' flag as true (don't undo patchResultProduct).
            // The invalidatesTags will trigger a re-fetch to get correct list data.
            const status = err?.error?.status || err?.status;
            if (status !== 409) {
              patchResultList.undo();
              patchResultProduct?.undo();
              console.error('Failed to add to wishlist:', JSON.stringify(err, null, 2));
            } else {
              // product is already there, remove placeholder if any, but keep product marked as in_wishlist
              patchResultList.undo();
            }
          }
        } else {
          try {
            await queryFulfilled;
          } catch (err: any) {
            const status = err?.error?.status || err?.status;
            if (status !== 409) {
              patchResultList.undo();
              console.error('Failed to add to wishlist (partial):', JSON.stringify(err, null, 2));
            } else {
              patchResultList.undo(); // Undo placeholder, tag invalidation will fetch real data
            }
          }
        }
      },
      invalidatesTags: (result, error, { product_id }) =>
        [{ type: 'Wishlist' as const, id: product_id }, { type: 'Wishlist' as const, id: 'LIST' }],
    }),

    // --- Remove Product from Wishlist ---
    removeFromWishlist: builder.mutation<void, string | number>({
      query: (product_id) => ({
        url: `/wishlist/${product_id}`,
        method: 'DELETE',
      }),
      // Optimistic update for wishlist removal
      async onQueryStarted(product_id, { dispatch, queryFulfilled }) {
        // 1. Start optimistic update for getWishlist
        const patchResultList = dispatch(
          wishlistSlice.util.updateQueryData('getWishlist', { page: 1, limit: 15 }, (draft: WishlistState) => {
            wishlistAdapter.removeOne(draft, product_id);
          })
        );

        // 2. Also update the product's wishlist status if it's cached
        const getProductEndpoint = productsSlice.endpoints.getProductById;
        if (getProductEndpoint) {
          const patchResultProduct = dispatch(
            productsSlice.util.updateQueryData('getProductById', product_id, (draft: any) => {
              draft.in_wishlist = false;
            })
          );

          try {
            await queryFulfilled;
          } catch (err) {
            patchResultList.undo();
            patchResultProduct?.undo();
            console.error('Failed to remove from wishlist:', err);
          }
        } else {
          try {
            await queryFulfilled;
          } catch (err) {
            patchResultList.undo();
            console.error('Failed to remove from wishlist (partial):', err);
          }
        }
      },
      invalidatesTags: (result, error, product_id) =>
        [{ type: 'Wishlist' as const, id: product_id }, { type: 'Wishlist' as const, id: 'LIST' }],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistSlice;

// --- Memoized Selectors ---
// Selector for wishlist products
export const {
  selectAll: selectAllWishlistProducts,
  selectById: selectWishlistProductById,
  selectIds: selectWishlistProductIds,
} = wishlistAdapter.getSelectors<RootState>((state) =>
  wishlistSlice.endpoints.getWishlist.select({})(state).data || initialWishlistState
);


// Selector for wishlist count
export const selectWishlistCount = createSelector(
  [selectAllWishlistProducts],
  (products) => products.length
);

// Selector for checking if product is in wishlist
export const selectIsProductInWishlist = createSelector(
  [selectAllWishlistProducts, (state, productId: string | number) => productId],
  (wishlistProducts, productId) =>
    wishlistProducts.some(product => product.id === productId)
);

// Selector for pagination meta
export const selectWishlistMeta = (state: RootState) =>
  wishlistSlice.endpoints.getWishlist.select({})(state).data?.meta || null;

export default wishlistSlice;