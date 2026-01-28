// src/features/cart/cartSlice.ts
import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

import {
  CartItemOption,
  CartItem,
  CartSummary,
  CartResponse,
  CartState,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
  MergeGuestCartPayload,
  AddGuestCartItemPayload,
  GetGuestCartParams
} from '@/store/types';

// --- Entity Adapter for Cart Items ---
const cartItemsAdapter = createEntityAdapter<CartItem, number>({
  selectId: (item: CartItem) => item.id,
});

const initialCartState: CartState = cartItemsAdapter.getInitialState({
  loading: false,
  error: null,
  summary: null,
});

// --- RTK Query API Slice Injection ---
export const cartSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get Current Cart ---
    getCart: builder.query<CartState, void>({
      query: () => '/cart',
      transformResponse: (response: CartResponse): CartState => {
        const { items, summary } = response.data;
        const state = cartItemsAdapter.setAll(initialCartState, items);

        // Map backend fields to frontend expected fields
        const mappedSummary: CartSummary = {
          ...summary,
          total: summary.grand_total || summary.total || 0,
          item_count: summary.total_items || summary.item_count || 0
        };

        return {
          ...state,
          summary: mappedSummary
        };
      },
      providesTags: (result, error, arg) =>
        result
          ? [...result.ids.map((id) => ({ type: 'Cart' as const, id })), { type: 'Cart' as const, id: 'CURRENT' }]
          : [{ type: 'Cart' as const, id: 'CURRENT' }],
      keepUnusedDataFor: 60,
    }),

    // --- Guest Cart Endpoints ---
    getGuestCart: builder.query<CartState, GetGuestCartParams>({
      query: (params) => ({
        url: '/cart/guest',
        params: { session_id: params.session_id },
      }),
      transformResponse: (response: CartResponse): CartState => {
        const { items, summary } = response.data;
        const state = cartItemsAdapter.setAll(initialCartState, items);

        // Map backend fields to frontend expected fields
        const mappedSummary: CartSummary = {
          ...summary,
          total: summary.grand_total || summary.total || 0,
          item_count: summary.total_items || summary.item_count || 0
        };

        return {
          ...state,
          summary: mappedSummary
        };
      },
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({ type: 'Cart' as const, id })), { type: 'Cart' as const, id: 'GUEST' }]
          : [{ type: 'Cart' as const, id: 'GUEST' }],
    }),

    addGuestItem: builder.mutation<CartResponse, AddGuestCartItemPayload>({
      query: (body) => ({
        url: '/cart/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Cart' as const, id: 'GUEST' }],
    }),

    mergeGuestCart: builder.mutation<CartResponse, MergeGuestCartPayload>({
      query: (body) => ({
        url: '/cart/merge',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Cart', id: 'CURRENT' }, { type: 'Cart', id: 'GUEST' }],
    }),

    // --- Add Item to Cart ---
    addToCart: builder.mutation<CartResponse, AddToCartPayload>({
      query: (cartItem) => ({
        url: '/cart/add',
        method: 'POST',
        body: cartItem,
      }),
      invalidatesTags: [{ type: 'Cart' as const, id: 'CURRENT' }],
    }),

    // --- Update Cart Item Quantity ---
    updateCartItem: builder.mutation<CartResponse, UpdateCartItemPayload>({
      query: ({ id, quantity }) => ({
        url: `/cart/items/${id}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Cart' as const, id },
        { type: 'Cart' as const, id: 'CURRENT' }
      ],
    }),

    // --- Remove Item from Cart ---
    removeFromCart: builder.mutation<CartResponse, RemoveFromCartPayload>({
      query: ({ id }) => ({
        url: `/cart/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Cart' as const, id },
        { type: 'Cart' as const, id: 'CURRENT' }
      ],
    }),

    // --- Clear Entire Cart ---
    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Cart' as const, id: 'CURRENT' }],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetGuestCartQuery,
  useAddGuestItemMutation,
  useMergeGuestCartMutation,
} = cartSlice;

// --- Memoized Selectors ---
// Selector for cart items
export const {
  selectAll: selectAllCartItems,
  selectById: selectCartItemById,
  selectIds: selectCartItemIds,
} = cartItemsAdapter.getSelectors<RootState>((state) =>
  cartSlice.endpoints.getCart.select()(state).data || initialCartState
);

// Selector for cart summary
export const selectCartSummary = createSelector(
  [cartSlice.endpoints.getCart.select()],
  (result) => result.data?.summary || null
);

// Selector for cart loading state
export const selectCartLoading = createSelector(
  [cartSlice.endpoints.getCart.select()],
  (result) => result.isLoading
);

// Selector for cart error
export const selectCartError = createSelector(
  [cartSlice.endpoints.getCart.select()],
  (result) => result.error
);

// Selector for total items in cart
export const selectTotalCartItems = createSelector(
  [selectAllCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0)
);

// Selector for cart total price
export const selectCartTotal = createSelector(
  [selectCartSummary],
  (summary) => summary?.total || 0
);

export default cartSlice;