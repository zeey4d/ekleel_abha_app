// src/features/sellers/sellersSlice.ts
import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';
import { productsSlice } from '../products/productsSlice';

// --- Types ---
export interface Seller {
  id: string | number;
  name: string;
  phone: string;
  phone2?: string;
  address: string;
  facebook_link?: string;
  telegram_link?: string;
  twitter_link?: string;
  tiktok_link?: string;
  instagram_link?: string;
  snap_link?: string;
  comment?: string;
  status: 'active' | 'pending';
  total_products: number;
  created_at: string;
  updated_at?: string;
  [key: string]: any; // Additional seller properties
}

export interface GetSellersParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'pending' | 'all';
}

export interface GetSellerProductsParams {
  id: string | number;
  page?: number;
  limit?: number;
}

export interface ApplyToBecomeSellerPayload {
  name: string;
  phone: string;
  address?: string;
  facebook_link?: string;
  instagram_link?: string;
  comment?: string;
  phone2?: string;
  telegram_link?: string;
  twitter_link?: string;
  tiktok_link?: string;
  snap_link?: string;
}

export interface SellerState extends EntityState<Seller, string | number> {
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}

export interface SellersResponse {
  data: Seller[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SellerProductsResponse {
  seller: {
    id: string | number;
    name: string;
  };
  products: {
    data: any[]; // Product data
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// --- Entity Adapter for Sellers ---
const sellersAdapter = createEntityAdapter<Seller, string | number>({
  selectId: (seller: Seller) => seller.id,
  sortComparer: (a: Seller, b: Seller) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
});

const initialSellersState: SellerState = sellersAdapter.getInitialState({
  loading: false,
  error: null,
  meta: null,
});

// --- RTK Query API Slice Injection ---
export const sellersSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get All Sellers ---
    getSellers: builder.query<SellerState, GetSellersParams>({
      query: ({ page = 1, limit = 20, status = 'active' }) => ({
        url: '/sellers',
        params: { page, limit, status }
      }),
      transformResponse: (responseData: SellersResponse): SellerState => {
        // Normalize the array response
        const state = sellersAdapter.setAll(initialSellersState, responseData.data);
        return {
          ...state,
          meta: responseData.meta,
        };
      },
      providesTags: (result, error, arg) => 
        result 
          ? [...result.ids.map((id) => ({ type: 'Seller' as const, id })), { type: 'Seller' as const, id: 'LIST' }] 
          : [{ type: 'Seller' as const, id: 'LIST' }],
      keepUnusedDataFor: 3600, // Keep for 1 hour
    }),
    
    // --- Get Seller by ID ---
    getSellerById: builder.query<Seller, string | number>({
      query: (id) => `/sellers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Seller' as const, id }],
      keepUnusedDataFor: 3600,
    }),
    
    // --- Get Seller Products ---
    getSellerProducts: builder.query<SellerProductsResponse, GetSellerProductsParams>({
      query: ({ id, page = 1, limit = 20 }) => ({
        url: `/sellers/${id}/products`,
        params: { page, limit }
      }),
      providesTags: (result, error, { id }) => 
        [{ type: 'Seller' as const, id: `products-${id}` }, { type: 'Product' as const, id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // --- Apply to Become Seller ---
    applyToBecomeSeller: builder.mutation<any, ApplyToBecomeSellerPayload>({
      query: (applicationData) => ({
        url: '/sellers/apply',
        method: 'POST',
        body: applicationData,
      }),
      // Optimistic update isn't really applicable here as it's a one-time action
      invalidatesTags: ['Seller'],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetSellersQuery,
  useGetSellerByIdQuery,
  useGetSellerProductsQuery,
  useApplyToBecomeSellerMutation,
} = sellersSlice;

// --- Memoized Selectors ---
// Selector for sellers
export const {
  selectAll: selectAllSellers,
  selectById: selectSellerById,
  selectIds: selectSellerIds,
} = sellersAdapter.getSelectors<RootState>((state) => 
  sellersSlice.endpoints.getSellers.select({})(state).data || initialSellersState
);

// Selector for active sellers
export const selectActiveSellers = createSelector(
  [selectAllSellers],
  (sellers) => sellers.filter(seller => seller.status === 'active')
);

// Selector for pending sellers
export const selectPendingSellers = createSelector(
  [selectAllSellers],
  (sellers) => sellers.filter(seller => seller.status === 'pending')
);

// Selector for seller count
export const selectSellersCount = createSelector(
  [selectAllSellers],
  (sellers) => sellers.length
);

// Selector for sellers pagination meta
export const selectSellersMeta = (state: RootState) => 
  sellersSlice.endpoints.getSellers.select({})(state).data?.meta || null;

export default sellersSlice;