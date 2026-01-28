// store/features/admin/adminCitiesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminCity {
    city_id: number;
    zone_id: number;
    name: string;
    status: number;
    zone_name?: string;
}

export interface AdminCitiesParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
    zone_id?: number;
}

export interface CreateCityPayload {
    zone_id: number;
    name: string;
    status: number;
}

export interface UpdateCityPayload {
    id: number;
    data: Partial<CreateCityPayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminCitiesState extends EntityState<AdminCity, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminCitiesAdapter = createEntityAdapter<AdminCity, number>({
    selectId: (city) => city.city_id,
    sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialState: AdminCitiesState = adminCitiesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminCitiesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all cities (admin)
        getAdminCities: builder.query<AdminCitiesState, AdminCitiesParams>({
            query: (params) => ({
                url: '/admin/cities',
                params,
            }),
            transformResponse: (response: any): AdminCitiesState => {
                const state = adminCitiesAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminCity' as const, id })),
                        { type: 'AdminCity' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminCity' as const, id: 'LIST' }],
        }),

        // Get single city (admin)
        getAdminCity: builder.query<AdminCity, number>({
            query: (id) => `/admin/cities/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminCity' as const, id }],
        }),

        // Create city
        createAdminCity: builder.mutation<AdminCity, CreateCityPayload>({
            query: (data) => ({
                url: '/admin/cities',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminCity' as const, id: 'LIST' }],
        }),

        // Update city
        updateAdminCity: builder.mutation<AdminCity, UpdateCityPayload>({
            query: ({ id, data }) => ({
                url: `/admin/cities/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminCity' as const, id },
                { type: 'AdminCity' as const, id: 'LIST' },
            ],
        }),

        // Delete city
        deleteAdminCity: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/cities/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminCity' as const, id },
                { type: 'AdminCity' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete cities
        bulkDeleteAdminCities: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/cities/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminCity' as const, id: 'LIST' }],
        }),

        // Bulk update city status
        bulkUpdateAdminCitiesStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/cities/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminCity' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminCitiesQuery,
    useGetAdminCityQuery,
    useCreateAdminCityMutation,
    useUpdateAdminCityMutation,
    useDeleteAdminCityMutation,
    useBulkDeleteAdminCitiesMutation,
    useBulkUpdateAdminCitiesStatusMutation,
} = adminCitiesSlice;

// Selectors
export const {
    selectAll: selectAllAdminCities,
    selectById: selectAdminCityById,
    selectIds: selectAdminCityIds,
} = adminCitiesAdapter.getSelectors<RootState>(
    (state) =>
        adminCitiesSlice.endpoints.getAdminCities.select({})(state).data || initialState
);

export default adminCitiesSlice;
