// store/features/admin/adminPaymentsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types directly matching the new HyperpayPayment model and controller response
export interface AdminPayment {
    id: number;
    order_id: number;
    checkout_id?: string;
    payment_id?: string;
    payment_type: 'DB' | 'PA' | 'CP' | 'RF' | 'RV' | 'RB'; // DB=Debit, PA=PreAuth, CP=Capture, RF=Refund, RV=Reverse, RB=Rebill
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'captured' | 'refunded' | 'reversed' | 'rebilled' | 'processed';
    result_code?: string;
    result_description?: string;
    brand?: string;
    card_bin?: string;
    card_last4?: string;
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

export interface PaymentStats {
    total_revenue: number;
    total_transactions: number;
    successful_payments: number;
    failed_payments: number;
    refunded_amount: number;
    pending_amount: number;
    by_method: Array<{
        method: string;
        count: number;
        amount: number;
    }>;
    by_status: Array<{
        status: string;
        count: number;
        amount: number;
    }>;
}

// Payload for payment actions (capture, refund, rebill, reverse)
export interface PaymentActionPayload {
    order_id: number;
    amount: number;
    currency: 'SAR' | 'USD' | 'EUR' | 'AED';
}

// Response from payment actions
export interface PaymentActionResponse {
    success: boolean;
    data: {
        id?: string;
        paymentType?: string;
        amount?: string;
        currency?: string;
        result?: {
            code?: string;
            description?: string;
        };
        [key: string]: any;
    };
    status: number;
}

export interface AdminPaymentsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    order_id?: number;
}

export interface AdminPaymentsState extends EntityState<AdminPayment, number> {
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
const adminPaymentsAdapter = createEntityAdapter<AdminPayment, number>({
    selectId: (payment) => payment.id,
    sortComparer: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
});

const initialState: AdminPaymentsState = adminPaymentsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminPaymentsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all payments (paginated with filters)
        getAdminPayments: builder.query<AdminPaymentsState, AdminPaymentsParams>({
            query: (params) => ({
                url: '/admin/payments',
                params,
            }),
            transformResponse: (response: any): AdminPaymentsState => {
                const payments = response.data || []; // Handle Laravel pagination 'data' field
                const state = adminPaymentsAdapter.setAll(initialState, payments);
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
                        { type: 'AdminPayment' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminPayment' as const, id: 'LIST' }],
        }),

        // Get single payment (using generic get if needed or filtering list)
        // Note: The new controller doesn't explicit show a 'show' method, so we might need to rely on list filtering or add one.
        // For now, we optionally keep this if we assume /admin/payments/{id} exists, otherwise we should remove it.
        // Given only 'index' and 'actions' are shown, we'll assume we fetch list. If specific view is needed, we filter the list.

        // Get payments for a specific order
        getPaymentsByOrder: builder.query<AdminPayment[], number>({
            query: (orderId) => ({
                url: '/admin/payments',
                params: { order_id: orderId },
            }),
            transformResponse: (response: any) => response.data || [],
            providesTags: (result, error, orderId) => [
                { type: 'AdminPayment' as const, id: `ORDER_${orderId}` },
            ],
        }),

        // Capture payment (CP) - capture from pre-auth
        capturePayment: builder.mutation<PaymentActionResponse, PaymentActionPayload>({
            query: ({ order_id, amount, currency }) => ({
                url: `/admin/payments/${order_id}/capture`,
                method: 'POST',
                body: { amount, currency },
            }),
            invalidatesTags: (result, error, { order_id }) => [
                { type: 'AdminPayment' as const, id: 'LIST' },
                { type: 'AdminPayment' as const, id: `ORDER_${order_id}` },
                { type: 'AdminOrder' as const, id: order_id },
            ],
        }),

        // Refund payment (RF) - refund a captured or debited payment
        refundPayment: builder.mutation<PaymentActionResponse, PaymentActionPayload>({
            query: ({ order_id, amount, currency }) => ({
                url: `/admin/payments/${order_id}/refund`,
                method: 'POST',
                body: { amount, currency },
            }),
            invalidatesTags: (result, error, { order_id }) => [
                { type: 'AdminPayment' as const, id: 'LIST' },
                { type: 'AdminPayment' as const, id: `ORDER_${order_id}` },
                { type: 'AdminOrder' as const, id: order_id },
            ],
        }),

        // Rebill payment (RB) - charge again using previous authorization
        rebillPayment: builder.mutation<PaymentActionResponse, PaymentActionPayload>({
            query: ({ order_id, amount, currency }) => ({
                url: `/admin/payments/${order_id}/rebill`,
                method: 'POST',
                body: { amount, currency },
            }),
            invalidatesTags: (result, error, { order_id }) => [
                { type: 'AdminPayment' as const, id: 'LIST' },
                { type: 'AdminPayment' as const, id: `ORDER_${order_id}` },
                { type: 'AdminOrder' as const, id: order_id },
            ],
        }),

        // Reverse payment (RV) - cancel a pre-auth
        reversePayment: builder.mutation<PaymentActionResponse, PaymentActionPayload>({
            query: ({ order_id, amount, currency }) => ({
                url: `/admin/payments/${order_id}/reverse`,
                method: 'POST',
                body: { amount, currency },
            }),
            invalidatesTags: (result, error, { order_id }) => [
                { type: 'AdminPayment' as const, id: 'LIST' },
                { type: 'AdminPayment' as const, id: `ORDER_${order_id}` },
                { type: 'AdminOrder' as const, id: order_id },
            ],
        }),

        // Keep stats query if there's a stats endpoint (Controller code didn't show one, but slice had it. I'll comment it out or keep as placeholder if backend implements it separarely)
        getPaymentStatistics: builder.query<PaymentStats, void>({
            query: () => '/admin/payments/statistics',
            providesTags: ['PaymentStats']
        }),
    }),
});

// Export hooks
export const {
    useGetAdminPaymentsQuery,
    useLazyGetAdminPaymentsQuery,
    useGetPaymentsByOrderQuery,
    useLazyGetPaymentsByOrderQuery,
    useCapturePaymentMutation,
    useRefundPaymentMutation,
    useRebillPaymentMutation,
    useReversePaymentMutation,
    useGetPaymentStatisticsQuery,
} = adminPaymentsSlice;

// Selectors
export const {
    selectAll: selectAllAdminPayments,
    selectById: selectAdminPaymentById,
    selectIds: selectAdminPaymentIds,
} = adminPaymentsAdapter.getSelectors<RootState>(
    (state) =>
        adminPaymentsSlice.endpoints.getAdminPayments.select({})(state).data || initialState
);

export default adminPaymentsSlice;
