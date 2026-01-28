// store/features/admin/adminOrdersSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminOrder {
    order_id: number;
    customer_id: number;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    order_status_id: number;
    order_status_name?: string;
    total: number;
    currency_code: string;
    date_added: string;
    date_modified: string;
    payment_method?: string;
    shipping_method?: string;
    payment_address_1?: string;
    payment_address_2?: string;
    payment_city?: string;
    payment_postcode?: string;
    payment_country?: string;
    payment_zone?: string;
    shipping_address_1?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_postcode?: string;
    shipping_country?: string;
    shipping_zone?: string;
    products?: AdminOrderProduct[];
    totals?: AdminOrderTotal[];
    history?: AdminOrderHistory[];
}

export interface AdminOrderProduct {
    order_product_id: number;
    product_id: number;
    name: string;
    model: string;
    quantity: number;
    price: number;
    total: number;
}

export interface AdminOrderTotal {
    order_total_id: number;
    code: string;
    title: string;
    value: number;
    sort_order: number;
}

export interface AdminOrderHistory {
    order_history_id: number;
    order_status_id: number;
    status_name?: string;
    comment: string;
    notify: number;
    date_added: string;
}

export interface AdminOrdersParams {
    page?: number;
    per_page?: number;
    search?: string;
    order_status_id?: number;
    customer_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface UpdateOrderStatusPayload {
    id: number;
    order_status_id: number;
    comment?: string;
    notify?: boolean;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    order_status_id: number;
    comment?: string;
    notify?: boolean;
}

export interface OrderStatisticsParams {
    date_from?: string;
    date_to?: string;
}

export interface OrderStatistics {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: Array<{
        order_status_id: number;
        status_name: string;
        count: number;
    }>;
    period: {
        from: string;
        to: string;
    };
}

export interface AdminOrdersState extends EntityState<AdminOrder, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminOrdersAdapter = createEntityAdapter<AdminOrder, number>({
    selectId: (order) => order.order_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminOrdersState = adminOrdersAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminOrdersSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all orders (admin)
        getAdminOrders: builder.query<AdminOrdersState, AdminOrdersParams>({
            query: (params) => ({
                url: '/admin/orders',
                params,
            }),
            transformResponse: (response: any): AdminOrdersState => {
                const state = adminOrdersAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminOrder' as const, id })),
                        { type: 'AdminOrder' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminOrder' as const, id: 'LIST' }],
        }),

        // Get single order (admin)
        getAdminOrder: builder.query<AdminOrder, number>({
            query: (id) => `/admin/orders/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminOrder' as const, id }],
        }),

        // Update order status
        updateAdminOrderStatus: builder.mutation<AdminOrder, UpdateOrderStatusPayload>({
            query: ({ id, ...data }) => ({
                url: `/admin/orders/${id}/status`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminOrder' as const, id },
                { type: 'AdminOrder' as const, id: 'LIST' },
            ],
        }),

        // Delete order
        deleteAdminOrder: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/orders/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminOrder' as const, id },
                { type: 'AdminOrder' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete orders
        bulkDeleteAdminOrders: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/orders/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminOrder' as const, id: 'LIST' }],
        }),

        // Bulk update order status
        bulkUpdateAdminOrdersStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/orders/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminOrder' as const, id: 'LIST' }],
        }),

        // Get order statistics
        getOrderStatistics: builder.query<OrderStatistics, OrderStatisticsParams>({
            query: (params) => ({
                url: '/admin/orders/statistics',
                params,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminOrder' as const, id: 'STATISTICS' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminOrdersQuery,
    useLazyGetAdminOrdersQuery,
    useGetAdminOrderQuery,
    useUpdateAdminOrderStatusMutation,
    useDeleteAdminOrderMutation,
    useBulkDeleteAdminOrdersMutation,
    useBulkUpdateAdminOrdersStatusMutation,
    useGetOrderStatisticsQuery,
} = adminOrdersSlice;

// Selectors
export const {
    selectAll: selectAllAdminOrders,
    selectById: selectAdminOrderById,
    selectIds: selectAdminOrderIds,
} = adminOrdersAdapter.getSelectors<RootState>(
    (state) =>
        adminOrdersSlice.endpoints.getAdminOrders.select({})(state).data || initialState
);

export default adminOrdersSlice;
