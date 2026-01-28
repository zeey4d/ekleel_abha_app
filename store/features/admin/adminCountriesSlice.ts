// store/features/admin/adminCountriesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminCountry {
    country_id: number;
    name: string;
    iso_code_2: string;
    iso_code_3: string;
    address_format?: string;
    postcode_required: number;
    status: number;
}

export interface AdminCountriesParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
}

export interface CreateCountryPayload {
    name: string;
    iso_code_2: string;
    iso_code_3: string;
    address_format?: string;
    postcode_required: number;
    status: number;
}

export interface UpdateCountryPayload {
    id: number;
    data: Partial<CreateCountryPayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminCountriesState extends EntityState<AdminCountry, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminCountriesAdapter = createEntityAdapter<AdminCountry, number>({
    selectId: (country) => country.country_id,
    sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialState: AdminCountriesState = adminCountriesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminCountriesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all countries (admin)
        getAdminCountries: builder.query<AdminCountriesState, AdminCountriesParams>({
            query: (params) => ({
                url: '/admin/countries',
                params,
            }),
            transformResponse: (response: any): AdminCountriesState => {
                const state = adminCountriesAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminCountry' as const, id })),
                        { type: 'AdminCountry' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminCountry' as const, id: 'LIST' }],
        }),

        // Get single country (admin)
        getAdminCountry: builder.query<AdminCountry, number>({
            query: (id) => `/admin/countries/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminCountry' as const, id }],
        }),

        // Create country
        createAdminCountry: builder.mutation<AdminCountry, CreateCountryPayload>({
            query: (data) => ({
                url: '/admin/countries',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminCountry' as const, id: 'LIST' }],
        }),

        // Update country
        updateAdminCountry: builder.mutation<AdminCountry, UpdateCountryPayload>({
            query: ({ id, data }) => ({
                url: `/admin/countries/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminCountry' as const, id },
                { type: 'AdminCountry' as const, id: 'LIST' },
            ],
        }),

        // Delete country
        deleteAdminCountry: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/countries/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminCountry' as const, id },
                { type: 'AdminCountry' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete countries
        bulkDeleteAdminCountries: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/countries/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminCountry' as const, id: 'LIST' }],
        }),

        // Bulk update country status
        bulkUpdateAdminCountriesStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/countries/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminCountry' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminCountriesQuery,
    useGetAdminCountryQuery,
    useCreateAdminCountryMutation,
    useUpdateAdminCountryMutation,
    useDeleteAdminCountryMutation,
    useBulkDeleteAdminCountriesMutation,
    useBulkUpdateAdminCountriesStatusMutation,
} = adminCountriesSlice;

// Selectors
export const {
    selectAll: selectAllAdminCountries,
    selectById: selectAdminCountryById,
    selectIds: selectAdminCountryIds,
} = adminCountriesAdapter.getSelectors<RootState>(
    (state) =>
        adminCountriesSlice.endpoints.getAdminCountries.select({})(state).data || initialState
);

export default adminCountriesSlice;
