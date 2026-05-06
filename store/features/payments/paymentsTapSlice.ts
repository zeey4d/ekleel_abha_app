// src/features/payments/paymentsTapSlice.ts
import { apiSlice } from '../api/apiSlice';

// --- Types ---

/**
 * Tap Payment Request Data (for initiating checkout)
 * Matches PaymentTapController::initiateCheckout validation and usage
 */
/**
 * Tap Payment Request Data (for initiating checkout)
 * Matches PaymentTapController::initiateCheckout validation and usage
 */
export interface TapPaymentRequest {
    shipping_address_id?: number; // Required if address is not provided
    source_id: string;            // Token from Card SDK (Required)
    payment_method?: string;      // Optional in new controller (inferred from token?) but good to keep
    shipping_method?: string;     // Included in $request->all() for order creation
    comment?: string;             // Included in $request->all() for order creation
    guest_session_id?: string;    // Used for identifying guest users

    // Address fields for guest checkout (required if shipping_address_id is null)
    address?: {
        firstname: string;
        lastname: string;
        address_1: string;
        address_2?: string;
        city: string;
        postcode: string;
        country_id: number;
        zone_id: number;
    };
}

/**
 * Tap Payment Response (Initiate Checkout)
 * Returned by PaymentTapController::initiateCheckout
 */
export interface TapPaymentResponse {
    status: 'captured' | '3ds_required' | 'failed';
    redirect_url: string | null; // Null if captured immediately
    charge_id: string;
    order_id: number;
    message?: string;
    error?: string;
}

/**
 * Tap Callback/Verify Response
 * Returned by PaymentTapController::callback
 */
export interface TapCallbackResponse {
    status: 'success' | 'failed';
    order_id: number | null;
    message: string;
    charge_id: string;
}

/**
 * Tap Charge Status Response
 * Returned by PaymentTapController::getChargeStatus
 */
export interface TapChargeStatusResponse {
    charge_id: string;
    status: string;
    amount: number;
    currency: string;
    order_id: number | null;
    payment_method: string | null;
    response: {
        code: string;
        message: string;
    } | null;
}

/**
 * Tap Refund Request
 * Matches PaymentTapController::refund validation
 */
export interface TapRefundRequest {
    charge_id: string; // Required
    amount: number;    // Required
    currency?: string;
    reason?: string;
    description?: string;
}

/**
 * Tap Refund Response
 * Returned by PaymentTapController::refund
 */
export interface TapRefundResponse {
    message: string;
    refund_id: string;
    status: string;
    amount: number;
}

// --- RTK Query API Slice Injection ---
export const paymentsTapSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        /**
         * Initiate Tap Checkout
         * Calls POST /payment/tap/checkout
         */
        initiateTapCheckout: builder.mutation<TapPaymentResponse, TapPaymentRequest>({
            query: (paymentData) => ({
                url: '/payment/tap/checkout',
                method: 'POST',
                body: paymentData,
            }),
            invalidatesTags: ['Order'],
        }),

        /**
         * Verify Tap Payment (Callback)
         * Calls POST /payment/tap/callback
         * NOTE: If backend is configured with 'frontend_redirect_url', this endpoint might redirect.
         * The frontend callback page logic assumes this returns JSON.
         */
        verifyTapPayment: builder.mutation<TapCallbackResponse, { tap_id: string }>({
            query: ({ tap_id }) => ({
                url: '/payment/tap/callback',
                method: 'POST',
                body: { tap_id },
            }),
            invalidatesTags: (result) =>
                result?.order_id
                    ? [{ type: 'Order', id: result.order_id }, 'Order', 'Cart']
                    : ['Order', 'Cart'],
        }),

        /**
         * Get Tap Charge Status
         * Calls GET /payment/tap/charge/{id}
         */
        getTapChargeStatus: builder.query<TapChargeStatusResponse, string>({
            query: (chargeId) => ({
                url: `/payment/tap/charge/${chargeId}`,
                method: 'GET',
            }),
            providesTags: (result) =>
                result?.order_id
                    ? [{ type: 'Order', id: result.order_id }]
                    : [],
        }),

        /**
         * Refund Tap Payment (Admin Only)
         * Calls POST /payment/tap/refund
         */
        refundTapPayment: builder.mutation<TapRefundResponse, TapRefundRequest>({
            query: (refundData) => ({
                url: '/payment/tap/refund',
                method: 'POST',
                body: refundData,
            }),
            invalidatesTags: ['Order'],
        }),
    }),
});

// Export hooks
export const {
    useInitiateTapCheckoutMutation,
    useVerifyTapPaymentMutation,
    useGetTapChargeStatusQuery,
    useLazyGetTapChargeStatusQuery,
    useRefundTapPaymentMutation,
} = paymentsTapSlice;

export default paymentsTapSlice;
