import {
  createSelector,
  createEntityAdapter,
  EntityState,
} from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import type { RootState } from "@/store/store";

import {
  Brand,
  GetBrandsParams,
  GetFeaturedBrandsParams,
  GetBrandsByLetterParams,
  BrandsResponse,
  BrandDetailResponse,
  ExtendedBrandsState,
  FeaturedBrandsResponse

} from "@/store/types";



// ===============================
// Entity Adapter
// ===============================
const brandsAdapter = createEntityAdapter<Brand, number>({
  selectId: (brand) => brand.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialBrandsState: ExtendedBrandsState = brandsAdapter.getInitialState({
  loading: false,
  error: null,
});

// ===============================
// RTK Query Endpoints
// ===============================
export const brandsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get All Brands ---
    getBrands: builder.query<ExtendedBrandsState, GetBrandsParams>({
      query: ({ page = 1, limit = 15, sort = 'name' }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sort', sort);
        return `/brands?${params.toString()}`;
      },
      transformResponse: (responseData: BrandsResponse) => {
        const state = brandsAdapter.setAll(initialBrandsState, responseData.data);
        return {
          ...state,
          meta: responseData.meta
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.ids.map((id) => ({ type: "Brand" as const, id })),
              { type: "Brand" as const, id: "LIST" },
            ]
          : [{ type: "Brand" as const, id: "LIST" }],
      // 🕐 Long-lived: Brands rarely change
      keepUnusedDataFor: 3600,
      // Support Infinite Scroll
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, ...rest } = queryArgs;
        return rest; // Group by all args except 'page'
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // Reset cache if page 1
          brandsAdapter.setAll(currentCache, newItems.ids.map((id) => newItems.entities[id]!));
        } else {
          // Append new items
          brandsAdapter.addMany(currentCache, newItems.ids.map((id) => newItems.entities[id]!));
        }
        // Update meta
        currentCache.meta = newItems.meta;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    // --- Get Brand by ID ---
    getBrandById: builder.query<BrandDetailResponse['data'], number>({
      query: (id) => `/brands/${id}`,
      transformResponse: (responseData: BrandDetailResponse) => {
        return responseData.data;
      },
      providesTags: (result, error, id) => [{ type: "Brand" as const, id }],
      keepUnusedDataFor: 3600,
    }),

    // --- Get Featured Brands ---
    getFeaturedBrands: builder.query<Brand[], GetFeaturedBrandsParams>({
      query: ({ limit = 8 }) => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        return `/brands/featured?${params.toString()}`;
      },
      transformResponse: (responseData: FeaturedBrandsResponse) => {
        return responseData.data;
      },
      providesTags: [{ type: "Brand" as const, id: "FEATURED" }],
      keepUnusedDataFor: 3600,
    }),

    // --- Get Brands by Letter ---
    getBrandsByLetter: builder.query<ExtendedBrandsState, GetBrandsByLetterParams>({
      query: ({ letter, page = 1, limit = 15, sort = 'name' }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sort', sort);
        return `/brands/letter/${letter}?${params.toString()}`;
      },
      transformResponse: (responseData: BrandsResponse) => {
        const state = brandsAdapter.setAll(initialBrandsState, responseData.data);
        return {
          ...state,
          meta: responseData.meta
        };
      },
      providesTags: (result, error, { letter }) => [
        { type: "Brand" as const, id: `LETTER-${letter}` },
      ],
    }),
  }),
});

// ===============================
// Export Hooks
// ===============================
export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useGetFeaturedBrandsQuery,
  useGetBrandsByLetterQuery,
} = brandsSlice;

// ===============================
// Memoized Selectors
// ===============================
const selectBrandsResult = (params: GetBrandsParams) => 
  brandsSlice.endpoints.getBrands.select(params);

export const {
  selectAll: selectAllBrands,
  selectById: selectBrandById,
  selectIds: selectBrandIds,
} = brandsAdapter.getSelectors<RootState>(
  (state, params: GetBrandsParams = {}) => 
    selectBrandsResult(params)(state).data || initialBrandsState
);

// --- Selector: Brands Meta Data ---
export const selectBrandsMeta = (params: GetBrandsParams = {}) => 
  createSelector(
    [selectBrandsResult(params)],
    (result) => result.data?.meta || null
  );

// --- Selector: Featured Brands ---
export const selectFeaturedBrands = createSelector(
  (state: RootState) =>
    brandsSlice.endpoints.getFeaturedBrands.select({})(state).data,
  (featured) => featured || []
);

// --- Selector: Brands by Letter ---
export const selectBrandsByLetter = (letter: string, params: { page?: number; limit?: number; sort?: 'name' | 'popularity' } = {}) =>
  createSelector(
    (state: RootState) =>
      brandsSlice.endpoints.getBrandsByLetter.select({ letter, ...params })(state).data,
    (brandsState) =>
      brandsState ? brandsAdapter.getSelectors().selectAll(brandsState) : []
  );

export default brandsSlice;