// store/features/admin/adminManufacturersSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminManufacturer {
    manufacturer_id: number;
    name: string;
    image?: string;
    sort_order: number;
    status?: number;
    products_count?: number;
}

export interface AdminManufacturersParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
}

export interface CreateManufacturerPayload {
    name: string;
    image?: string | File;  // Can be string path or File for upload
    sort_order?: number;
    store_id?: number;
}

export interface UpdateManufacturerPayload {
    id: number;
    data: {
        name?: string;
        image?: string | File;  // Can be string path or File for upload
        sort_order?: number;
    };
}

export interface BulkDeletePayload {
    ids: number[];
}

export interface AdminManufacturersState extends EntityState<AdminManufacturer, number> {
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

// Helper function to convert payload to FormData
function createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === 'image' && value instanceof File) {
            formData.append('image', value);
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });

    return formData;
}

// Check if payload contains files
function hasFiles(data: Record<string, any>): boolean {
    return data.image instanceof File;
}

// Entity Adapter
const adminManufacturersAdapter = createEntityAdapter<AdminManufacturer, number>({
    selectId: (manufacturer) => manufacturer.manufacturer_id,
    sortComparer: (a, b) => a.sort_order - b.sort_order,
});

const initialState: AdminManufacturersState = adminManufacturersAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminManufacturersSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all manufacturers (admin)
        getAdminManufacturers: builder.query<AdminManufacturersState, AdminManufacturersParams>({
            query: (params) => ({
                url: '/admin/manufacturers',
                params,
            }),
            transformResponse: (response: any): AdminManufacturersState => {
                const paginatedData = response.data;
                const manufacturers = paginatedData.data || [];
                const state = adminManufacturersAdapter.setAll(initialState, manufacturers);
                return {
                    ...state,
                    pagination: {
                        current_page: paginatedData.current_page,
                        last_page: paginatedData.last_page,
                        per_page: paginatedData.per_page,
                        total: paginatedData.total,
                        from: paginatedData.from,
                        to: paginatedData.to,
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminManufacturer' as const, id })),
                        { type: 'AdminManufacturer' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminManufacturer' as const, id: 'LIST' }],
        }),

        // Get single manufacturer (admin)
        getAdminManufacturer: builder.query<AdminManufacturer, number>({
            query: (id) => `/admin/manufacturers/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminManufacturer' as const, id }],
        }),

        // Create manufacturer (with FormData support for image uploads)
        createAdminManufacturer: builder.mutation<AdminManufacturer, CreateManufacturerPayload>({
            query: (data) => {
                const useFormData = hasFiles(data);
                const body = useFormData ? createFormData(data) : data;

                return {
                    url: '/admin/manufacturers',
                    method: 'POST',
                    body,
                    formData: useFormData,
                };
            },
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminManufacturer' as const, id: 'LIST' }],
        }),

        // Update manufacturer (with FormData support for image uploads)
        updateAdminManufacturer: builder.mutation<AdminManufacturer, UpdateManufacturerPayload>({
            query: ({ id, data }) => {
                const useFormData = hasFiles(data);
                const body = useFormData ? createFormData(data) : data;

                // For FormData with PUT, we need to use POST with _method override
                if (useFormData) {
                    (body as FormData).append('_method', 'PUT');
                    return {
                        url: `/admin/manufacturers/${id}`,
                        method: 'POST',
                        body,
                        formData: true,
                    };
                }

                return {
                    url: `/admin/manufacturers/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminManufacturer' as const, id },
                { type: 'AdminManufacturer' as const, id: 'LIST' },
            ],
        }),

        // Delete manufacturer
        deleteAdminManufacturer: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/manufacturers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminManufacturer' as const, id },
                { type: 'AdminManufacturer' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete manufacturers
        bulkDeleteAdminManufacturers: builder.mutation<{ success: boolean; message: string }, BulkDeletePayload>({
            query: (data) => ({
                url: '/admin/manufacturers/bulk-delete',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminManufacturer' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminManufacturersQuery,
    useLazyGetAdminManufacturersQuery,
    useGetAdminManufacturerQuery,
    useCreateAdminManufacturerMutation,
    useUpdateAdminManufacturerMutation,
    useDeleteAdminManufacturerMutation,
    useBulkDeleteAdminManufacturersMutation,
} = adminManufacturersSlice;

// Selectors
export const {
    selectAll: selectAllAdminManufacturers,
    selectById: selectAdminManufacturerById,
    selectIds: selectAdminManufacturerIds,
} = adminManufacturersAdapter.getSelectors<RootState>(
    (state) =>
        adminManufacturersSlice.endpoints.getAdminManufacturers.select({})(state).data || initialState
);

export default adminManufacturersSlice;

