// store/features/admin/adminPaytabsPaymentsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types derived from PaymentPaytabsController and PaytabsPayment model usage
export interface AdminPaytabsPayment {
    id: number; // Assuming standard ID column exists in DB model
    order_id: number;
    cart_id?: string; // PayTabs refers to order_id as cart_id often
    tran_ref: string;
    tran_type: string; // e.g. 'sale'
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending';
    resp_code?: string;
    resp_message?: string;
    payment_method?: string;
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

export interface PaytabsPaymentStats {
    total_revenue: number;
    total_transactions: number;
    successful_payments: number;
    failed_payments: number;
}

export interface AdminPaytabsPaymentsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    order_id?: number;
    tran_ref?: string;
}

export interface AdminPaytabsPaymentsState extends EntityState<AdminPaytabsPayment, number> {
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
const adminPaytabsPaymentsAdapter = createEntityAdapter<AdminPaytabsPayment, number>({
    selectId: (payment) => payment.id,
    sortComparer: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
});

const initialState: AdminPaytabsPaymentsState = adminPaytabsPaymentsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminPaytabsPaymentsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all payments (paginated with filters)
        getAdminPaytabsPayments: builder.query<AdminPaytabsPaymentsState, AdminPaytabsPaymentsParams>({
            query: (params) => ({
                url: '/admin/paytabs/payments',
                params,
            }),
            transformResponse: (response: any): AdminPaytabsPaymentsState => {
                const payments = response.data || [];
                const state = adminPaytabsPaymentsAdapter.setAll(initialState, payments);
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
                        ...result.ids.map((id) => ({ type: 'AdminPayment' as const, id })), // Reusing 'AdminPayment' tag type or create new 'AdminPaytabsPayment'
                        { type: 'AdminPayment' as const, id: 'LIST_PAYTABS' },
                    ]
                    : [{ type: 'AdminPayment' as const, id: 'LIST_PAYTABS' }],
        }),

        // Get payments for a specific order
        getPaytabsPaymentsByOrder: builder.query<AdminPaytabsPayment[], number>({
            query: (orderId) => ({
                url: '/admin/paytabs/payments',
                params: { order_id: orderId },
            }),
            transformResponse: (response: any) => response.data || [],
            providesTags: (result, error, orderId) => [
                { type: 'AdminPayment' as const, id: `ORDER_PAYTABS_${orderId}` },
            ],
        }),

        // Note: The provided controller code describes the USER callback/checkout flow, not Admin actions.
        // Standard Admin actions (Refund) are defined below assuming standard route patterns if they were implemented.
        // If the backend doesn't support these yet, these endpoints will error.

        // Refund Payment
        refundPaytabsPayment: builder.mutation<any, { order_id: number; amount: number; tran_ref: string }>({
            query: ({ order_id, amount, tran_ref }) => ({
                url: `/admin/paytabs/payments/${order_id}/refund`,
                method: 'POST',
                body: { amount, tran_ref },
            }),
            invalidatesTags: (result, error, { order_id }) => [
                { type: 'AdminPayment' as const, id: 'LIST_PAYTABS' },
                { type: 'AdminPayment' as const, id: `ORDER_PAYTABS_${order_id}` },
                { type: 'Order' as const, id: order_id },
            ],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminPaytabsPaymentsQuery,
    useLazyGetAdminPaytabsPaymentsQuery,
    useGetPaytabsPaymentsByOrderQuery,
    useLazyGetPaytabsPaymentsByOrderQuery,
    useRefundPaytabsPaymentMutation,
} = adminPaytabsPaymentsSlice;

// Selectors
export const {
    selectAll: selectAllPaytabsPayments,
    selectById: selectPaytabsPaymentById,
    selectIds: selectPaytabsPaymentIds,
} = adminPaytabsPaymentsAdapter.getSelectors<RootState>(
    (state) =>
        adminPaytabsPaymentsSlice.endpoints.getAdminPaytabsPayments.select({})(state).data || initialState
);

export default adminPaytabsPaymentsSlice;
