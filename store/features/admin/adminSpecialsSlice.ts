import { createEntityAdapter, createSelector, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminSpecial {
    product_special_id: number;
    product_id: number;
    product_name: string;
    customer_group_id: number;
    priority: number;
    price: string | number;
    date_start: string;
    date_end: string;
}

export interface AdminSpecialsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface AdminSpecialsState extends EntityState<AdminSpecial, number> {
    pagination?: PaginationMeta;
}

export interface CreateSpecialPayload {
    product_id: number;
    customer_group_id: number;
    priority?: number;
    price: number | string;
    date_start?: string;
    date_end?: string;
}

export interface UpdateSpecialPayload {
    id: number;
    data: Partial<CreateSpecialPayload>;
}

export interface ApplyBatchSpecialPayload {
    customer_group_id: number;
    discount_type: 'percentage' | 'fixed_amount_off' | 'fixed_exact_price';
    discount_value: number | string;
    date_start?: string;
    date_end?: string;
    priority?: number;
    overwrite?: boolean;
}

export interface ApplyByBrandPayload extends ApplyBatchSpecialPayload {
    manufacturer_id: number;
}

export interface ApplyByCategoryPayload extends ApplyBatchSpecialPayload {
    category_id: number;
}

// Adapter
const adminSpecialsAdapter = createEntityAdapter<AdminSpecial, number>({
    selectId: (special) => special.product_special_id,
    sortComparer: (a, b) => b.product_special_id - a.product_special_id,
});

const initialState: AdminSpecialsState = adminSpecialsAdapter.getInitialState({
    pagination: undefined,
});

// API Slice
export const adminSpecialsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all specials
        getAdminSpecials: builder.query<AdminSpecialsState, AdminSpecialsParams>({
            query: (params) => ({
                url: '/admin/specials',
                params,
            }),
            transformResponse: (response: any): AdminSpecialsState => {
                const state = adminSpecialsAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: {
                        current_page: response.data.current_page,
                        per_page: response.data.per_page,
                        total: response.data.total,
                        total_pages: response.data.last_page,
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminSpecial' as const, id })),
                        { type: 'AdminSpecial' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminSpecial' as const, id: 'LIST' }],
        }),

        // Get single special
        getAdminSpecial: builder.query<AdminSpecial, number>({
            query: (id) => `/admin/specials/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminSpecial' as const, id }],
        }),

        // Create special
        createAdminSpecial: builder.mutation<{ success: boolean; message: string; data: { product_special_id: number } }, CreateSpecialPayload>({
            query: (data) => ({
                url: '/admin/specials',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminSpecial' as const, id: 'LIST' }],
        }),

        // Update special
        updateAdminSpecial: builder.mutation<{ success: boolean; message: string }, UpdateSpecialPayload>({
            query: ({ id, data }) => ({
                url: `/admin/specials/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminSpecial' as const, id },
                { type: 'AdminSpecial' as const, id: 'LIST' },
            ],
        }),

        // Delete special
        deleteAdminSpecial: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/specials/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminSpecial' as const, id },
                { type: 'AdminSpecial' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete specials
        bulkDeleteAdminSpecials: builder.mutation<{ success: boolean; message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/specials/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminSpecial' as const, id: 'LIST' }],
        }),

        // Apply by brand
        applySpecialsByBrand: builder.mutation<{ success: boolean; message: string }, ApplyByBrandPayload>({
            query: (data) => ({
                url: '/admin/specials/apply-by-brand',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminSpecial' as const, id: 'LIST' }],
        }),

        // Apply by category
        applySpecialsByCategory: builder.mutation<{ success: boolean; message: string }, ApplyByCategoryPayload>({
            query: (data) => ({
                url: '/admin/specials/apply-by-category',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminSpecial' as const, id: 'LIST' }],
        }),
    }),
});

export const {
    useGetAdminSpecialsQuery,
    useGetAdminSpecialQuery,
    useCreateAdminSpecialMutation,
    useUpdateAdminSpecialMutation,
    useDeleteAdminSpecialMutation,
    useBulkDeleteAdminSpecialsMutation,
    useApplySpecialsByBrandMutation,
    useApplySpecialsByCategoryMutation,
} = adminSpecialsSlice;

// Selectors
const selectAdminSpecialsResult = adminSpecialsSlice.endpoints.getAdminSpecials.select({});

const selectAdminSpecialsData = createSelector(
    selectAdminSpecialsResult,
    (specialsResult) => specialsResult.data
);

export const {
    selectAll: selectAllAdminSpecials,
    selectById: selectAdminSpecialById,
    selectIds: selectAdminSpecialIds,
} = adminSpecialsAdapter.getSelectors(
    (state: RootState) => selectAdminSpecialsData(state) ?? initialState
);
