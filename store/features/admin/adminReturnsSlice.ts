// store/features/admin/adminReturnsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminReturn {
    return_id: number;
    order_id: number;
    product_id: number;
    customer_id: number;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    product_name: string;
    model: string;
    quantity: number;
    opened: number;
    return_reason_id: number;
    return_action_id: number;
    return_status_id: number;
    comment?: string;
    date_ordered: string;
    date_added: string;
    date_modified: string;
    return_reason?: string;
    return_action?: string;
    return_status?: string;
}

export interface AdminReturnsParams {
    page?: number;
    per_page?: number;
    search?: string;
    return_status_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface UpdateReturnStatusPayload {
    id: number;
    return_status_id: number;
    comment?: string;
    notify?: boolean;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    return_status_id: number;
    comment?: string;
    notify?: boolean;
}

export interface AdminReturnsState extends EntityState<AdminReturn, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminReturnsAdapter = createEntityAdapter<AdminReturn, number>({
    selectId: (returnItem) => returnItem.return_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminReturnsState = adminReturnsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminReturnsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all returns (admin)
        getAdminReturns: builder.query<AdminReturnsState, AdminReturnsParams>({
            query: (params) => ({
                url: '/admin/returns',
                params,
            }),
            transformResponse: (response: any): AdminReturnsState => {
                const state = adminReturnsAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminReturn' as const, id })),
                        { type: 'AdminReturn' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminReturn' as const, id: 'LIST' }],
        }),

        // Get single return (admin)
        getAdminReturn: builder.query<AdminReturn, number>({
            query: (id) => `/admin/returns/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminReturn' as const, id }],
        }),

        // Update return status
        updateAdminReturnStatus: builder.mutation<AdminReturn, UpdateReturnStatusPayload>({
            query: ({ id, ...data }) => ({
                url: `/admin/returns/${id}/status`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminReturn' as const, id },
                { type: 'AdminReturn' as const, id: 'LIST' },
            ],
        }),

        // Delete return
        deleteAdminReturn: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/returns/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminReturn' as const, id },
                { type: 'AdminReturn' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete returns
        bulkDeleteAdminReturns: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/returns/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminReturn' as const, id: 'LIST' }],
        }),

        // Bulk update return status
        bulkUpdateAdminReturnsStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/returns/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminReturn' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminReturnsQuery,
    useGetAdminReturnQuery,
    useUpdateAdminReturnStatusMutation,
    useDeleteAdminReturnMutation,
    useBulkDeleteAdminReturnsMutation,
    useBulkUpdateAdminReturnsStatusMutation,
} = adminReturnsSlice;

// Selectors
export const {
    selectAll: selectAllAdminReturns,
    selectById: selectAdminReturnById,
    selectIds: selectAdminReturnIds,
} = adminReturnsAdapter.getSelectors<RootState>(
    (state) =>
        adminReturnsSlice.endpoints.getAdminReturns.select({})(state).data || initialState
);

export default adminReturnsSlice;
