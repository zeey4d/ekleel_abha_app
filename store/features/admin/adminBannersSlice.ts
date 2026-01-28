// store/features/admin/adminBannersSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminBannerImage {
    banner_image_id: number;
    banner_id: number;
    language_id: number;
    title: string;
    link: string;
    image: string;
    image_url?: string;
    sort_order: number;
}

export interface AdminBanner {
    id: number;
    banner_id: number;
    name: string;
    banner_type_id: number;
    type_name?: string;
    type_code?: string;
    status: number;
    title_en?: string;
    link_en?: string;
    image_en?: string;
    image_en_url?: string;
    title_ar?: string;
    link_ar?: string;
    image_ar?: string;
    image_ar_url?: string;
    sort_order: number;
    images_count?: number;
    images?: AdminBannerImage[];
}

export interface AdminBannersParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
    banner_type_id?: number;
    language_id?: number;
}

export interface CreateBannerPayload {
    name: string;
    banner_type_id: number;
    status: boolean;
    title_en: string;
    link_en?: string;
    image_en: File;
    title_ar?: string;
    link_ar?: string;
    image_ar?: File;
    sort_order?: number;
}

export interface UpdateBannerPayload {
    id: number;
    data: {
        name?: string;
        banner_type_id?: number;
        status?: boolean;
        title_en?: string;
        link_en?: string;
        image_en?: File | string;
        title_ar?: string;
        link_ar?: string;
        image_ar?: File | string;
        sort_order?: number;
    };
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: boolean;
}

export interface BulkDeletePayload {
    ids: number[];
}

export interface AdminBannersState extends EntityState<AdminBanner, number> {
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

// Banner Type for dropdown
export interface BannerType {
    banner_type_id: number;
    code: string;
    name: string;
    width: number;
    height: number;
    description?: string;
}

export interface BannerFormData {
    banner_types: BannerType[];
    languages: Array<{ id: number; code: string; name: string }>;
}

// Helper function to convert banner payload to FormData
function createBannerFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (value instanceof File) {
            formData.append(key, value);
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else {
            formData.append(key, String(value));
        }
    });

    return formData;
}

// Check if payload contains files
function hasFiles(data: Record<string, any>): boolean {
    return data.image_en instanceof File || data.image_ar instanceof File;
}

// Entity Adapter
const adminBannersAdapter = createEntityAdapter<AdminBanner, number>({
    selectId: (banner) => banner.id,
    sortComparer: (a, b) => (a.sort_order - b.sort_order),
});

const initialState: AdminBannersState = adminBannersAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminBannersSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all banners (admin)
        getAdminBanners: builder.query<AdminBannersState, AdminBannersParams>({
            query: (params) => ({
                url: '/admin/banners',
                params,
            }),
            transformResponse: (response: any): AdminBannersState => {
                const paginatedData = response.data;
                const banners = paginatedData.data || [];
                const mappedBanners = banners.map((b: any) => ({
                    ...b,
                    id: b.banner_id
                }));
                const state = adminBannersAdapter.setAll(initialState, mappedBanners);
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
                        ...result.ids.map((id) => ({ type: 'AdminBanner' as const, id })),
                        { type: 'AdminBanner' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminBanner' as const, id: 'LIST' }],
        }),

        // Get single banner (admin)
        getAdminBanner: builder.query<AdminBanner, number>({
            query: (id) => `/admin/banners/${id}`,
            transformResponse: (response: any) => ({
                ...response.data,
                id: response.data.banner_id
            }), // Access 'data' key and map id
            providesTags: (result, error, id) => [{ type: 'AdminBanner' as const, id }],
        }),

        // Get form data for creating/editing banners (banner types, languages)
        getAdminBannerFormData: builder.query<BannerFormData, void>({
            query: () => '/admin/banners/create',
            transformResponse: (response: any) => response.data,
            keepUnusedDataFor: 3600, // Cache for 1 hour
        }),

        // Create banner (with FormData support for image uploads)
        createAdminBanner: builder.mutation<AdminBanner, CreateBannerPayload>({
            query: (data) => {
                const useFormData = hasFiles(data);
                const body = useFormData ? createBannerFormData(data) : data;

                return {
                    url: '/admin/banners',
                    method: 'POST',
                    body,
                    formData: useFormData,
                };
            },
            transformResponse: (response: any) => ({
                ...response.data,
                id: response.data.banner_id
            }),
            invalidatesTags: [{ type: 'AdminBanner' as const, id: 'LIST' }],
        }),

        // Update banner (with FormData support for image uploads)
        updateAdminBanner: builder.mutation<AdminBanner, UpdateBannerPayload>({
            query: ({ id, data }) => {
                const useFormData = hasFiles(data);
                const body = useFormData ? createBannerFormData(data) : data;

                // For FormData with PUT, we need to use POST with _method override
                if (useFormData) {
                    (body as FormData).append('_method', 'PUT');
                    return {
                        url: `/admin/banners/${id}`,
                        method: 'POST',
                        body,
                        formData: true,
                    };
                }

                return {
                    url: `/admin/banners/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            transformResponse: (response: any) => ({
                ...response.data,
                id: response.data.banner_id
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminBanner' as const, id },
                { type: 'AdminBanner' as const, id: 'LIST' },
            ],
        }),

        // Delete banner
        deleteAdminBanner: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/banners/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminBanner' as const, id },
                { type: 'AdminBanner' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete banners
        bulkDeleteAdminBanners: builder.mutation<{ success: boolean; message: string }, BulkDeletePayload>({
            query: (data) => ({
                url: '/admin/banners/bulk-delete',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminBanner' as const, id: 'LIST' }],
        }),

        // Bulk update banner status
        bulkUpdateAdminBannersStatus: builder.mutation<{ success: boolean; message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/banners/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminBanner' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminBannersQuery,
    useLazyGetAdminBannersQuery,
    useGetAdminBannerQuery,
    useGetAdminBannerFormDataQuery,
    useCreateAdminBannerMutation,
    useUpdateAdminBannerMutation,
    useDeleteAdminBannerMutation,
    useBulkDeleteAdminBannersMutation,
    useBulkUpdateAdminBannersStatusMutation,
} = adminBannersSlice;

// Selectors
export const {
    selectAll: selectAllAdminBanners,
    selectById: selectAdminBannerById,
    selectIds: selectAdminBannerIds,
} = adminBannersAdapter.getSelectors<RootState>(
    (state) =>
        adminBannersSlice.endpoints.getAdminBanners.select({})(state).data || initialState
);

export default adminBannersSlice;
