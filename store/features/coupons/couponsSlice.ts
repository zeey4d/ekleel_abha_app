// src/features/coupons/couponsSlice.ts
import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

import {
  CouponValidation,
  Promotion,
  ValidateCouponParams,
  GetActivePromotionsParams,
  PaginatedResponse,
} from '@/store/types';

// --- RTK Query API Slice Injection ---
export const couponsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Validate Coupon Code ---
    validateCoupon: builder.query<CouponValidation, ValidateCouponParams>({
      query: ({ code, subtotal, customer_id }) => {
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('subtotal', subtotal.toString());
        if (customer_id) {
          params.append('customer_id', customer_id.toString());
        }
        return `/coupons/validate?${params.toString()}`;
      },
      providesTags: (result, error, { code }) => [{ type: 'Coupon', id: code }],
      keepUnusedDataFor: 300, // Keep for 5 minutes
    }),
    
    // --- Get Active Promotions ---
    getActivePromotions: builder.query<PaginatedResponse<Promotion>, GetActivePromotionsParams>({
      query: ({ page = 1, limit = 10, category }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (category) {
          params.append('category', category.toString());
        }
        return `/coupons/promotions?${params.toString()}`;
      },
      providesTags: (result, error, arg) => 
        result 
          ? [...result.data.map(promo => ({ type: "Promotion" as const, id: promo.id })), { type: "Promotion" as const, id: 'LIST' }] 
          : [{ type: "Promotion" as const, id: 'LIST' }],
      keepUnusedDataFor: 3600, // Keep for 1 hour
    }),
  }),
});

// Export auto-generated hooks
export const {
  useValidateCouponQuery,
  useGetActivePromotionsQuery,
} = couponsSlice;

// --- Memoized Selectors ---
// Selector for coupon validation result
export const selectCouponValidation = createSelector(
  [(state: RootState, params: ValidateCouponParams) => couponsSlice.endpoints.validateCoupon.select(params)(state)],
  (result) => result.data || null
);

// Selector for active promotions
export const selectActivePromotions = createSelector(
  [(state: RootState, params: GetActivePromotionsParams) => couponsSlice.endpoints.getActivePromotions.select(params)(state)],
  (result) => result.data?.data || []
);

// Selector for promotions pagination
export const selectPromotionsPagination = (state: RootState, params: GetActivePromotionsParams) => {
  const result = couponsSlice.endpoints.getActivePromotions.select(params)(state);
  return result.data?.meta || null;
};

// Selector for available promotions
export const selectAvailablePromotions = createSelector(
  [selectActivePromotions, (state, subtotal: number) => subtotal],
  (promotions, subtotal) => 
    promotions.filter(promo => 
      // In Laravel controller, minimum amount is checked against subtotal
      // We don't have this field in the response, so we assume all are valid for now
      // If we had minimum amount field in the response, we would filter like this:
      // !promo.minimum_amount || (subtotal >= promo.minimum_amount)
      true
    )
);

export default couponsSlice;