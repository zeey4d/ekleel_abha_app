// store/features/admin/adminShippingSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminShipment {
    consignment_id: number;
    order_id: number;
    awb_number: string;
    reference_number: string;
    pickup_date: string;
    shipment_label?: string;
    status: string;
    date_added: string;
    // Joined from oc_order
    firstname?: string;
    lastname?: string;
    email?: string;
    telephone?: string;
    shipping_firstname?: string;
    shipping_lastname?: string;
    shipping_city?: string;
    shipping_address_1?: string;
    shipping_address_2?: string;
    shipping_postcode?: string;
    total?: number;
}

export interface AdminShipmentsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    order_id?: number;
    date_from?: string;
    date_to?: string;
}

export interface CreateShipmentPayload {
    order_id: number;
}

export interface CreateShipmentResponse {
    consignment_id: number;
    awb_number: string;
    order_id: number;
}

export interface BulkCreateShipmentsPayload {
    order_ids: number[];
}

export interface BulkCreateShipmentsResponse {
    success: Array<{
        order_id: number;
        awb_number: string;
        consignment_id: number;
    }>;
    failed: Array<{
        order_id: number;
        error: string;
    }>;
}

export interface TrackingInfo {
    consignment_id: number;
    order_id: number;
    awb_number: string;
    tracking: {
        events?: Array<{
            date: string;
            time: string;
            activity: string;
            location: string;
            details?: string;
        }>;
        current_status?: string;
        delivered_date?: string;
    };
}

export interface ShipmentStatus {
    consignment_id: number;
    order_id: number;
    awb_number: string;
    status: string;
}

export interface CancelShipmentPayload {
    reason?: string;
}

export interface CancelShipmentResponse {
    awb_number: string;
    order_id: number;
}

export interface ShippingStatisticsParams {
    date_from?: string;
    date_to?: string;
}

export interface ShippingStatistics {
    total_shipments: number;
    today_shipments: number;
    pending_pickup: number;
    by_status: Array<{
        status: string;
        count: number;
    }>;
    period: {
        from: string;
        to: string;
    };
}

export interface SmsaCity {
    name: string;
    code?: string;
    [key: string]: any;
}

export interface SmsaRetail {
    id?: string | number;
    name: string;
    city: string;
    address?: string;
    phone?: string;
    location?: string;
    [key: string]: any;
}

export interface SmsaShippingCharge {
    amount: number;
    currency: string;
    description?: string;
    [key: string]: any;
}

export interface ShippingChargesParams {
    city: string;
    country?: string;
}

export interface AdminShipmentsState extends EntityState<AdminShipment, number> {
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
const adminShipmentsAdapter = createEntityAdapter<AdminShipment, number>({
    selectId: (shipment) => shipment.consignment_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminShipmentsState = adminShipmentsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminShippingSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all shipments (admin)
        getAdminShipments: builder.query<AdminShipmentsState, AdminShipmentsParams>({
            query: (params) => ({
                url: '/admin/shipping',
                params,
            }),
            transformResponse: (response: any): AdminShipmentsState => {
                const data = response.data?.data || response.data || [];
                const state = adminShipmentsAdapter.setAll(initialState, data);
                return {
                    ...state,
                    pagination: response.data?.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminShipment' as const, id })),
                        { type: 'AdminShipment' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminShipment' as const, id: 'LIST' }],
        }),

        // Get single shipment by consignment ID (admin)
        getAdminShipment: builder.query<AdminShipment, number>({
            query: (id) => `/admin/shipping/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminShipment' as const, id }],
        }),

        // Get shipment by order ID
        getShipmentByOrder: builder.query<AdminShipment, number>({
            query: (orderId) => `/admin/shipping/order/${orderId}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result) =>
                result
                    ? [{ type: 'AdminShipment' as const, id: result.consignment_id }]
                    : [],
        }),

        // Create shipment for an order
        createShipment: builder.mutation<CreateShipmentResponse, CreateShipmentPayload>({
            query: (data) => ({
                url: '/admin/shipping/smsa/create',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [
                { type: 'AdminShipment' as const, id: 'LIST' },
                { type: 'AdminOrder' as const, id: 'LIST' },
            ],
        }),

        // Bulk create shipments for multiple orders
        bulkCreateShipments: builder.mutation<BulkCreateShipmentsResponse, BulkCreateShipmentsPayload>({
            query: (data) => ({
                url: '/admin/shipping/smsa/bulk-create',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [
                { type: 'AdminShipment' as const, id: 'LIST' },
                { type: 'AdminOrder' as const, id: 'LIST' },
            ],
        }),

        // Get shipment label (PDF)
        getShipmentLabel: builder.query<string, string>({
            queryFn: async (awb, _api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: `/admin/shipping/smsa/label/${awb}`,
                    headers: { 'Accept': 'application/pdf' },
                    responseHandler: (response) => response.arrayBuffer(),
                });

                if (result.error) {
                    let errorData = (result.error as any).data;

                    // Decode ArrayBuffer error response (from responseHandler)
                    if (errorData && typeof errorData === 'object' && errorData.byteLength !== undefined) {
                        try {
                            const text = new TextDecoder().decode(errorData);
                            try {
                                errorData = JSON.parse(text);
                            } catch {
                                errorData = text;
                            }
                        } catch (e) {
                            // Decoding failed, keep original
                        }
                    }

                    // Ensure error is serializable by extracting only serializable properties
                    const serializedError = {
                        status: (result.error as any).status || 'FETCH_ERROR',
                        data: typeof errorData === 'object'
                            ? JSON.parse(JSON.stringify(errorData || {}))
                            : errorData,
                        error: (result.error as any).error || 'Failed to fetch shipment label',
                    };
                    return { error: serializedError };
                }

                const buffer = result.data as ArrayBuffer;
                const bytes = new Uint8Array(buffer);

                // Debug logging to help identify response format issues
                try {
                    const snippet = new TextDecoder().decode(bytes.slice(0, 50));
                    console.log('Shipment Label Response (First 50 chars):', snippet);
                } catch (e) {
                    console.log('Shipment Label Response (Binary, first 20 bytes):', bytes.slice(0, 20));
                }

                // Helper to check magic bytes
                const startsWith = (magic: number[]) => {
                    if (bytes.length < magic.length) return false;
                    for (let i = 0; i < magic.length; i++) {
                        if (bytes[i] !== magic[i]) return false;
                    }
                    return true;
                };

                // Search for %PDF in first 100 bytes (handling potential BOM or whitespace)
                let isPdf = false;
                const limit = Math.min(bytes.length, 100);
                for (let i = 0; i < limit - 3; i++) {
                    if (bytes[i] === 37 && bytes[i + 1] === 80 && bytes[i + 2] === 68 && bytes[i + 3] === 70) {
                        isPdf = true;
                        break;
                    }
                }

                if (isPdf) {
                    const blob = new Blob([buffer], { type: 'application/pdf' });
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve({ data: reader.result as string });
                        reader.readAsDataURL(blob);
                    });
                }

                // Check for Base64 PDF signature (JVBER) -> [74, 86, 66, 69, 82]
                // Also search in first 100 bytes just in case
                let isBase64 = false;
                for (let i = 0; i < limit - 4; i++) {
                    if (bytes[i] === 74 && bytes[i + 1] === 86 && bytes[i + 2] === 66 && bytes[i + 3] === 69 && bytes[i + 4] === 82) {
                        isBase64 = true;
                        break;
                    }
                }

                if (isBase64) {
                    const textDecoder = new TextDecoder();
                    const base64String = textDecoder.decode(buffer).trim();
                    // Clean up any potential garbage before/after if found by regex?
                    // For now, assume entire body is the base64 string if signature found.
                    return { data: `data:application/pdf;base64,${base64String}` };
                }

                if (startsWith([123])) {
                    const textDecoder = new TextDecoder();
                    const jsonText = textDecoder.decode(buffer);
                    try {
                        const json = JSON.parse(jsonText);
                        console.error('Label API JSON Error:', json);
                        // Ensure error data is serializable
                        return {
                            error: {
                                status: 400,
                                data: JSON.parse(JSON.stringify(json)), // Force serializable
                                error: json.message || 'Error fetching label'
                            }
                        };
                    } catch (e) {/* ignore */ }
                }

                // Fallback: Try as binary PDF anyway
                console.warn('Label format unrecognized, attempting binary PDF fallback.');
                const blob = new Blob([buffer], { type: 'application/pdf' });
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve({ data: reader.result as string });
                    reader.readAsDataURL(blob);
                });
            },
            // Keep unused data for 5s to avoid caching large strings unnecessarily after unmount
            keepUnusedDataFor: 5,
        }),

        // Track shipment by AWB number
        trackShipment: builder.query<TrackingInfo, string>({
            // query: (awb) => `/admin/shipping/smsa/track/${awb}`, // Real implementation
            query: (awb) => `/admin/shipping/smsa/track/293125595511`, // Test AWB
            transformResponse: (response: any) => {
                const data = response.data;
                const rawTracking = data.tracking;

                // Handle if rawTracking is array (direct events) or object
                let events: any[] = [];
                if (Array.isArray(rawTracking)) {
                    events = rawTracking;
                } else if (rawTracking && Array.isArray(rawTracking.events)) {
                    events = rawTracking.events;
                }

                // Normalize keys (SMSA usually XML PascalCase) and sort if needed
                const normalizedEvents = events.map((e: any) => ({
                    date: e.date || e.Date,
                    time: e.time || e.Time,
                    activity: e.activity || e.Activity,
                    location: e.location || e.Location || e.City,
                    details: e.details || e.Details
                }));

                // Determine status from the most recent event (first one)
                let currentStatus = data.status || 'Unknown';
                if (normalizedEvents.length > 0) {
                    // Optimistically use the latest activity
                    currentStatus = normalizedEvents[0].activity;
                }

                return {
                    ...data,
                    tracking: {
                        events: normalizedEvents,
                        current_status: currentStatus
                    }
                };
            },
            providesTags: (result) =>
                result
                    ? [{ type: 'AdminShipment' as const, id: result.consignment_id }]
                    : [],
        }),

        // Get shipment status by AWB number
        getShipmentStatus: builder.query<ShipmentStatus, string>({
            query: (awb) => `/admin/shipping/smsa/status/${awb}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result) =>
                result
                    ? [{ type: 'AdminShipment' as const, id: result.consignment_id }]
                    : [],
        }),

        // Cancel shipment by AWB number
        cancelShipment: builder.mutation<CancelShipmentResponse, { awb: string; reason?: string }>({
            query: ({ awb, reason }) => ({
                url: `/admin/shipping/smsa/cancel/${awb}`,
                method: 'POST',
                body: { reason },
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminShipment' as const, id: 'LIST' }],
        }),

        // Get shipping statistics
        getShippingStatistics: builder.query<ShippingStatistics, ShippingStatisticsParams>({
            query: (params) => ({
                url: '/admin/shipping/statistics',
                params,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminShipment' as const, id: 'STATISTICS' }],
        }),

        // Get supported cities
        getCities: builder.query<SmsaCity[], void>({
            query: () => '/admin/shipping/smsa/cities',
            transformResponse: (response: any) => response.data,
            keepUnusedDataFor: 3600, // Cache for 1 hour
        }),

        // Get retail points for a city
        getRetails: builder.query<SmsaRetail[], string>({
            query: (city) => ({
                url: '/admin/shipping/smsa/retails',
                params: { city },
            }),
            transformResponse: (response: any) => response.data,
        }),

        // Get shipping charges
        getShipCharges: builder.query<SmsaShippingCharge[], ShippingChargesParams>({
            query: (params) => ({
                url: '/admin/shipping/smsa/charges',
                method: 'POST',
                body: params,
            }),
            transformResponse: (response: any) => response.data,
        }),
    }),
});

// Export hooks
export const {
    useGetAdminShipmentsQuery,
    useLazyGetAdminShipmentsQuery,
    useGetAdminShipmentQuery,
    useLazyGetAdminShipmentQuery,
    useGetShipmentByOrderQuery,
    useLazyGetShipmentByOrderQuery,
    useCreateShipmentMutation,
    useBulkCreateShipmentsMutation,
    useGetShipmentLabelQuery,
    useLazyGetShipmentLabelQuery,
    useTrackShipmentQuery,
    useLazyTrackShipmentQuery,
    useGetShipmentStatusQuery,
    useLazyGetShipmentStatusQuery,
    useCancelShipmentMutation,
    useGetShippingStatisticsQuery,
    useGetCitiesQuery,
    useLazyGetCitiesQuery,
    useGetRetailsQuery,
    useLazyGetRetailsQuery,
    useGetShipChargesQuery,
    useLazyGetShipChargesQuery,
} = adminShippingSlice;

// Selectors
export const {
    selectAll: selectAllAdminShipments,
    selectById: selectAdminShipmentById,
    selectIds: selectAdminShipmentIds,
} = adminShipmentsAdapter.getSelectors<RootState>(
    (state) =>
        adminShippingSlice.endpoints.getAdminShipments.select({})(state).data || initialState
);

export default adminShippingSlice;
