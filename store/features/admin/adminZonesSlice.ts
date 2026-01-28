// store/features/admin/adminZonesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminZone {
    zone_id: number;
    country_id: number;
    name: string;
    code: string;
    status: number;
    country_name?: string;
}

export interface AdminZonesParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
    country_id?: number;
}

export interface CreateZonePayload {
    country_id: number;
    name: string;
    code: string;
    status: number;
}

export interface UpdateZonePayload {
    id: number;
    data: Partial<CreateZonePayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminZonesState extends EntityState<AdminZone, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminZonesAdapter = createEntityAdapter<AdminZone, number>({
    selectId: (zone) => zone.zone_id,
    sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialState: AdminZonesState = adminZonesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminZonesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all zones (admin)
        getAdminZones: builder.query<AdminZonesState, AdminZonesParams>({
            query: (params) => ({
                url: '/admin/zones',
                params,
            }),
            transformResponse: (response: any): AdminZonesState => {
                const state = adminZonesAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminZone' as const, id })),
                        { type: 'AdminZone' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminZone' as const, id: 'LIST' }],
        }),

        // Get single zone (admin)
        getAdminZone: builder.query<AdminZone, number>({
            query: (id) => `/admin/zones/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminZone' as const, id }],
        }),

        // Create zone
        createAdminZone: builder.mutation<AdminZone, CreateZonePayload>({
            query: (data) => ({
                url: '/admin/zones',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminZone' as const, id: 'LIST' }],
        }),

        // Update zone
        updateAdminZone: builder.mutation<AdminZone, UpdateZonePayload>({
            query: ({ id, data }) => ({
                url: `/admin/zones/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminZone' as const, id },
                { type: 'AdminZone' as const, id: 'LIST' },
            ],
        }),

        // Delete zone
        deleteAdminZone: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/zones/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminZone' as const, id },
                { type: 'AdminZone' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete zones
        bulkDeleteAdminZones: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/zones/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminZone' as const, id: 'LIST' }],
        }),

        // Bulk update zone status
        bulkUpdateAdminZonesStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/zones/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminZone' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminZonesQuery,
    useGetAdminZoneQuery,
    useCreateAdminZoneMutation,
    useUpdateAdminZoneMutation,
    useDeleteAdminZoneMutation,
    useBulkDeleteAdminZonesMutation,
    useBulkUpdateAdminZonesStatusMutation,
} = adminZonesSlice;

// Selectors
export const {
    selectAll: selectAllAdminZones,
    selectById: selectAdminZoneById,
    selectIds: selectAdminZoneIds,
} = adminZonesAdapter.getSelectors<RootState>(
    (state) =>
        adminZonesSlice.endpoints.getAdminZones.select({})(state).data || initialState
);

export default adminZonesSlice;
