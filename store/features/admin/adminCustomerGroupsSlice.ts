import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminCustomerGroup {
    customer_group_id: number;
    name: string;
    description: string;
    approval: number;
    sort_order: number;
    count?: number; // Number of customers in this group
}

export interface AdminCustomerGroupsParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort?: string;
    order?: string;
}

export interface CreateCustomerGroupPayload {
    name: string;
    description: string;
    approval: number;
    sort_order: number;
}

export interface UpdateCustomerGroupPayload {
    id: number;
    data: CreateCustomerGroupPayload;
}

export interface AdminCustomerGroupsState extends EntityState<AdminCustomerGroup, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminCustomerGroupsAdapter = createEntityAdapter<AdminCustomerGroup, number>({
    selectId: (group) => group.customer_group_id,
    sortComparer: (a, b) => a.sort_order - b.sort_order,
});

const initialState: AdminCustomerGroupsState = adminCustomerGroupsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminCustomerGroupsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all customer groups
        getAdminCustomerGroups: builder.query<AdminCustomerGroupsState, AdminCustomerGroupsParams>({
            query: (params) => ({
                url: '/admin/customer-groups',
                params,
            }),
            transformResponse: (response: any): AdminCustomerGroupsState => {
                const state = adminCustomerGroupsAdapter.setAll(initialState, response.data.data || response.data);
                return {
                    ...state,
                    pagination: response.data.meta,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminCustomerGroup' as const, id })),
                        { type: 'AdminCustomerGroup' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminCustomerGroup' as const, id: 'LIST' }],
        }),

        // Get single customer group
        getAdminCustomerGroup: builder.query<AdminCustomerGroup, number>({
            query: (id) => `/admin/customer-groups/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminCustomerGroup' as const, id }],
        }),

        // Create customer group
        createAdminCustomerGroup: builder.mutation<AdminCustomerGroup, CreateCustomerGroupPayload>({
            query: (data) => ({
                url: '/admin/customer-groups',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminCustomerGroup' as const, id: 'LIST' }],
        }),

        // Update customer group
        updateAdminCustomerGroup: builder.mutation<AdminCustomerGroup, UpdateCustomerGroupPayload>({
            query: ({ id, data }) => ({
                url: `/admin/customer-groups/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminCustomerGroup' as const, id },
                { type: 'AdminCustomerGroup' as const, id: 'LIST' },
            ],
        }),

        // Delete customer group
        deleteAdminCustomerGroup: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/customer-groups/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminCustomerGroup' as const, id },
                { type: 'AdminCustomerGroup' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete customer groups
        bulkDeleteAdminCustomerGroups: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/customer-groups/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminCustomerGroup' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminCustomerGroupsQuery,
    useGetAdminCustomerGroupQuery,
    useCreateAdminCustomerGroupMutation,
    useUpdateAdminCustomerGroupMutation,
    useDeleteAdminCustomerGroupMutation,
    useBulkDeleteAdminCustomerGroupsMutation,
} = adminCustomerGroupsSlice;

// Selectors
export const {
    selectAll: selectAllAdminCustomerGroups,
    selectById: selectAdminCustomerGroupById,
    selectIds: selectAdminCustomerGroupIds,
} = adminCustomerGroupsAdapter.getSelectors<RootState>(
    (state) =>
        adminCustomerGroupsSlice.endpoints.getAdminCustomerGroups.select({})(state).data || initialState
);

export default adminCustomerGroupsSlice;
