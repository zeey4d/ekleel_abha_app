// src/features/payments/paymentsPaytabsSlice.ts
import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { CreateOrderPayload } from '@/store/types';

// --- Types ---

/**
 * PayTabs Payment Request Data
 */
export interface PayTabsPaymentRequest {
    order_id?: number;
    payment_method?: string;
    shipping_address_id?: number;
    shipping_method?: string;
    comment?: string;
    guest_session_id?: string;
    return_url?: string;
    coupon_code?: string;
    loyalty_points_redeem?: number;
}

/**
 * PayTabs Payment Response (Initiate Checkout)
 * Returned by backend
 */
export interface PayTabsPaymentResponse {
    redirect_url: string;
    tran_ref: string;
    order_id: number;
    breakdown?: Record<string, { title: string; value: number }>;
    message?: string; // If error
    error?: string; // If error
}

/**
 * PayTabs Verify Response
 */
export interface PayTabsVerifyResponse {
    status: 'success' | 'failed' | 'pending' | 'unknown' | 'error';
    order_id: number | null;
    message: string;
    tran_ref: string;
    paytabs_error?: string;
}

// --- Admin Interfaces ---

export interface PayTabsPaymentRecord {
    id: number;
    order_id: number;
    cart_id: string | null;
    tran_ref: string;
    tran_type: string;
    amount: string;
    currency: string;
    status: string;
    resp_code: string | null;
    resp_message: string | null;
    payment_method: string | null;
    created_at: string;
    updated_at: string;
    order?: {
        order_id: number;
        firstname: string;
        lastname: string;
        email: string;
        total: string;
        date_added: string;
    };
    raw_response?: any;
}

export interface PayTabsAdminParams {
    page?: number;
    limit?: number;
    status?: string;
    order_id?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
}

export interface PayTabsTransactionRequest {
    order_id: number;
    amount: number;
    reason?: string;
}

/**
 * Payload sent to the backend verify endpoint.
 * Forwards all redirect params that PayTabs appends to the return URL.
 */
export interface PayTabsVerifyPayload {
    tranRef?: string;
    tran_ref?: string;
    [key: string]: string | undefined;
}

// --- RTK Query API Slice Injection ---
export const paymentsPaytabsSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        /**
         * Initiate PayTabs Checkout
         * Creates an order and returns the redirect URL for payment
         */
        initiatePaytabsCheckout: builder.mutation<PayTabsPaymentResponse, PayTabsPaymentRequest>({
            query: (paymentData) => ({
                url: '/payment/paytabs/checkout',
                method: 'POST',
                body: paymentData,
            }),
            invalidatesTags: ['Order'],
        }),

        /**
         * Verify PayTabs Payment (Query - kept for backwards compatibility)
         * @deprecated Use verifyPaytabsPaymentMutation instead
         */
        verifyPaytabsPayment: builder.query<PayTabsVerifyResponse, { tranRef: string }>({
            query: ({ tranRef }) => ({
                url: '/payment/paytabs/verify',
                method: 'POST',
                body: { tranRef }
            }),
            providesTags: (result, error, { tranRef }) => [
                { type: 'Order' as const, id: result?.order_id || 'UNKNOWN' },
            ],
            async onQueryStarted({ tranRef }, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.status === 'success' && data.order_id) {
                        dispatch(apiSlice.util.invalidateTags([{ type: 'Order', id: data.order_id }, 'Order']));
                    }
                } catch (err) {
                    // error handling
                }
            },
        }),

        /**
         * Verify PayTabs Payment (Mutation) — PREFERRED
         * Use this in the callback page. Mutations are never cached,
         * so every redirect from PayTabs triggers a fresh backend call.
         * Sends all query-string params PayTabs appended to the return URL.
         */
        verifyPaytabsCallback: builder.mutation<PayTabsVerifyResponse, PayTabsVerifyPayload>({
            query: (params) => ({
                url: '/payment/paytabs/verify',
                method: 'POST',
                body: params,
            }),
            invalidatesTags: (result) =>
                result?.order_id
                    ? [{ type: 'Order', id: result.order_id }, 'Order']
                    : ['Order'],
        }),

        // --- Admin Endpoints ---

        getPaytabsPayments: builder.query<any, PayTabsAdminParams>({
            query: (params) => ({
                url: '/admin/paytabs/payments',
                method: 'GET',
                params,
            }),
            providesTags: ['PayTabsAdmin' as any],
        }),

        getPaytabsPaymentDetails: builder.query<{ success: boolean; data: PayTabsPaymentRecord }, number>({
            query: (id) => `/admin/paytabs/payments/${id}`,
            providesTags: (result, error, id) => [{ type: 'PayTabsAdmin' as any, id }],
        }),

        verifyPaytabsStatus: builder.mutation<{ success: boolean; message: string; data: PayTabsPaymentRecord }, number>({
            query: (id) => ({
                url: `/admin/paytabs/payments/${id}/verify`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'PayTabsAdmin' as any, id }],
        }),

        refundPaytabsPayment: builder.mutation<{ success: boolean; message: string; data: any }, PayTabsTransactionRequest>({
            query: ({ order_id, amount, reason }) => ({
                url: `/admin/paytabs/payments/${order_id}/refund`,
                method: 'POST',
                body: { amount, reason },
            }),
            invalidatesTags: ['PayTabsAdmin' as any, 'Order'],
        }),

        voidPaytabsPayment: builder.mutation<{ success: boolean; message: string; data: any }, PayTabsTransactionRequest>({
            query: ({ order_id, amount, reason }) => ({
                url: `/admin/paytabs/payments/${order_id}/void`,
                method: 'POST',
                body: { amount, reason },
            }),
            invalidatesTags: ['PayTabsAdmin' as any, 'Order'],
        }),

        capturePaytabsPayment: builder.mutation<{ success: boolean; message: string; data: any }, PayTabsTransactionRequest>({
            query: ({ order_id, amount, reason }) => ({
                url: `/admin/paytabs/payments/${order_id}/capture`,
                method: 'POST',
                body: { amount, reason },
            }),
            invalidatesTags: ['PayTabsAdmin' as any, 'Order'],
        }),
    }),
});

// Export hooks
export const {
    useInitiatePaytabsCheckoutMutation,
    useVerifyPaytabsPaymentQuery,
    useLazyVerifyPaytabsPaymentQuery,
    useVerifyPaytabsCallbackMutation,
    useGetPaytabsPaymentsQuery,
    useGetPaytabsPaymentDetailsQuery,
    useVerifyPaytabsStatusMutation,
    useRefundPaytabsPaymentMutation,
    useVoidPaytabsPaymentMutation,
    useCapturePaytabsPaymentMutation,
} = paymentsPaytabsSlice;

export default paymentsPaytabsSlice;
