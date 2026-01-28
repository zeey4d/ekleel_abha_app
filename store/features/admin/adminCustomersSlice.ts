// store/features/admin/adminCustomersSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminCustomer {
    customer_id: number;
    customer_group_id: number;
    customer_group_name?: string;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    fax?: string;
    status: number;
    date_added: string;
    updated_at?: string;
    newsletter?: number;
    safe?: number;
    is_marketer?: number;
    addresses?: AdminCustomerAddress[];
    orders_count?: number;
    total_spent?: number;
}

export interface AdminCustomerAddress {
    address_id: number;
    firstname: string;
    lastname: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country_id: number;
    zone_id: number;
}

export interface AdminCustomersParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
    customer_group_id?: number;
}

export interface CreateCustomerPayload {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    password: string;
    customer_group_id: number;
    status: number;
    fax?: string;
    newsletter?: number;
    store_id?: number;
    language_id?: number;
    custom_field?: string;
    safe?: number;
    status_code?: number;
    from_come?: string;
    is_marketer?: number;
}

export interface UpdateCustomerPayload {
    id: number;
    data: Partial<Omit<CreateCustomerPayload, 'password'>> & { password?: string };
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface BulkUpdateGroupPayload {
    ids: number[];
    customer_group_id: number;
}

export interface AdminCustomersState extends EntityState<AdminCustomer, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminCustomersAdapter = createEntityAdapter<AdminCustomer, number>({
    selectId: (customer) => customer.customer_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminCustomersState = adminCustomersAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminCustomersSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all customers (admin)
        getAdminCustomers: builder.query<AdminCustomersState, AdminCustomersParams>({
            query: (params) => ({
                url: '/admin/customers',
                params,
            }),
            transformResponse: (response: any): AdminCustomersState => {
                const state = adminCustomersAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminCustomer' as const, id })),
                        { type: 'AdminCustomer' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminCustomer' as const, id: 'LIST' }],
        }),

        // Get single customer (admin)
        getAdminCustomer: builder.query<AdminCustomer, number>({
            query: (id) => `/admin/customers/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminCustomer' as const, id }],
        }),

        // Create customer
        createAdminCustomer: builder.mutation<AdminCustomer, CreateCustomerPayload>({
            query: (data) => ({
                url: '/admin/customers',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminCustomer' as const, id: 'LIST' }],
        }),

        // Update customer
        updateAdminCustomer: builder.mutation<AdminCustomer, UpdateCustomerPayload>({
            query: ({ id, data }) => ({
                url: `/admin/customers/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminCustomer' as const, id },
                { type: 'AdminCustomer' as const, id: 'LIST' },
            ],
        }),

        // Delete customer (soft delete)
        deleteAdminCustomer: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/customers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminCustomer' as const, id },
                { type: 'AdminCustomer' as const, id: 'LIST' },
            ],
        }),

        // Force delete customer (permanent)
        forceDeleteAdminCustomer: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/customers/${id}/force`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminCustomer' as const, id },
                { type: 'AdminCustomer' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete customers
        bulkDeleteAdminCustomers: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/customers/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminCustomer' as const, id: 'LIST' }],
        }),

        // Bulk update customer status
        bulkUpdateAdminCustomersStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/customers/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminCustomer' as const, id: 'LIST' }],
        }),

        // Bulk update customer group
        bulkUpdateAdminCustomersGroup: builder.mutation<{ message: string }, BulkUpdateGroupPayload>({
            query: (data) => ({
                url: '/admin/customers/bulk-update-group',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminCustomer' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminCustomersQuery,
    useLazyGetAdminCustomersQuery,
    useGetAdminCustomerQuery,
    useCreateAdminCustomerMutation,
    useUpdateAdminCustomerMutation,
    useDeleteAdminCustomerMutation,
    useForceDeleteAdminCustomerMutation,
    useBulkDeleteAdminCustomersMutation,
    useBulkUpdateAdminCustomersStatusMutation,
    useBulkUpdateAdminCustomersGroupMutation,
} = adminCustomersSlice;

// Selectors
export const {
    selectAll: selectAllAdminCustomers,
    selectById: selectAdminCustomerById,
    selectIds: selectAdminCustomerIds,
} = adminCustomersAdapter.getSelectors<RootState>(
    (state) =>
        adminCustomersSlice.endpoints.getAdminCustomers.select({})(state).data || initialState
);

export default adminCustomersSlice;
