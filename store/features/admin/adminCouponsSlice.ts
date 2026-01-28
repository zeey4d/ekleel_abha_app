// store/features/admin/adminCouponsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminCoupon {
    coupon_id: number;
    name: string;
    code: string;
    type: 'F' | 'P'; // Fixed or Percentage
    discount: number;
    logged: number;
    shipping: number;
    total: number;
    date_start: string;
    date_end: string;
    uses_total: number;
    uses_customer: number;
    status: number;
    date_added: string;
    customer_id?: number;
    cu_percent?: number;
    cu_percent2?: number;
    products?: Array<{ product_id: number; name: string }>;
    categories?: Array<{ category_id: number; name: string }>;
    history?: AdminCouponHistory[];
}

export interface AdminCouponHistory {
    coupon_history_id: number;
    order_id: number;
    customer_id: number;
    amount: number;
    date_added: string;
    firstname?: string;
    lastname?: string;
}

export interface AdminCouponsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
}

export interface CreateCouponPayload {
    name: string;
    code: string;
    type: 'F' | 'P';
    discount: number;
    status: number;
    logged?: number;
    shipping?: number;
    total?: number;
    date_start?: string;
    date_end?: string;
    uses_total?: number;
    uses_customer?: number;
    customer_id?: number;
    cu_percent?: number;
    cu_percent2?: number;
    product_ids?: number[];
    category_ids?: number[];
}

export interface UpdateCouponPayload {
    id: number;
    data: Partial<CreateCouponPayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminCouponsState extends EntityState<AdminCoupon, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminCouponsAdapter = createEntityAdapter<AdminCoupon, number>({
    selectId: (coupon) => coupon.coupon_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminCouponsState = adminCouponsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminCouponsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all coupons (admin)
        getAdminCoupons: builder.query<AdminCouponsState, AdminCouponsParams>({
            query: (params) => ({
                url: '/admin/coupons',
                params,
            }),
            transformResponse: (response: any): AdminCouponsState => {
                const state = adminCouponsAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminCoupon' as const, id })),
                        { type: 'AdminCoupon' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminCoupon' as const, id: 'LIST' }],
        }),

        // Get single coupon (admin)
        getAdminCoupon: builder.query<AdminCoupon, number>({
            query: (id) => `/admin/coupons/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminCoupon' as const, id }],
        }),

        // Create coupon
        createAdminCoupon: builder.mutation<AdminCoupon, CreateCouponPayload>({
            query: (data) => ({
                url: '/admin/coupons',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminCoupon' as const, id: 'LIST' }],
        }),

        // Update coupon
        updateAdminCoupon: builder.mutation<AdminCoupon, UpdateCouponPayload>({
            query: ({ id, data }) => ({
                url: `/admin/coupons/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminCoupon' as const, id },
                { type: 'AdminCoupon' as const, id: 'LIST' },
            ],
        }),

        // Delete coupon
        deleteAdminCoupon: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/coupons/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminCoupon' as const, id },
                { type: 'AdminCoupon' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete coupons
        bulkDeleteAdminCoupons: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/coupons/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminCoupon' as const, id: 'LIST' }],
        }),

        // Bulk update coupon status
        bulkUpdateAdminCouponsStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/coupons/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminCoupon' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminCouponsQuery,
    useGetAdminCouponQuery,
    useCreateAdminCouponMutation,
    useUpdateAdminCouponMutation,
    useDeleteAdminCouponMutation,
    useBulkDeleteAdminCouponsMutation,
    useBulkUpdateAdminCouponsStatusMutation,
} = adminCouponsSlice;

// Selectors
export const {
    selectAll: selectAllAdminCoupons,
    selectById: selectAdminCouponById,
    selectIds: selectAdminCouponIds,
} = adminCouponsAdapter.getSelectors<RootState>(
    (state) =>
        adminCouponsSlice.endpoints.getAdminCoupons.select({})(state).data || initialState
);

export default adminCouponsSlice;
