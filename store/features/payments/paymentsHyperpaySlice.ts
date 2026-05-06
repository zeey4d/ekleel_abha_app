// src/features/payments/paymentsSlice.ts
import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { CreateOrderPayload } from '@/store/types';

// --- Types ---

/**
 * Supported payment methods with brand-specific entity IDs
 * Maps to backend getEntityIdForPaymentMethod()
 */
export type PaymentMethod =
  | 'credit_card'
  | 'visa'
  | 'master'
  | 'mastercard'
  | 'amex'
  | 'mada'
  | 'apple_pay'
  | 'applepay'
  | 'google_pay'
  | 'googlepay'
  | 'stc_pay'
  | 'stcpay'
  | 'stc_bank'
  | 'tamara'
  | 'tabby'
  | 'paypal'
  | 'sadad'
  | 'cod';

/**
 * Payment method to HyperPay brand mapping
 * Used by frontend to determine which brands to request from HyperPay widget
 */
export const PAYMENT_METHOD_BRANDS: Record<string, string> = {
  credit_card: 'VISA MASTER',
  visa: 'VISA',
  master: 'MASTER',
  mastercard: 'MASTER',
  amex: 'AMEX',
  mada: 'MADA',
  apple_pay: 'APPLEPAY',
  applepay: 'APPLEPAY',
  google_pay: 'GOOGLEPAY',
  googlepay: 'GOOGLEPAY',
  stc_pay: 'STC_PAY',
  stcpay: 'STC_PAY',
  stc_bank: 'STC_BANK',
  tamara: 'TAMARA',
  tabby: 'TABBY',
  paypal: 'PAYPAL',
  sadad: 'SADAD',
};

/**
 * Request payment data for hosted checkout
 * Supports 'DB' (Debit) and 'PA' (Pre-Authorization)
 */
export interface PaymentRequestData {
  order_id?: number; // Optional because we might create order during request
  payment_type?: 'DB' | 'PA'; // Defaults to 'DB' (Debit) on backend
}

/**
 * Post-action payment data (for capture, rebill, refund, reverse)
 */
export interface PaymentPostActionData {
  amount: number;
  currency: 'SAR' | 'USD' | 'EUR' | 'AED';
}

/**
 * Post-action request payload including order ID
 */
export interface PaymentPostActionRequest extends PaymentPostActionData {
  orderId: number;
}

/**
 * HyperPay payment response structure (Phase 1)
 * Backend returns: { checkoutId, orderId, order }
 */
export interface HyperPayPaymentResponse {
  // Direct response fields (what backend actually returns)
  checkoutId?: string;
  orderId?: number;
  order?: {
    order_id: number;
    invoice_no: number;
    invoice_prefix: string;
    customer_id: number;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    total: string;
    order_status_id: number;
    payment_method: string;
    shipping_method: string;
    currency_code: string;
    date_added: string;
    [key: string]: any;
  };

  /**
   * Base URL for the HyperPay script (e.g. test vs live)
   * Returned by backend to ensure environment consistency
   */
  baseUrl?: string;

  // Legacy/wrapped response fields (for backwards compatibility)
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    checkout_id?: string;
    order_id?: number;
    orderId?: number;
    result?: {
      code: string;
      description: string;
    };
    [key: string]: any;
  };
  status?: number;
}

/**
 * Verify payment response (Phase 3)
 * Backend returns: { status, orderId, message, details }
 */
export interface VerifyPaymentResponse {
  status: 'paid' | 'failed' | 'pending';
  orderId: number;
  message: string;
  details?: string;
  raw_response?: {
    id?: string;
    paymentType?: string;
    paymentBrand?: string;
    amount?: string;
    currency?: string;
    result?: {
      code: string;
      description: string;
    };
    card?: {
      bin?: string;
      last4Digits?: string;
      holder?: string;
      expiryMonth?: string;
      expiryYear?: string;
    };
    [key: string]: any;
  };
}

/**
 * Payment status response (for status check endpoints)
 */
export interface PaymentStatusResponse {
  success: boolean;
  message?: string;
  orderId?: number; // Return orderId at top level
  data?: {
    id?: string;
    paymentType?: string;
    paymentBrand?: string;
    amount?: string;
    currency?: string;
    descriptor?: string;
    result?: {
      code: string;
      description: string;
    };
    card?: {
      bin?: string;
      last4Digits?: string;
      holder?: string;
      expiryMonth?: string;
      expiryYear?: string;
    };
    [key: string]: any;
  };
  status?: number;
}

/**
 * Payment callback response
 */
export interface PaymentCallbackResponse {
  success?: boolean;
  message: string;
  order_id: number | null;
  result: {
    id?: string;
    paymentType?: string;
    paymentBrand?: string;
    amount?: string;
    currency?: string;
    result?: {
      code: string;
      description: string;
    };
    [key: string]: any;
  };
}

/**
 * Payment error response
 */
export interface PaymentErrorResponse {
  success: false;
  errors?: Record<string, string[]>;
  message?: string;
}

// --- RTK Query API Slice Injection ---
export const paymentsSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /**
     * Request Payment (Hosted Checkout)
     * Creates a new checkout session with HyperPay
     * Supports 'DB' (Debit) and 'PA' (Pre-Authorization)
     */
    requestPayment: builder.mutation<HyperPayPaymentResponse, CreateOrderPayload>({
      query: (paymentData) => ({
        url: '/payment/hyperpay/orders/create',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Order'],
    }),

    /**
     * Verify Payment
     * Verifies payment status with HyperPay and updates order
     * Backend returns: { status, orderId, message, details }
     */
    verifyPayment: builder.query<VerifyPaymentResponse, { resourcePath: string; orderId: string }>({
      query: ({ resourcePath, orderId }) => ({
        url: '/payment/hyperpay/verify',
        params: { resourcePath, orderId },
      }),
      providesTags: (result, error, { orderId }) => [
        { type: 'Order' as const, id: orderId },
      ],
    }),

    /**
     * Capture Payment (CP)
     * Captures a previously pre-authorized (PA) payment
     */
    capturePayment: builder.mutation<HyperPayPaymentResponse, PaymentPostActionRequest>({
      query: ({ orderId, ...paymentData }) => ({
        url: `/admin/hyperpay/payments/${orderId}/capture`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order' as const, id: orderId },
        'Order',
      ],
    }),

    /**
     * Rebill Payment (RB)
     * Charges again using a previous authorization
     */
    rebillPayment: builder.mutation<HyperPayPaymentResponse, PaymentPostActionRequest>({
      query: ({ orderId, ...paymentData }) => ({
        url: `/admin/hyperpay/payments/${orderId}/rebill`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order' as const, id: orderId },
        'Order',
      ],
    }),

    /**
     * Refund Payment (RF)
     * Refunds a captured or debited payment
     */
    refundPayment: builder.mutation<HyperPayPaymentResponse, PaymentPostActionRequest>({
      query: ({ orderId, ...paymentData }) => ({
        url: `/admin/hyperpay/payments/${orderId}/refund`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order' as const, id: orderId },
        'Order',
      ],
    }),

    /**
     * Reverse Payment (RV)
     * Cancels/voids a pre-authorized payment
     */
    reversePayment: builder.mutation<HyperPayPaymentResponse, PaymentPostActionRequest>({
      query: ({ orderId, ...paymentData }) => ({
        url: `/admin/hyperpay/payments/${orderId}/reverse`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order' as const, id: orderId },
        'Order',
      ],
    }),

    /**
     * Get Payment Status by Order ID
     * Checks the current payment status for an order
     */
    getPaymentStatusByOrder: builder.query<PaymentStatusResponse, number>({
      query: (orderId) => `/payment/hyperpay/status/order/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: 'Order' as const, id: orderId },
      ],
    }),

    /**
     * Process Payment Callback
     * Called by HyperPay after payment completion
     * The checkout ID is passed as a query parameter
     */
    processPaymentCallback: builder.query<PaymentCallbackResponse, string>({
      query: (checkoutId) => `/payment/hyperpay/callback?id=${checkoutId}`,
      // Callback updates the order, so invalidate order cache
      async onQueryStarted(checkoutId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.order_id) {
            // Invalidate the specific order to refresh its data
            dispatch(
              apiSlice.util.invalidateTags([
                { type: 'Order', id: data.order_id },
                'Order',
              ])
            );
          }
        } catch (err) {
          console.error('Payment callback error:', err);
        }
      },
    }),
  }),
});

// Export auto-generated hooks
export const {
  useRequestPaymentMutation,
  useVerifyPaymentQuery,
  useLazyVerifyPaymentQuery,
  useCapturePaymentMutation,
  useRebillPaymentMutation,
  useRefundPaymentMutation,
  useReversePaymentMutation,
  useGetPaymentStatusByOrderQuery,
  useLazyGetPaymentStatusByOrderQuery,
  useProcessPaymentCallbackQuery,
  useLazyProcessPaymentCallbackQuery,
} = paymentsSlice;

// --- Memoized Selectors ---

/**
 * Creates a selector for payment status by order ID
 * Usage: const selectStatus = makeSelectPaymentStatusByOrder(orderId);
 */
export const makeSelectPaymentStatusByOrder = (orderId: number) =>
  createSelector(
    [(state: any) => paymentsSlice.endpoints.getPaymentStatusByOrder.select(orderId)(state)],
    (result) => ({
      data: result?.data ?? null,
      isLoading: result?.isLoading ?? false,
      isError: result?.isError ?? false,
      error: result?.error ?? null,
    })
  );

/**
 * Helper to check if a payment was successful based on result code
 * HyperPay success codes start with '000.'
 */
export const isPaymentSuccessful = (resultCode?: string): boolean => {
  return resultCode?.startsWith('000.') ?? false;
};

/**
 * Payment type labels for UI display
 */
export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  DB: 'Debit',
  PA: 'Pre-Authorization',
  CP: 'Capture',
  RB: 'Rebill',
  RF: 'Refund',
  RV: 'Reversal',
};

/**
 * Payment status labels for UI display
 */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  success: 'Success',
  failed: 'Failed',
  captured: 'Captured',
  rebilled: 'Rebilled',
  refunded: 'Refunded',
  reversed: 'Reversed',
  pending: 'Pending',
};

export default paymentsSlice;