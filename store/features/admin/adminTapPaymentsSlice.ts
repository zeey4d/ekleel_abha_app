import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types derived from AdminPaymentTapController and TapPayment model usage
export interface AdminTapPayment {
    id: number;
    order_id: number;
    charge_id?: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'refunded' | 'pending' | string;
    response_code?: string;
    response_message?: string;
    payment_method?: string;
    card_brand?: string;
    card_last_four?: string;
    raw_response?: any;
    created_at: string;
    updated_at: string;
    order?: {
        order_id: number;
        firstname: string;
        lastname: string;
        email: string;
        total: number;
        date_added: string;
    };
}

export interface AdminTapPaymentsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    order_id?: number;
}

export interface AdminTapPaymentsState extends EntityState<AdminTapPayment, number> {
    loading: boolean;
    error: string | null;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

// Entity Adapter
const adminTapPaymentsAdapter = createEntityAdapter<AdminTapPayment, number>({
    selectId: (payment) => payment.id,
    sortComparer: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
});

const initialState: AdminTapPaymentsState = adminTapPaymentsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminTapPaymentsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all payments (paginated with filters)
        getAdminTapPayments: builder.query<AdminTapPaymentsState, AdminTapPaymentsParams>({
            query: (params) => ({
                url: '/admin/tap/payments',
                params,
            }),
            transformResponse: (response: any): AdminTapPaymentsState => {
                const payments = response.data || [];
                const state = adminTapPaymentsAdapter.setAll(initialState, payments);
                return {
                    ...state,
                    pagination: {
                        current_page: response.current_page,
                        last_page: response.last_page,
                        per_page: response.per_page,
                        total: response.total,
                        from: response.from,
                        to: response.to
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminPayment' as const, id })),
                        { type: 'AdminPayment' as const, id: 'LIST_TAP' },
                    ]
                    : [{ type: 'AdminPayment' as const, id: 'LIST_TAP' }],
        }),

        // Get single payment details
        getAdminTapPayment: builder.query<AdminTapPayment, number>({
            query: (id) => `/admin/tap/payments/${id}`,
            providesTags: (result, error, id) => [{ type: 'AdminPayment' as const, id }],
        }),

        // Sync payment status manually
        syncTapPaymentStatus: builder.mutation<AdminTapPayment, number>({
            query: (id) => ({
                url: `/admin/tap/payments/${id}/sync`,
                method: 'POST',
            }),
            transformResponse: (response: { data: AdminTapPayment }) => response.data,
            invalidatesTags: (result, error, id) => [
                { type: 'AdminPayment' as const, id },
                { type: 'AdminPayment' as const, id: 'LIST_TAP' },
            ],
        }),

        // Refund Payment
        refundTapPayment: builder.mutation<any, { order_id: number; charge_id: string; amount: number; reason?: string }>({
            query: ({ order_id, charge_id, amount, reason }) => ({
                url: `/admin/tap/payments/${order_id}/refund`,
                method: 'POST',
                body: { charge_id, amount, reason },
            }),
            invalidatesTags: (result, error, { order_id }) => [
                { type: 'AdminPayment' as const, id: 'LIST_TAP' },
                { type: 'AdminPayment' as const, id: `ORDER_TAP_${order_id}` }, // Assuming consistency with other slices if used
                { type: 'AdminOrder' as const, id: order_id },
            ],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminTapPaymentsQuery,
    useLazyGetAdminTapPaymentsQuery,
    useGetAdminTapPaymentQuery,
    useSyncTapPaymentStatusMutation,
    useRefundTapPaymentMutation,
} = adminTapPaymentsSlice;

// Selectors
export const {
    selectAll: selectAllTapPayments,
    selectById: selectTapPaymentById,
    selectIds: selectTapPaymentIds,
} = adminTapPaymentsAdapter.getSelectors<RootState>(
    (state) =>
        adminTapPaymentsSlice.endpoints.getAdminTapPayments.select({})(state).data || initialState
);

export default adminTapPaymentsSlice;
