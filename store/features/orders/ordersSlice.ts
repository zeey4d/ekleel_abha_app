// src/features/orders/ordersSlice.ts
import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';
import { cartSlice } from '../cart/cartSlice';

import {
  OrderItem,
  OrderTotal,
  OrderHistory,
  OrderAddress,
  Order,
  CreateOrderPayload,
  GetOrdersParams,
  RequestCancellationPayload,
  RequestReturnRefundPayload,
  PaginatedResponse,
} from '@/store/types';


export interface OrderState extends EntityState<Order, string | number> {
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | any;
}

// --- Entity Adapter for Orders ---
const ordersAdapter = createEntityAdapter<Order, string | number>({
  selectId: (order: Order) => order.order_id ?? order.id,
  sortComparer: (a: Order, b: Order) =>
    new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialOrdersState: OrderState = ordersAdapter.getInitialState({
  loading: false,
  error: null,
  currentOrder: null,
  pagination: undefined,
});

// --- RTK Query API Slice Injection ---
export const ordersSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // --- Create Order from Cart (Checkout) ---
    // Note: For online payment, use paymentsSlice.requestPayment instead
    // This endpoint is primarily for COD orders
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (orderData) => ({
        url: '/orders/create',
        method: 'POST',
        body: orderData,
      }),
      // Backend returns { message: string, order: Order } or { message: string, data: { order_id, ... } }
      transformResponse: (response: any): Order => {
        // Handle different response shapes
        if (response.order) {
          return response.order;
        }
        if (response.data) {
          // If backend returns HyperPay style with data wrapper
          return {
            order_id: response.data.order_id || response.data.orderId,
            ...response.data
          } as Order;
        }
        return response;
      },
      // Optimistic update for order creation
      async onQueryStarted(orderData, { dispatch, queryFulfilled }) {
        try {
          const { data: newOrder } = await queryFulfilled;

          // Update orders list
          dispatch(
            ordersSlice.util.updateQueryData('getOrders', { page: 1, limit: 10 }, (draft: OrderState) => {
              ordersAdapter.addOne(draft, newOrder);
            })
          );

          // Clear cart after successful order
          dispatch(cartSlice.util.invalidateTags([{ type: 'Cart', id: 'CURRENT' }]));
        } catch (err: any) {
          const errorMessage = err?.error?.data?.message || err?.error?.data?.error || err?.message || 'Unknown error';
          const status = err?.error?.status || 'N/A';
          console.error(`Failed to create order (${status}): ${errorMessage}`, err);
        }
      },
      invalidatesTags: [{ type: 'Order' as const, id: 'LIST' }],
    }),

    // --- Get User Orders ---
    getOrders: builder.query<OrderState, GetOrdersParams>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/orders',
        params: { page, limit }
      }),
      transformResponse: (responseData: PaginatedResponse<Order> | any): OrderState => {
        // Normalize the array response
        // Ensure each order has order_id set
        const orders = (responseData.data || []).map((order: any) => ({
          ...order,
          order_id: order.order_id ?? order.id,
        }));
        const state = ordersAdapter.setAll(initialOrdersState, orders);
        return {
          ...state,
          pagination: {
            ...responseData.meta,
            total_pages: responseData.meta?.last_page ?? responseData.meta?.total_pages
          }
        };
      },
      providesTags: (result, error, arg) =>
        result
          ? [...result.ids.map((id) => ({ type: 'Order' as const, id })), { type: 'Order' as const, id: 'LIST' }]
          : [{ type: 'Order' as const, id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep for 5 minutes since orders don't change frequently
    }),

    // --- Get Order Details ---
    getOrderDetails: builder.query<Order, string | number>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: any): Order => {
        // Handle { data: Order } or direct Order
        const order = response.data || response;
        return {
          ...order,
          order_id: order.order_id ?? order.id,
        };
      },
      providesTags: (result, error, id) => [{ type: 'Order' as const, id }],
      keepUnusedDataFor: 300,
    }),

    // --- Request Order Cancellation ---
    requestOrderCancellation: builder.mutation<{ message: string }, RequestCancellationPayload>({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'POST',
        body: { reason }
      }),
      // Optimistic update for order cancellation request
      async onQueryStarted({ orderId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          ordersSlice.util.updateQueryData('getOrderDetails', orderId, (draft: Order) => {
            if (draft.status_id !== undefined) {
              draft.status_id = 7; // Canceled status ID
              draft.status = 'Canceled';
            }
          })
        );

        try {
          await queryFulfilled;
        } catch (err) {
          patchResult.undo();
          console.error('Failed to request order cancellation:', err);
        }
      },
      invalidatesTags: (result, error, { orderId }) => [{ type: 'Order' as const, id: orderId }],
    }),

    // --- Request Return/Refund ---
    requestReturnRefund: builder.mutation<{ message: string }, RequestReturnRefundPayload>({
      query: ({ id, ...returnData }) => ({
        url: `/orders/${id}/return`,
        method: 'POST',
        body: returnData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order' as const, id }],
    }),

    // --- Download Invoice ---
    downloadInvoice: builder.query<Blob, string | number>({
      query: (id) => ({
        url: `/orders/${id}/invoice`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: (result, error, id) => [{ type: 'Order' as const, id }],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderDetailsQuery,
  useRequestOrderCancellationMutation,
  useRequestReturnRefundMutation,
  useDownloadInvoiceQuery,
} = ordersSlice;

// --- Memoized Selectors ---
// Selector for orders
export const {
  selectAll: selectAllOrders,
  selectById: selectOrderById,
  selectIds: selectOrderIds,
} = ordersAdapter.getSelectors<RootState>((state) =>
  ordersSlice.endpoints.getOrders.select({ page: 1, limit: 10 })(state).data || initialOrdersState
);

// Selector for processing orders
export const selectProcessingOrders = createSelector(
  [selectAllOrders],
  (orders) => orders.filter(order =>
    order.status_id === 2 || order.status_id === 3 // Processing, Shipped
  )
);

// Selector for completed orders
export const selectCompletedOrders = createSelector(
  [selectAllOrders],
  (orders) => orders.filter(order =>
    order.status_id === 4 || order.status_id === 5 // Delivered, Complete
  )
);

// Selector for orders with issues
export const selectOrdersWithIssues = createSelector(
  [selectAllOrders],
  (orders) => orders.filter(order =>
    order.status_id === 7 || order.status_id === 12 // Canceled, Return Processing
  )
);

// Selector for orders pagination
export const selectOrdersPagination = (state: RootState) => {
  const ordersResult = ordersSlice.endpoints.getOrders.select({ page: 1, limit: 10 })(state);
  return ordersResult.data?.pagination || null;
};

export default ordersSlice;